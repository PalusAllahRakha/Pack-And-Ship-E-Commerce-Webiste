import dynamic from "next/dynamic";
import { PageShell } from "@/components/ui/PageShell";

const OrderTracker = dynamic(() =>
  import("@/components/ui/OrderTracker").then((m) => ({ default: m.OrderTracker })),
);

interface OrderPageProps {
  params: Promise<{ orderId: string }>;
}

export default async function OrderPage({ params }: OrderPageProps) {
  const { orderId } = await params;

  return (
    <PageShell
      title="Order Tracking"
      subtitle="Live status updates — your package journey in real time."
    >
      <OrderTracker orderId={orderId} />
    </PageShell>
  );
}
