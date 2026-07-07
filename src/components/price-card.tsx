import { formatMoney } from "@/lib/utils";
import { Card } from "./ui";

export function PriceCard({
  pageCount,
  priceCents,
  label,
}: {
  pageCount: number;
  priceCents: number;
  label: string;
}) {
  return (
    <Card className="p-6">
      <p className="text-sm font-semibold text-[color:var(--foreground)]">Simple pricing</p>
      <div className="mt-4 grid gap-6 md:grid-cols-[1fr_1fr] md:items-end">
        <div>
          <p className="text-sm text-[color:var(--muted)]">Starting at</p>
          <p className="serif-heading mt-2 text-5xl leading-none text-[color:var(--accent)]">
            {formatMoney(priceCents)}
          </p>
          <p className="mt-3 text-sm leading-6 text-[color:var(--muted)]">
            {label} for a {pageCount}-page PDF.
          </p>
        </div>
        <ul className="space-y-2 text-sm text-[color:var(--muted)]">
          <li>Print, envelope, and postage included</li>
          <li>U.S. First-Class Mail</li>
          <li>No subscription required</li>
          <li>Pay only when you send</li>
        </ul>
      </div>
    </Card>
  );
}
