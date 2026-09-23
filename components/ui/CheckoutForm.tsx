"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { getProductById } from "@/data/products";
import { formatPrice } from "@/lib/format";
import {
  formatCardInput,
  formatCvvInput,
  formatExpiryInput,
} from "@/lib/cardFormat";
import { useCartHydrated } from "@/lib/useCartHydrated";
import { useCartStore } from "@/store/cartStore";
import { useOrderStore } from "@/store/orderStore";
import type { AddressType } from "@/lib/types";
import { isValidEmail } from "@/lib/packingOrderStatus";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { AnimatedPaymentCard } from "@/components/ui/AnimatedPaymentCard";

const STEPS = ["Shipping", "Payment", "Review"] as const;

export function CheckoutForm() {
  const router = useRouter();
  const cartHydrated = useCartHydrated();
  const items = useCartStore((s) => s.items);
  const subtotal = useCartStore((s) => s.subtotal);
  const clearCart = useCartStore((s) => s.clearCart);
  const createOrder = useOrderStore((s) => s.createOrder);

  const [step, setStep] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardFlipped, setCardFlipped] = useState(false);
  const [error, setError] = useState("");
  const stepTopRef = useRef<HTMLDivElement>(null);
  const scrollOnNextRef = useRef(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    address: "",
    city: "",
    zip: "",
    addressType: "home" as AddressType,
    cardName: "",
    card: "",
    expiry: "",
    cvv: "",
  });

  const total = subtotal();

  useEffect(() => {
    if (!scrollOnNextRef.current) return;
    scrollOnNextRef.current = false;
    requestAnimationFrame(() => {
      stepTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, [step]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let next = value;

    if (name === "card") next = formatCardInput(value);
    if (name === "expiry") next = formatExpiryInput(value);
    if (name === "cvv") next = formatCvvInput(value);

    setForm((prev) => ({ ...prev, [name]: next }));
  };

  const validateStep = () => {
    if (step === 0) {
      if (!form.name || !form.email || !form.address || !form.city || !form.zip) {
        setError("Please fill in all shipping fields.");
        return false;
      }
      if (!isValidEmail(form.email)) {
        setError("Enter a valid email address.");
        return false;
      }
    }
    if (step === 1) {
      const cardDigits = form.card.replace(/\D/g, "");
      const expiryDigits = form.expiry.replace(/\D/g, "");
      if (cardDigits.length < 16) {
        setError("Enter a valid 16-digit card number.");
        return false;
      }
      if (expiryDigits.length < 4) {
        setError("Enter expiry as MM/YY.");
        return false;
      }
      if (form.cvv.length < 3) {
        setError("Enter a valid CVV.");
        return false;
      }
    }
    setError("");
    return true;
  };

  const nextStep = () => {
    if (!validateStep()) return;
    if (step === 0 && !form.cardName) {
      setForm((prev) => ({ ...prev, cardName: prev.name }));
    }
    scrollOnNextRef.current = true;
    setStep((s) => Math.min(s + 1, 2));
  };

  const prevStep = () => {
    setError("");
    setCardFlipped(false);
    setStep((s) => Math.max(s - 1, 0));
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;
    setIsProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    const order = createOrder({
      items: [...items],
      total,
      shipping: {
        name: form.name,
        email: form.email,
        address: form.address,
        city: form.city,
        zip: form.zip,
        addressType: form.addressType,
      },
    });
    clearCart();
    router.push(`/checkout/processing?orderId=${order.id}`);
  };

  if (!cartHydrated) {
    return (
      <div className="glass-card py-16 text-center">
        <p className="text-zinc-400">Loading cart…</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <ScrollReveal>
        <div className="glass-card py-16 text-center">
          <p className="mb-4 text-zinc-400">Your cart is empty.</p>
          <Link href="/shop" className="btn btn-primary">
            Continue Shopping
          </Link>
        </div>
      </ScrollReveal>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-5 lg:gap-8">
      <div className="lg:col-span-3">
        <div ref={stepTopRef} className="mb-6 flex scroll-mt-24 gap-1.5 sm:mb-8 sm:gap-2">
          {STEPS.map((label, i) => (
            <motion.button
              key={label}
              type="button"
              onClick={() => i < step && setStep(i)}
              whileTap={{ scale: 0.97 }}
              className={`flex flex-1 flex-col items-center gap-1.5 rounded-xl border p-2 transition-all sm:gap-2 sm:p-3 ${
                i === step
                  ? "border-cyan-500/40 bg-cyan-500/10"
                  : i < step
                    ? "border-emerald-500/30 bg-emerald-500/5"
                    : "border-white/8 bg-white/2"
              }`}
            >
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold sm:h-7 sm:w-7 sm:text-xs ${
                  i < step
                    ? "bg-emerald-500 text-zinc-900"
                    : i === step
                      ? "bg-cyan-400 text-zinc-900"
                      : "bg-white/10 text-zinc-500"
                }`}
              >
                {i < step ? "✓" : i + 1}
              </span>
              <span className="text-[10px] font-medium text-zinc-300 sm:text-xs">{label}</span>
            </motion.button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.3 }}
            className="glass-card p-4 sm:p-6 lg:p-8"
          >
            {step === 0 && (
              <div className="space-y-3">
                <h2 className="mb-3 text-base font-semibold text-zinc-100 sm:mb-4 sm:text-lg">Shipping Details</h2>
                <Input label="Full name" name="name" value={form.name} onChange={handleChange} />
                <Input label="Email" name="email" type="email" value={form.email} onChange={handleChange} />
                <Input label="Address" name="address" value={form.address} onChange={handleChange} />
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Input label="City" name="city" value={form.city} onChange={handleChange} />
                  <Input label="ZIP" name="zip" value={form.zip} onChange={handleChange} />
                </div>
                <div>
                  <p className="mb-2 text-xs font-medium text-zinc-400">Delivery destination</p>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {(["home", "office"] as const).map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setForm((prev) => ({ ...prev, addressType: type }))}
                        className={`rounded-xl border px-3 py-2.5 text-sm font-medium transition ${
                          form.addressType === type
                            ? "border-cyan-500/40 bg-cyan-500/10 text-cyan-200"
                            : "border-white/8 bg-white/2 text-zinc-400 hover:border-white/15"
                        }`}
                      >
                        {type === "home" ? "🏠 Home" : "🏢 Office"}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {step === 1 && (
              <div>
                <h2 className="mb-2 text-lg font-semibold text-zinc-100">Payment</h2>
                <p className="mb-4 text-xs text-zinc-500">Demo only — no real charges.</p>

                <AnimatedPaymentCard
                  fields={form}
                  flipped={cardFlipped}
                  onToggleFlip={() => setCardFlipped((f) => !f)}
                />

                <div className="space-y-3">
                  <Input
                    label="Name on card"
                    name="cardName"
                    placeholder="Person Name"
                    value={form.cardName}
                    onChange={handleChange}
                  />
                  <Input
                    label="Card number"
                    name="card"
                    placeholder="4242 4242 4242 4242"
                    value={form.card}
                    onChange={handleChange}
                    inputMode="numeric"
                    autoComplete="cc-number"
                  />
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <Input
                      label="Expiry"
                      name="expiry"
                      placeholder="MM/YY"
                      value={form.expiry}
                      onChange={handleChange}
                      onFocus={() => setCardFlipped(true)}
                      inputMode="numeric"
                      autoComplete="cc-exp"
                    />
                    <Input
                      label="CVV"
                      name="cvv"
                      placeholder="123"
                      value={form.cvv}
                      onChange={handleChange}
                      onFocus={() => setCardFlipped(true)}
                      inputMode="numeric"
                      autoComplete="cc-csc"
                    />
                  </div>
                </div>
              </div>
            )}
            {step === 2 && (
              <div>
                <h2 className="mb-4 text-lg font-semibold text-zinc-100">Review Order</h2>
                <p className="mb-2 text-sm text-zinc-400">Shipping to:</p>
                <p className="text-sm text-zinc-200">{form.name}</p>
                <p className="text-sm text-zinc-400">
                  {form.address}, {form.city} {form.zip}
                </p>
                <p className="mt-4 text-2xl font-bold gradient-text">{formatPrice(total)}</p>
              </div>
            )}

            {error && <p className="mt-4 text-sm text-rose-400">{error}</p>}

            <div className="mt-5 flex flex-col gap-3 sm:mt-6 sm:flex-row">
              {step > 0 && (
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.97 }}
                  onClick={prevStep}
                  className="btn btn-secondary w-full sm:flex-1"
                >
                  Back
                </motion.button>
              )}
              {step < 2 ? (
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.97 }}
                  onClick={nextStep}
                  className="btn btn-primary w-full sm:flex-1"
                >
                  Continue
                </motion.button>
              ) : (
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.97 }}
                  onClick={handleSubmit}
                  disabled={isProcessing}
                  className="btn btn-primary w-full sm:flex-1 disabled:opacity-50"
                >
                  {isProcessing ? "Processing…" : `Pay ${formatPrice(total)}`}
                </motion.button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <ScrollReveal className="lg:col-span-2" delay={0.1}>
        <aside className="glass-card p-4 sm:p-6 lg:sticky lg:top-24 lg:p-8">
          <h2 className="mb-4 text-lg font-semibold text-zinc-100">Your Items</h2>
          <ul className="mb-4 space-y-3">
            {items.map((item) => {
              const product = getProductById(item.productId);
              if (!product) return null;
              return (
                <motion.li
                  key={item.productId}
                  layout
                  className="flex justify-between text-sm"
                >
                  <span className="text-zinc-400">
                    {product.name} × {item.qty}
                  </span>
                  <span className="font-medium text-zinc-200">
                    {formatPrice(product.price * item.qty)}
                  </span>
                </motion.li>
              );
            })}
          </ul>
          <div className="flex justify-between border-t border-white/8 pt-4 font-semibold">
            <span className="text-zinc-300">Total</span>
            <span className="gradient-text">{formatPrice(total)}</span>
          </div>
        </aside>
      </ScrollReveal>
    </div>
  );
}

function Input({
  label,
  name,
  value,
  onChange,
  onFocus,
  type = "text",
  placeholder,
  inputMode,
  autoComplete,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFocus?: () => void;
  type?: string;
  placeholder?: string;
  inputMode?: "numeric" | "text" | "email";
  autoComplete?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-zinc-400">{label}</span>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        onFocus={onFocus}
        placeholder={placeholder}
        inputMode={inputMode}
        autoComplete={autoComplete}
        className="input-field"
      />
    </label>
  );
}
