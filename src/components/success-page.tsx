"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card } from "./ui";
import { StatusBadge } from "./status-badge";
import { getDemoOrder } from "@/lib/demo-store";
import { formatMoney } from "@/lib/utils";
import { getProofLevelLabel } from "@/lib/proof-levels";

export function SuccessPage({
  orderId,
  token,
  sessionId,
}: {
  orderId: string;
  token: string | null;
  sessionId: string | null;
}) {
  const router = useRouter();
  const hasLiveStripe = Boolean(
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY &&
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
  const [order, setOrder] = useState<ReturnType<typeof getDemoOrder> | null>(null);

  useEffect(() => {
    if (!hasLiveStripe) return;

    if (!orderId || !token) {
      return;
    }

    let active = true;

    fetch(`/api/orders/${orderId}?token=${encodeURIComponent(token)}`)
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Order not found.");
        }
        return response.json();
      })
      .then((data) => {
        if (active) setOrder(data);
      })
      .catch(() => {
        if (active) setOrder(null);
      });

    return () => {
      active = false;
    };
  }, [hasLiveStripe, orderId, token]);

  const demoOrder = !hasLiveStripe ? (orderId ? getDemoOrder(orderId) ?? null : null) : null;
  const activeOrder = order ?? demoOrder;
  const proofPacketHref =
    hasLiveStripe && orderId && token ? `/api/orders/${orderId}/proof-packet?token=${encodeURIComponent(token)}` : null;

  useEffect(() => {
    if (!orderId || !token) return;
    const timer = window.setTimeout(() => {
      router.replace(`/orders/${orderId}?token=${token}`);
    }, 1800);
    return () => window.clearTimeout(timer);
  }, [orderId, router, token]);

  return (
    <div className="container-shell py-16">
      <div className="mx-auto max-w-2xl">
        <Card className="p-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[color:var(--accent-soft)] text-[color:var(--accent-strong)]">
            <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="m20 6-11 11-5-5" />
            </svg>
          </div>
          <h1 className="serif-heading mt-6 text-4xl font-normal text-[color:var(--foreground)]">Payment received.</h1>
          <p className="mt-4 text-base leading-7 text-[color:var(--muted)]">
            Your proof file is moving into archive processing. You’ll be redirected to the secure order page shortly.
          </p>
          <div className="mt-6 flex justify-center">
            <StatusBadge status={activeOrder?.status ?? "submitted_to_provider"} />
          </div>
          <div className="mt-6 rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-muted)] p-4 text-left text-sm text-[color:var(--muted)]">
            <p className="font-semibold text-[color:var(--foreground)]">Session</p>
            <p className="mt-1 break-all">{sessionId ?? "No session id provided."}</p>
            <p className="mt-3 font-semibold text-[color:var(--foreground)]">Next step</p>
            <p className="mt-1">
              We’ll show the order status page next. If anything needs attention, the order will move to manual review.
            </p>
          </div>
          {activeOrder ? (
            <div className="mt-6 grid gap-3 rounded-2xl border border-[color:var(--border)] bg-white p-4 text-left md:grid-cols-3">
              <Info title="File" value={activeOrder.fileName ?? "—"} />
              <Info title="Pages" value={`${activeOrder.pageCount ?? 0}`} />
              <Info title="Proof level" value={getProofLevelLabel((activeOrder as { proofLevel?: string | null }).proofLevel ?? "standard")} />
              <Info title="Price" value={formatMoney(activeOrder.priceCents ?? 0)} />
            </div>
          ) : null}
          <div className="mt-6 flex justify-center gap-3">
            <Button href={orderId && token ? `/orders/${orderId}?token=${token}` : "/send"} variant="secondary">
              Open order now
            </Button>
            {proofPacketHref ? (
              <Button href={proofPacketHref} variant="secondary">
                Download proof packet
              </Button>
            ) : null}
            <Button href="/send">Create a Proof File</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

function Info({ title, value }: { title: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{title}</p>
      <p className="mt-1 text-sm font-medium text-[color:var(--foreground)]">{value}</p>
    </div>
  );
}
