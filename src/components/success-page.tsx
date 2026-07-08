"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card } from "./ui";
import { StatusBadge } from "./status-badge";
import { getDemoOrder } from "@/lib/demo-store";
import { saveCustomerOrder } from "@/lib/customer-archive";
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
    if (!activeOrder || !token) return;

    const sender = hasLiveStripe
      ? {
          name: activeOrder.senderName ?? "—",
          line1: (activeOrder as { senderAddressLine1?: string | null }).senderAddressLine1 ?? "—",
          city: (activeOrder as { senderCity?: string | null }).senderCity ?? "—",
          state: (activeOrder as { senderState?: string | null }).senderState ?? "—",
          postalCode: (activeOrder as { senderPostalCode?: string | null }).senderPostalCode ?? "—",
        }
      : {
          name: (demoOrder as { senderName?: string | null })?.senderName ?? "—",
          line1: (demoOrder as { senderAddressLine1?: string | null })?.senderAddressLine1 ?? "—",
          city: (demoOrder as { senderCity?: string | null })?.senderCity ?? "—",
          state: (demoOrder as { senderState?: string | null })?.senderState ?? "—",
          postalCode: (demoOrder as { senderPostalCode?: string | null })?.senderPostalCode ?? "—",
        };

    const recipient = hasLiveStripe
      ? {
          name: (activeOrder as { recipientName?: string | null }).recipientName ?? "—",
          line1: (activeOrder as { recipientAddressLine1?: string | null }).recipientAddressLine1 ?? "—",
          city: (activeOrder as { recipientCity?: string | null }).recipientCity ?? "—",
          state: (activeOrder as { recipientState?: string | null }).recipientState ?? "—",
          postalCode: (activeOrder as { recipientPostalCode?: string | null }).recipientPostalCode ?? "—",
        }
      : {
          name: (demoOrder as { recipientName?: string | null })?.recipientName ?? "—",
          line1: (demoOrder as { recipientAddressLine1?: string | null })?.recipientAddressLine1 ?? "—",
          city: (demoOrder as { recipientCity?: string | null })?.recipientCity ?? "—",
          state: (demoOrder as { recipientState?: string | null })?.recipientState ?? "—",
          postalCode: (demoOrder as { recipientPostalCode?: string | null })?.recipientPostalCode ?? "—",
        };

    saveCustomerOrder({
      orderId,
      token,
      createdAt: activeOrder.createdAt,
      status: activeOrder.status,
      proofLevel: (activeOrder as { proofLevel?: string | null }).proofLevel ?? "standard",
      templateTitle: (activeOrder as { templateTitle?: string | null }).templateTitle ?? "Formal business letter",
      recipientName: (activeOrder as { recipientName?: string | null }).recipientName ?? "—",
      recipientState: (activeOrder as { recipientState?: string | null }).recipientState ?? "—",
      priceCents: activeOrder.priceCents ?? 0,
      pageCount: activeOrder.pageCount ?? 0,
      fileName: activeOrder.fileName ?? "document.pdf",
      sender,
      recipient,
    });
  }, [activeOrder, demoOrder, hasLiveStripe, orderId, token]);

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
              <Info title="Template" value={(activeOrder as { templateTitle?: string | null }).templateTitle ?? "—"} />
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
            <Button href="/archive" variant="secondary">
              Open archive
            </Button>
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
