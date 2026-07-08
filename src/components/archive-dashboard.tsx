"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Button, Card, Input } from "./ui";
import { OrderTimeline } from "./order-timeline";
import { StatusBadge } from "./status-badge";
import { formatDate, formatMoney } from "@/lib/utils";
import {
  collectRecentContacts,
  collectSenderProfiles,
  getCustomerArchive,
  type ArchiveOrder,
} from "@/lib/customer-archive";
import { getProofLevelLabel } from "@/lib/proof-levels";
import { orderStatusLabels } from "@/lib/site-content";

type LiveOrder = {
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
  createdAt: string;
  senderName: string | null;
  senderAddressLine1: string | null;
  senderAddressLine2: string | null;
  senderCity: string | null;
  senderState: string | null;
  senderPostalCode: string | null;
  recipientAddressLine1: string | null;
  recipientAddressLine2: string | null;
  recipientPostalCode: string | null;
  downloadUrl: string | null;
  events: Array<{ eventType: string; message: string; createdAt: string }>;
};

function mapArchiveOrder(order: ArchiveOrder) {
  return {
    id: order.orderId,
    status: order.status,
    fileName: order.fileName,
    pageCount: order.pageCount,
    recipientName: order.recipientName,
    recipientCity: order.recipient.city,
    recipientState: order.recipientState,
    priceCents: order.priceCents,
    proofLevel: order.proofLevel,
    templateTitle: order.templateTitle,
    createdAt: order.createdAt,
    senderName: order.sender.name,
    senderAddressLine1: order.sender.line1,
    senderAddressLine2: order.sender.line2 ?? null,
    senderCity: order.sender.city,
    senderState: order.sender.state,
    senderPostalCode: order.sender.postalCode,
    recipientAddressLine1: order.recipient.line1,
    recipientAddressLine2: order.recipient.line2 ?? null,
    recipientPostalCode: order.recipient.postalCode,
    downloadUrl: null,
    events: [
      {
        eventType: "archive.saved",
        message: "Saved in the customer archive.",
        createdAt: order.createdAt,
      },
    ],
  } satisfies LiveOrder;
}

export function ArchiveDashboard() {
  const [archive, setArchive] = useState(() => getCustomerArchive());
  const [selectedId, setSelectedId] = useState(() => archive.orders[0]?.orderId ?? "");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [liveOrder, setLiveOrder] = useState<LiveOrder | null>(null);
  const [loadedOrderId, setLoadedOrderId] = useState<string | null>(null);
  const selectedArchiveOrder = archive.orders.find((order) => order.orderId === selectedId) ?? archive.orders[0];
  const selected = liveOrder ?? (selectedArchiveOrder ? mapArchiveOrder(selectedArchiveOrder) : null);
  const loading = Boolean(selectedArchiveOrder) && loadedOrderId !== selectedArchiveOrder.orderId;

  useEffect(() => {
    const sync = () => setArchive(getCustomerArchive());
    sync();
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  useEffect(() => {
    if (!selectedArchiveOrder) return;

    let active = true;
    fetch(`/api/orders/${selectedArchiveOrder.orderId}?token=${encodeURIComponent(selectedArchiveOrder.token)}`)
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Unable to load archived order.");
        }
        return (await response.json()) as LiveOrder;
      })
      .then((data) => {
        if (!active) return;
        setLiveOrder(data);
        setLoadedOrderId(selectedArchiveOrder.orderId);
      })
      .catch(() => {
        if (!active) return;
        setLiveOrder(mapArchiveOrder(selectedArchiveOrder));
        setLoadedOrderId(selectedArchiveOrder.orderId);
      })

    return () => {
      active = false;
    };
  }, [selectedArchiveOrder]);

  const filteredOrders = useMemo(() => {
    return archive.orders.filter((order) => {
      const matchesStatus = status === "all" || order.status === status;
      const haystack = [
        order.templateTitle,
        order.recipientName,
        order.status,
        order.proofLevel,
        order.fileName,
      ]
        .join(" ")
        .toLowerCase();
      return matchesStatus && haystack.includes(query.toLowerCase());
    });
  }, [archive.orders, query, status]);

  const senderProfiles = useMemo(() => collectSenderProfiles(archive), [archive]);
  const recentContacts = useMemo(() => collectRecentContacts(archive), [archive]);

  function clearArchive() {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem("proofpost.customerArchive.v1");
    setArchive(getCustomerArchive());
    setSelectedId("");
    setLiveOrder(null);
    setLoadedOrderId(null);
  }

  return (
    <div className="container-shell py-10 md:py-14">
      <div className="grid gap-8 xl:grid-cols-[230px_1fr]">
        <aside className="hidden xl:block">
          <div className="sticky top-24 space-y-4 rounded-3xl border border-[color:var(--border)] bg-white p-5 shadow-[0_20px_50px_rgba(15,39,66,0.04)]">
            <p className="serif-heading text-2xl font-normal text-[color:var(--foreground)]">ProofPost</p>
            <nav className="space-y-2 text-sm">
              {[
                { label: "Dashboard", href: "/" },
                { label: "Send Letter", href: "/send" },
                { label: "Templates", href: "/templates" },
                { label: "Archive", href: "/archive" },
                { label: "Settings", href: "/settings" },
              ].map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`block rounded-2xl px-4 py-3 font-medium transition ${
                    item.label === "Archive"
                      ? "bg-[color:var(--accent-soft)] text-[color:var(--foreground)]"
                      : "text-[color:var(--muted)] hover:bg-[color:var(--surface-muted)] hover:text-[color:var(--foreground)]"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-muted)] p-4 text-sm leading-6 text-[color:var(--muted)]">
              Saved letters, proof packets, sender profiles, and recent contacts stay here.
            </div>
            <Button href="/send" className="w-full">
              Send a Letter
            </Button>
          </div>
        </aside>

        <main>
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Archive</p>
            <h1 className="serif-heading mt-4 text-5xl font-normal leading-[0.95] text-[color:var(--foreground)] md:text-7xl">
              Your letter archive.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[color:var(--muted)]">
              Return to every completed letter, download the proof packet, and reuse sender and contact details without rebuilding from scratch.
            </p>
          </div>

          <div className="mt-10 grid gap-6 xl:grid-cols-[1.14fr_0.86fr]">
            <Card className="p-5">
              <div className="flex flex-wrap gap-3">
                <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search letters, recipients, or templates..." className="max-w-md" />
                <select
                  className="h-11 rounded-md border border-[color:var(--border)] bg-white px-3 text-sm text-[color:var(--foreground)]"
                  value={status}
                  onChange={(event) => setStatus(event.target.value)}
                >
                  <option value="all">All statuses</option>
                  {["paid", "submitted_to_provider", "provider_processing", "mailed", "delivered", "returned"].map((item) => (
                    <option key={item} value={item}>
                      {orderStatusLabels[item] ?? item}
                    </option>
                  ))}
                </select>
                <Button variant="secondary" onClick={clearArchive}>
                  Clear archive
                </Button>
              </div>

              <div className="mt-5 overflow-hidden rounded-2xl border border-[color:var(--border)]">
                <div className="grid grid-cols-[1fr_1fr_0.8fr_0.9fr_0.7fr] gap-3 border-b border-[color:var(--border)] bg-[color:var(--surface-muted)] px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                  <span>Date</span>
                  <span>Recipient</span>
                  <span>Template</span>
                  <span>Proof level</span>
                  <span>Amount</span>
                </div>
                <div className="max-h-[520px] overflow-auto bg-white">
                  {filteredOrders.length ? (
                    filteredOrders.map((order) => (
                      <button
                        key={order.orderId}
                        type="button"
                        onClick={() => {
                          setSelectedId(order.orderId);
                          setLiveOrder(null);
                        }}
                        className={`grid w-full grid-cols-[1fr_1fr_0.8fr_0.9fr_0.7fr] gap-3 border-b border-[color:var(--border)] px-4 py-4 text-left transition hover:bg-[color:var(--surface-muted)] ${
                          selected?.id === order.orderId ? "bg-[color:var(--accent-soft)]" : ""
                        }`}
                      >
                        <span className="text-sm text-[color:var(--foreground)]">{formatDate(order.createdAt)}</span>
                        <span className="truncate text-sm text-[color:var(--muted)]">{order.recipientName}</span>
                        <span className="truncate text-sm text-[color:var(--muted)]">{order.templateTitle}</span>
                        <span className="text-sm text-[color:var(--muted)]">{getProofLevelLabel(order.proofLevel)}</span>
                        <span className="text-sm font-medium text-[color:var(--foreground)]">{formatMoney(order.priceCents)}</span>
                      </button>
                    ))
                  ) : (
                    <div className="p-6 text-sm text-[color:var(--muted)]">
                      No archived letters yet. Send a letter to build your archive.
                    </div>
                  )}
                </div>
              </div>
            </Card>

            <div className="space-y-6">
              <Card className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold text-[color:var(--foreground)]">Letter record</h2>
                    <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">
                      {loading ? "Loading secure order details..." : selected ? `Order ${selected.id}` : "Select an archived letter."}
                    </p>
                  </div>
                  {selected ? <StatusBadge status={selected.status} /> : null}
                </div>

                {selected ? (
                  <div className="mt-5 space-y-4 text-sm leading-6 text-[color:var(--muted)]">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Field label="Template" value={selected.templateTitle} />
                      <Field label="Proof level" value={getProofLevelLabel(selected.proofLevel)} />
                      <Field label="Recipient" value={selected.recipientName} />
                      <Field label="Created" value={formatDate(selected.createdAt)} />
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Field label="File" value={selected.fileName} />
                      <Field label="Price" value={formatMoney(selected.priceCents ?? 0)} />
                    </div>
                    <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-muted)] p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Secure link</p>
                      <p className="mt-2 break-all text-xs text-[color:var(--muted)]">{`/orders/${selected.id}?token=${selectedArchiveOrder?.token ?? ""}`}</p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <Button
                        href={
                          selectedArchiveOrder?.token
                            ? `/orders/${selected.id}?token=${encodeURIComponent(selectedArchiveOrder.token)}`
                            : "#"
                        }
                        variant="dark"
                      >
                        Open order
                      </Button>
                      {selectedArchiveOrder?.token ? (
                        <Button href={`/api/orders/${selected.id}/proof-packet?token=${encodeURIComponent(selectedArchiveOrder.token)}`} variant="secondary">
                          Download proof packet
                        </Button>
                      ) : null}
                    </div>
                  </div>
                ) : null}
              </Card>

              <Card className="p-6">
                <h2 className="text-lg font-semibold text-[color:var(--foreground)]">Timeline</h2>
                <div className="mt-5">
                  <OrderTimeline events={selected?.events ?? []} />
                </div>
              </Card>
            </div>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-[color:var(--foreground)]">Saved sender profiles</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {senderProfiles.length ? (
                  senderProfiles.map((sender) => (
                    <div key={[sender.name, sender.line1].join("|")} className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-muted)] p-4">
                      <p className="font-semibold text-[color:var(--foreground)]">{sender.name}</p>
                      <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">
                        {sender.line1}
                        {sender.line2 ? <br /> : null}
                        {sender.line2 ?? null}
                        <br />
                        {sender.city}, {sender.state} {sender.postalCode}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-[color:var(--muted)]">Sender profiles will appear here after you complete a letter.</p>
                )}
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-lg font-semibold text-[color:var(--foreground)]">Recent contacts</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {recentContacts.length ? (
                  recentContacts.map((recipient) => (
                    <div key={[recipient.name, recipient.line1].join("|")} className="rounded-2xl border border-[color:var(--border)] bg-white p-4">
                      <p className="font-semibold text-[color:var(--foreground)]">{recipient.name}</p>
                      <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">
                        {recipient.line1}
                        {recipient.line2 ? <br /> : null}
                        {recipient.line2 ?? null}
                        <br />
                        {recipient.city}, {recipient.state} {recipient.postalCode}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-[color:var(--muted)]">Recent contacts will appear here after you send letters.</p>
                )}
              </div>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-muted)] p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</p>
      <p className="mt-2 text-sm font-medium text-[color:var(--foreground)]">{value ?? "—"}</p>
    </div>
  );
}
