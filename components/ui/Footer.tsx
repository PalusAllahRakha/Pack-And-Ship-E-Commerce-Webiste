import Link from "next/link";

const footerLinks = [
  { href: "/shop", label: "Shop" },
  { href: "/track", label: "Track Order" },
  { href: "/orders", label: "Delivery History" },
  { href: "/cart", label: "Cart" },
];

export function Footer() {
  return (
    <footer className="theme-footer mt-auto border-t">
      <div className="site-container flex flex-col items-center justify-between gap-6 py-8 sm:flex-row sm:py-10">
        <div>
          <p className="text-sm font-semibold theme-heading">Pack &amp; Ship</p>
          <p className="mt-1 text-xs theme-muted">
            3D animated e-commerce experience
          </p>
        </div>
        <nav className="flex flex-wrap justify-center gap-4 sm:gap-6">
          {footerLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm theme-subtext transition-colors hover:text-[var(--accent-cyan)]"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <p className="text-xs theme-muted">
          Built with Three.js &amp; React
        </p>
      </div>
    </footer>
  );
}
