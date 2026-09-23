import Link from "next/link";
import { TrackOrderForm } from "@/components/ui/TrackOrderForm";
import { PageShell } from "@/components/ui/PageShell";

export default function TrackPage() {
  return (
    <PageShell
      title="Track Order"
      subtitle="Enter your order ID to see live delivery progress with animated status updates."
    >
      <TrackOrderForm />
      <p className="mt-8 text-center text-sm text-zinc-500">
        Need the full log?{" "}
        <Link href="/orders" className="font-medium text-cyan-400 hover:text-cyan-300">
          View delivery history →
        </Link>
      </p>
    </PageShell>
  );
}
