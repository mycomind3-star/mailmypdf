"use client";

import { useEffect, useState } from "react";
import { getDemoOrder } from "@/lib/demo-store";
import { saveCustomerOrder } from "@/lib/customer-archive";
import { formatDate, formatDateTime, formatMoney } from "@/lib/utils";
import { getProofLevelLabel } from "@/lib/proof-levels";
import { StatusBadge } from "./status-badge";
import { Button, Card } from "./ui";
import { OrderTimeline } from "./order-timeline";

type OrderPageProps = {
  orderId: string;
  token: string | null;
};

type LiveOrderResponse = {
  id: string;
  status: string;
  fileName: string | null;
  pageCount: number | null;
  recipientName: string | null;
  recipientCity: string | null;
  recipientState: string | null;
  priceCents: number | null;
  proofLevel: string | null;
  templateTitle: string | null;
  mailProvider: string | null;
  providerLetterId: string | null;
  providerTrackingNumber: string | null;
  providerExpectedDeliveryDate: string | null;
  providerTrackingEvents: Array<Record<string, unknown>>;
  addressVerificationStatus: string | null;
  createdAt: string;
  paidAt: string | null;
  submittedToProviderAt: string | null;
  mailedAt: string | null;
  deliveredAt: string | null;
  failedAt: string | null;
  lobExpectedDeliveryDate: string | null;
  lobTrackingEvents: Array<Record<string, unknown>>;
  downloadUrl: string | null;
  events: Array<{ eventType: string; message: string; createdAt: string }>;
  senderName: string | null;
  senderAddressLine1: string | null;
  senderAddressLine2: string | null;
  senderCity: string | null;
  senderState: string | null;
  senderPostalCode: string | null;
  recipientAddressLine1: string | null;
  recipientAddressLine2: string | null;
  recipientPostalCode: string | null;
};

const hasLiveStripe = Boolean(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY &&
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);

export function OrderPage({ orderId, token }: OrderPageProps) {
  const [order, setOrder] = useState<LiveOrderResponse | null>(null);
  const [loading, setLoading] = useState(hasLiveStripe && Boolean(token));
  const [error, setError] = useState("");

  useEffect(() => {
    if (!hasLiveStripe) return;

    if (!token) {
      return;
    }

    let active = true;

    fetch(`/api/orders/${orderId}?token=${encodeURIComponent(token)}`)
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("We could not open this order with the provided token.");
        }
        return (await response.json()) as LiveOrderResponse;
      })
      .then((data) => {
        if (active) setOrder(data);
      })
      .catch((caught) => {
        if (active) setError(caught instanceof Error ? caught.message : "We could not open this order.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [orderId, token]);

  const liveOrder = hasLiveStripe ? order : null;
  const demoOrder = !hasLiveStripe ? getDemoOrder(orderId) : undefined;
  const activeOrder = liveOrder ?? demoOrder;
  const accessError = hasLiveStripe && !token ? "We could not open this order with the provided token." : error;

  useEffect(() => {
    if (!activeOrder || !token) return;

    const sender = hasLiveStripe
      ? {
          name: activeOrder.senderName ?? "—",
          line1: activeOrder.senderAddressLine1 ?? "—",
          line2: "",
          city: activeOrder.senderCity ?? "—",
          state: activeOrder.senderState ?? "—",
          postalCode: activeOrder.senderPostalCode ?? "—",
        }
      : {
          name: demoOrder?.senderName ?? "—",
          line1: demoOrder?.senderAddressLine1 ?? "—",
          city: demoOrder?.senderCity ?? "—",
          state: demoOrder?.senderState ?? "—",
          postalCode: demoOrder?.senderPostalCode ?? "—",
        };

    const recipient = hasLiveStripe
      ? {
          name: activeOrder.recipientName ?? "—",
          line1: activeOrder.recipientAddressLine1 ?? "—",
          line2: (activeOrder as { recipientAddressLine2?: string | null }).recipientAddressLine2 ?? "",
          city: activeOrder.recipientCity ?? "—",
          state: activeOrder.recipientState ?? "—",
          postalCode: activeOrder.recipientPostalCode ?? "—",
        }
      : {
          name: demoOrder?.recipientName ?? "—",
          line1: demoOrder?.recipientAddressLine1 ?? "—",
          city: demoOrder?.recipientCity ?? "—",
          state: demoOrder?.recipientState ?? "—",
          postalCode: demoOrder?.recipientPostalCode ?? "—",
        };

    saveCustomerOrder({
      orderId: activeOrder.id,
      token,
      createdAt: activeOrder.createdAt,
      status: activeOrder.status,
      proofLevel: activeOrder.proofLevel ?? "standard",
      templateTitle: activeOrder.templateTitle ?? "Formal business letter",
      recipientName: activeOrder.recipientName ?? "—",
      recipientState: activeOrder.recipientState ?? "—",
      priceCents: activeOrder.priceCents ?? 0,
      pageCount: activeOrder.pageCount ?? 0,
      fileName: activeOrder.fileName ?? "document.pdf",
      sender,
      recipient,
    });
  }, [activeOrder, demoOrder, token]);

  if (loading) {
    return (
      <div className="container-shell py-16">
        <div className="max-w-xl">
          <h1 className="serif-heading text-4xl font-normal text-[color:var(--foreground)]">Loading order</h1>
          <p className="mt-4 text-base leading-7 text-[color:var(--muted)]">
            Fetching your secure order details.
          </p>
        </div>
      </div>
    );
  }

  if (!activeOrder || (!hasLiveStripe && (!token || token !== demoOrder?.token)) || accessError) {
    return (
          <div className="container-shell py-16">
        <div className="max-w-xl">
          <h1 className="serif-heading text-4xl font-normal text-[color:var(--foreground)]">Letter lookup</h1>
          <p className="mt-4 text-base leading-7 text-[color:var(--muted)]">
            {accessError || "We could not open this order with the provided token."}
          </p>
          <div className="mt-6 flex gap-3">
            <Button href="/send">Create a Proof File</Button>
            <Button href="/" variant="secondary">
              Return home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const downloadHref = hasLiveStripe
    ? liveOrder?.downloadUrl ?? "#"
    : demoOrder?.fileDataUrl ?? "data:application/pdf;base64,JVBERi0xLjQKJc...";
  const proofPacketHref =
    hasLiveStripe && token ? `/api/orders/${orderId}/proof-packet?token=${encodeURIComponent(token)}` : null;
  const providerTrackingEvents = activeOrder.providerTrackingEvents ?? [];

  return (
    <div className="container-shell py-10 md:py-14">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="serif-heading text-4xl font-normal text-[color:var(--foreground)] md:text-5xl">
            Your letter record
          </h1>
          <p className="mt-3 text-base leading-7 text-[color:var(--muted)]">
            Live order record for {activeOrder.id}. Only this token can open the order.
          </p>
        </div>
        <StatusBadge status={activeOrder.status} />
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-[1.02fr_0.98fr]">
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-[color:var(--foreground)]">Letter summary</h2>
            <dl className="mt-5 grid gap-4 sm:grid-cols-2">
              <SummaryItem label="File name" value={activeOrder.fileName ?? "—"} />
              <SummaryItem label="Page count" value={`${activeOrder.pageCount ?? 0} pages`} />
              <SummaryItem label="Recipient" value={activeOrder.recipientName ?? "—"} />
              <SummaryItem label="Recipient city/state" value={`${activeOrder.recipientCity ?? "—"}, ${activeOrder.recipientState ?? "—"}`} />
              <SummaryItem label="Proof level" value={getProofLevelLabel(activeOrder.proofLevel ?? "standard")} />
              <SummaryItem label="Template" value={activeOrder.templateTitle ?? "—"} />
              <SummaryItem label="Mail provider" value={activeOrder.mailProvider ?? "—"} />
              <SummaryItem label="Verification" value={activeOrder.addressVerificationStatus ?? "—"} />
              <SummaryItem label="Price" value={formatMoney(activeOrder.priceCents ?? 0)} />
              <SummaryItem label="Created" value={formatDate(activeOrder.createdAt)} />
            </dl>
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-semibold text-[color:var(--foreground)]">Addresses</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <AddressBlock
                title="Sender"
                lines={[
                  hasLiveStripe ? activeOrder.senderName ?? "—" : demoOrder?.senderName ?? "—",
                  hasLiveStripe ? activeOrder.senderAddressLine1 ?? "—" : demoOrder?.senderAddressLine1 ?? "—",
                  hasLiveStripe
                    ? `${activeOrder.senderCity ?? "—"}, ${activeOrder.senderState ?? "—"} ${activeOrder.senderPostalCode ?? "—"}`
                    : `${demoOrder?.senderCity ?? "—"}, ${demoOrder?.senderState ?? "—"} ${demoOrder?.senderPostalCode ?? "—"}`,
                ]}
              />
              <AddressBlock
                title="Recipient"
                lines={[
                  hasLiveStripe ? activeOrder.recipientName ?? "—" : demoOrder?.recipientName ?? "—",
                  hasLiveStripe ? activeOrder.recipientAddressLine1 ?? "—" : demoOrder?.recipientAddressLine1 ?? "—",
                  hasLiveStripe
                    ? `${activeOrder.recipientCity ?? "—"}, ${activeOrder.recipientState ?? "—"} ${activeOrder.recipientPostalCode ?? "—"}`
                    : `${demoOrder?.recipientCity ?? "—"}, ${demoOrder?.recipientState ?? "—"} ${demoOrder?.recipientPostalCode ?? "—"}`,
                ]}
              />
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-[color:var(--foreground)]">Actions</h2>
            <div className="mt-4 space-y-3">
              <Button href={downloadHref} className="w-full" variant="dark">
                Download PDF
              </Button>
              {proofPacketHref ? (
                <Button href={proofPacketHref} className="w-full" variant="secondary">
                  Download proof packet
                </Button>
              ) : null}
              <Button href="/send" className="w-full" variant="secondary">
                Create another proof file
              </Button>
              <Button href="/archive" className="w-full" variant="secondary">
                Open archive
              </Button>
              <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-muted)] p-4 text-sm text-[color:var(--muted)]">
                <p className="font-semibold text-[color:var(--foreground)]">Secure link</p>
                <p className="mt-2 break-all text-xs">{`/orders/${activeOrder.id}?token=${token ?? ""}`}</p>
                <p className="mt-3 text-xs leading-5">
                  Proof packet includes the original PDF, payment receipt, and order timeline.
                </p>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-[color:var(--foreground)]">Mail tracking</h2>
            <div className="mt-5 space-y-3 text-sm leading-6 text-[color:var(--muted)]">
              <p><span className="font-semibold text-[color:var(--foreground)]">Provider letter ID:</span> {activeOrder.providerLetterId ?? "—"}</p>
              <p><span className="font-semibold text-[color:var(--foreground)]">Tracking number:</span> {activeOrder.providerTrackingNumber ?? "—"}</p>
              <p><span className="font-semibold text-[color:var(--foreground)]">Expected delivery:</span> {activeOrder.providerExpectedDeliveryDate ?? activeOrder.lobExpectedDeliveryDate ?? "—"}</p>
              <p><span className="font-semibold text-[color:var(--foreground)]">Submitted:</span> {activeOrder.submittedToProviderAt ? formatDateTime(activeOrder.submittedToProviderAt) : "—"}</p>
              <p><span className="font-semibold text-[color:var(--foreground)]">Mailed:</span> {activeOrder.mailedAt ? formatDateTime(activeOrder.mailedAt) : "—"}</p>
              <p><span className="font-semibold text-[color:var(--foreground)]">Delivered:</span> {activeOrder.deliveredAt ? formatDateTime(activeOrder.deliveredAt) : "—"}</p>
              <p><span className="font-semibold text-[color:var(--foreground)]">Returned / issue:</span> {activeOrder.failedAt ? formatDateTime(activeOrder.failedAt) : "—"}</p>
            </div>
            {providerTrackingEvents.length ? (
              <div className="mt-5 space-y-3">
                {providerTrackingEvents.slice(-3).reverse().map((event, index) => (
                  <div
                    key={`${String(event.event_id ?? index)}`}
                    className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-muted)] p-4 text-sm leading-6 text-[color:var(--muted)]"
                  >
                    <p className="font-semibold text-[color:var(--foreground)]">{String(event.event_type ?? "Tracking update")}</p>
                    <p>{String(event.resource_status ?? event.status ?? "Update received")}</p>
                    <p className="text-xs text-slate-500">
                      {String(event.created_at ?? "") ? formatDateTime(String(event.created_at)) : "—"}
                    </p>
                  </div>
                ))}
              </div>
            ) : null}
          </Card>
          <OrderTimeline events={activeOrder.events ?? []} />
        </div>
      </div>
    </div>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-muted)] p-4">
      <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</dt>
      <dd className="mt-2 text-sm font-medium text-[color:var(--foreground)]">{value}</dd>
    </div>
  );
}

function AddressBlock({ title, lines }: { title: string; lines: string[] }) {
  return (
    <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-muted)] p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{title}</p>
      <div className="mt-3 space-y-1 text-sm leading-6 text-[color:var(--foreground)]">
        {lines.map((line) => (
          <p key={line}>{line}</p>
        ))}
      </div>
    </div>
  );
}
