"use client";

import { useEffect, useMemo, useState } from "react";
import { appendDemoEvent, listDemoOrders, patchDemoOrder, DemoOrder } from "@/lib/demo-store";
import { getProofLevelLabel } from "@/lib/proof-levels";
import { formatDate, formatMoney } from "@/lib/utils";
import { orderStatusLabels } from "@/lib/site-content";
import { StatusBadge } from "./status-badge";
import { Button, Card, Input, Textarea } from "./ui";

type AdminOrder = DemoOrder & {
  fileName?: string | null;
  fileSizeBytes?: number | null;
  senderAddressLine2?: string | null;
  recipientAddressLine2?: string | null;
  currency?: string | null;
  proofLevel?: string | null;
  templateTitle?: string | null;
  mailedAt?: string | null;
  deliveredAt?: string | null;
  failedAt?: string | null;
};

const useLiveAdmin = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY,
);
const useAutoSubmitToLob = process.env.AUTO_SUBMIT_TO_LOB === "true";

export function AdminDashboard() {
  const [orders, setOrders] = useState<AdminOrder[]>(() => (useLiveAdmin ? [] : listDemoOrders()));
  const [status, setStatus] = useState<string>("all");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string>(() => (useLiveAdmin ? "" : listDemoOrders()[0]?.id ?? ""));
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(useLiveAdmin);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!useLiveAdmin) return;

    let active = true;

    fetch("/api/admin/orders")
      .then(async (response) => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(String(data?.error ?? "Unable to load admin orders."));
        }
        return data as { orders: AdminOrder[] };
      })
      .then((data) => {
        if (!active) return;
        setOrders(data.orders ?? []);
        setSelectedId((current) => current || (data.orders?.[0]?.id ?? ""));
      })
      .catch((caught) => {
        if (!active) return;
        setError(caught instanceof Error ? caught.message : "Unable to load admin orders.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const filtered = useMemo(() => {
    return orders.filter((order) => {
      const matchesStatus = status === "all" || order.status === status;
      const haystack = [order.id, order.email, order.recipientName, order.recipientState, order.status]
        .join(" ")
        .toLowerCase();
      const matchesQuery = haystack.includes(query.toLowerCase());
      return matchesStatus && matchesQuery;
    });
  }, [orders, query, status]);

  const selected = filtered.find((order) => order.id === selectedId) ?? filtered[0] ?? orders[0];

  async function refresh() {
    if (useLiveAdmin) {
      setLoading(true);
      try {
        const response = await fetch("/api/admin/orders");
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(String(data?.error ?? "Unable to load admin orders."));
        }
        const nextOrders = (data as { orders: AdminOrder[] }).orders ?? [];
        setOrders(nextOrders);
        setSelectedId((current) => current || (nextOrders[0]?.id ?? ""));
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : "Unable to load admin orders.");
      } finally {
        setLoading(false);
      }
      return;
    }

    setOrders(listDemoOrders());
  }

  function retry() {
    if (!selected) return;
    patchDemoOrder(selected.id, {
      status: "provider_processing",
      submittedToProviderAt: new Date().toISOString(),
    });
    appendDemoEvent(selected.id, {
      eventType: "admin.retry",
      message: "Manual retry triggered from the admin dashboard.",
      createdAt: new Date().toISOString(),
    });
    void refresh();
  }

  function markRefunded() {
    if (!selected) return;
    patchDemoOrder(selected.id, { status: "refunded" });
    appendDemoEvent(selected.id, {
      eventType: "admin.refunded",
      message: "Order marked refunded by an admin.",
      createdAt: new Date().toISOString(),
    });
    void refresh();
  }

  function saveNote() {
    if (!selected) return;
    patchDemoOrder(selected.id, { adminNotes: note });
    appendDemoEvent(selected.id, {
      eventType: "admin.note",
      message: note || "Admin note updated.",
      createdAt: new Date().toISOString(),
    });
    setNote("");
    void refresh();
  }

  async function submitToLob() {
    if (!selected) return;

    try {
      setLoading(true);
      setError("");

      const response = await fetch(`/api/admin/orders/${selected.id}/submit-lob`, {
        method: "POST",
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(String(data?.error ?? "Unable to submit to Lob."));
      }

      await refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to submit to Lob.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container-shell py-10 md:py-14">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="serif-heading text-4xl font-normal text-[color:var(--foreground)] md:text-5xl">
            Admin dashboard
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[color:var(--muted)]">
            Review orders, catch failed submissions, and resolve proof-file issues without exposing raw provider payloads to the customer.
          </p>
          {useLiveAdmin ? (
            <p className="mt-3 text-sm font-medium text-[color:var(--accent-strong)]">
              Live admin mode is read-only unless manual Lob submission is enabled.
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button href="/admin/seo" variant="secondary">
            SEO hub
          </Button>
          <StatusBadge status={selected?.status ?? "draft"} />
        </div>
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="p-5">
          <div className="flex flex-wrap gap-3">
            <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by email, recipient, order ID..." className="max-w-md" />
            <select
              className="h-11 rounded-md border border-[color:var(--border)] bg-white px-3 text-sm text-[color:var(--foreground)]"
              value={status}
              onChange={(event) => setStatus(event.target.value)}
            >
              <option value="all">All statuses</option>
              {Object.keys(orderStatusLabels).map((key) => (
                <option key={key} value={key}>
                  {orderStatusLabels[key]}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-5 overflow-hidden rounded-2xl border border-[color:var(--border)]">
            <div className="grid grid-cols-[1.1fr_1fr_0.9fr_0.7fr_0.75fr] gap-3 border-b border-[color:var(--border)] bg-[color:var(--surface-muted)] px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
              <span>Created</span>
              <span>Email</span>
              <span>Recipient</span>
              <span>State</span>
              <span>Price</span>
            </div>
            <div className="max-h-[620px] overflow-auto bg-white">
              {loading ? (
                <p className="p-6 text-sm text-[color:var(--muted)]">Loading orders...</p>
              ) : null}
              {!loading
                ? filtered.map((order) => (
                    <button
                      key={order.id}
                      type="button"
                      onClick={() => setSelectedId(order.id)}
                      className={`grid w-full grid-cols-[1.1fr_1fr_0.9fr_0.7fr_0.75fr] gap-3 border-b border-[color:var(--border)] px-4 py-4 text-left transition hover:bg-[color:var(--surface-muted)] ${selected?.id === order.id ? "bg-[color:var(--accent-soft)]" : ""}`}
                    >
                      <span className="text-sm text-[color:var(--foreground)]">{formatDate(order.createdAt)}</span>
                    <span className="truncate text-sm text-[color:var(--muted)]">{order.email}</span>
                    <span className="truncate text-sm text-[color:var(--muted)]">{order.recipientName}</span>
                    <span className="text-sm text-[color:var(--muted)]">{order.recipientState}</span>
                    <span className="text-sm font-medium text-[color:var(--foreground)]">{formatMoney(order.priceCents ?? 0)}</span>
                  </button>
                  ))
                : null}
              {!loading && !filtered.length ? <p className="p-6 text-sm text-[color:var(--muted)]">No matching orders.</p> : null}
            </div>
          </div>
          {error ? <p className="mt-3 text-sm text-rose-700">{error}</p> : null}
        </Card>

        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-[color:var(--foreground)]">Order detail</h2>
            {selected ? (
              <div className="mt-5 space-y-4 text-sm leading-6 text-[color:var(--muted)]">
                <p><span className="font-semibold text-[color:var(--foreground)]">Order ID:</span> {selected.id}</p>
                <p><span className="font-semibold text-[color:var(--foreground)]">Customer:</span> {selected.email}</p>
                <p><span className="font-semibold text-[color:var(--foreground)]">Recipient:</span> {selected.recipientName}</p>
                <p><span className="font-semibold text-[color:var(--foreground)]">Status:</span> {orderStatusLabels[selected.status]}</p>
                <p><span className="font-semibold text-[color:var(--foreground)]">Proof level:</span> {getProofLevelLabel(selected.proofLevel ?? "standard")}</p>
                <p><span className="font-semibold text-[color:var(--foreground)]">Template:</span> {selected.templateTitle ?? "—"}</p>
                <p><span className="font-semibold text-[color:var(--foreground)]">Lob ID:</span> {selected.lobLetterId ?? "—"}</p>
                <p><span className="font-semibold text-[color:var(--foreground)]">Stripe session:</span> {selected.stripeCheckoutSessionId ?? "—"}</p>
                <p><span className="font-semibold text-[color:var(--foreground)]">Page count:</span> {selected.pageCount}</p>
                <p><span className="font-semibold text-[color:var(--foreground)]">Price:</span> {formatMoney(selected.priceCents ?? 0)}</p>
                <p><span className="font-semibold text-[color:var(--foreground)]">Admin note:</span> {selected.adminNotes ?? "None"}</p>
              </div>
            ) : (
              <p className="mt-4 text-sm text-[color:var(--muted)]">Select an order to inspect it.</p>
            )}
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-semibold text-[color:var(--foreground)]">Actions</h2>
            {useLiveAdmin ? (
              <div className="mt-4 space-y-3">
                <p className="text-sm leading-6 text-[color:var(--muted)]">
                  Live admin is read-only until the staff auth flow is connected.
                </p>
                {!useAutoSubmitToLob && selected ? (
                  <Button
                    onClick={submitToLob}
                    variant="secondary"
                    disabled={loading || selected.status === "provider_processing" || Boolean(selected.lobLetterId)}
                  >
                    Submit to Lob
                  </Button>
                ) : null}
              </div>
            ) : (
              <>
                <div className="mt-4 flex flex-wrap gap-3">
                  <Button onClick={retry} variant="secondary" disabled={!selected}>
                    Retry Lob submission
                  </Button>
                  <Button onClick={markRefunded} variant="secondary" disabled={!selected}>
                    Mark refunded
                  </Button>
                </div>
                <div className="mt-5 space-y-3">
                  <Textarea placeholder="Add an admin note..." value={note} onChange={(event) => setNote(event.target.value)} />
                  <Button onClick={saveNote} disabled={!selected || !note.trim()}>
                    Save note
                  </Button>
                </div>
              </>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
