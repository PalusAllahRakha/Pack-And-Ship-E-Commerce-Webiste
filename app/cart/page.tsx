import { CartPageContent } from "@/components/ui/CartPageContent";
import { PageShell } from "@/components/ui/PageShell";

export default function CartPage() {
  return (
    <PageShell title="Cart" subtitle="Review your items before checkout.">
      <CartPageContent />
    </PageShell>
  );
}
