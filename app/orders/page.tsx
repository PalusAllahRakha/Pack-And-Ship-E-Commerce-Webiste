import dynamic from "next/dynamic";
import { PageShell } from "@/components/ui/PageShell";

const DeliveryHistory = dynamic(() =>
  import("@/components/ui/DeliveryHistory").then((m) => ({ default: m.DeliveryHistory })),
);

export default function OrdersHistoryPage() {
  return (
    <PageShell
      title="Delivery History"
      subtitle="Search and verify every order — customer, address, courier, and delivery timeline."
    >
      <DeliveryHistory />
    </PageShell>
  );
}
