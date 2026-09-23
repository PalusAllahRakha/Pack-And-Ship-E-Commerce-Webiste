import { Suspense } from "react";
import { ProcessingPageContent } from "@/components/ui/ProcessingPageContent";

export default function CheckoutProcessingPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
          Loading packing sequence…
        </div>
      }
    >
      <ProcessingPageContent />
    </Suspense>
  );
}
