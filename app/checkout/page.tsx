import { CheckoutForm } from "@/components/ui/CheckoutForm";
import { PageShell } from "@/components/ui/PageShell";

export default function CheckoutPage() {
  return (
    <PageShell
      title="Checkout"
      subtitle="Complete your order — then watch the 3D packing animation."
    >
      <CheckoutForm />
    </PageShell>
  );
}
