import { Suspense } from "react";
import { SendFlow } from "@/components/send-flow";
import { templates } from "@/lib/templates";

export default function SendPage() {
  return (
    <Suspense fallback={<div className="container-shell py-10 md:py-14">Loading send flow...</div>}>
      <SendFlow templates={templates} />
    </Suspense>
  );
}
