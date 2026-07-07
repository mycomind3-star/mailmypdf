import { orderStatusLabels } from "@/lib/site-content";
import { Badge } from "./ui";

const tones: Record<string, "neutral" | "success" | "warning" | "danger" | "accent"> = {
  draft: "neutral",
  uploaded: "accent",
  priced: "accent",
  checkout_created: "warning",
  paid: "success",
  submitted_to_provider: "accent",
  provider_processing: "accent",
  mailed: "success",
  in_transit: "warning",
  delivered: "success",
  returned: "danger",
  failed_payment: "danger",
  failed_provider_submission: "warning",
  cancelled: "neutral",
  refunded: "neutral",
};

export function StatusBadge({ status }: { status: string }) {
  return <Badge tone={tones[status] ?? "neutral"}>{orderStatusLabels[status] ?? status}</Badge>;
}

