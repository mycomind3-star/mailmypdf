"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Button, Card, Input, Label } from "./ui";
import { templates } from "@/lib/templates";
import { proofLevelOptions, getProofLevelLabel } from "@/lib/proof-levels";
import {
  buildDefaultCustomerSettings,
  clearCustomerSettings,
  getCustomerSettings,
  saveCustomerSettings,
  type CustomerAddress,
  type CustomerSettings,
} from "@/lib/customer-settings";
import { collectRecentContacts, collectSenderProfiles, getCustomerArchive } from "@/lib/customer-archive";
import { formatDate } from "@/lib/utils";
import { orderStatusLabels } from "@/lib/site-content";

function downloadJson(filename: string, data: unknown) {
  if (typeof window === "undefined") return;
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

export function SettingsDashboard() {
  const [settings, setSettings] = useState<CustomerSettings>(() => getCustomerSettings());
  const [archive, setArchive] = useState(() => getCustomerArchive());
  const [savedAt, setSavedAt] = useState<string>(settings.updatedAt);

  useEffect(() => {
    const sync = () => {
      setSettings(getCustomerSettings());
      setArchive(getCustomerArchive());
    };
    sync();
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  const senderProfiles = useMemo(() => collectSenderProfiles(archive), [archive]);
  const recentContacts = useMemo(() => collectRecentContacts(archive), [archive]);
  const selectedTemplate = templates.find((item) => item.id === settings.defaultTemplateId) ?? templates[0];

  function updateSettings(patch: Partial<CustomerSettings>) {
    setSettings((current) => ({ ...current, ...patch }));
  }

  function updateAddress(which: "sender" | "returnAddress", patch: Partial<CustomerAddress>) {
    setSettings((current) => ({
      ...current,
      [which]: {
        ...current[which],
        ...patch,
      },
    }));
  }

  function handleSave() {
    const next = saveCustomerSettings(settings);
    setSettings(next);
    setSavedAt(next.updatedAt);
  }

  function handleReset() {
    const next = buildDefaultCustomerSettings();
    clearCustomerSettings();
    setSettings(next);
    setSavedAt(next.updatedAt);
  }

  function handleExport() {
    downloadJson("proofpost-export.json", {
      settings,
      archive,
    });
  }

  function handleClearArchive() {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem("proofpost.customerArchive.v1");
    setArchive(getCustomerArchive());
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
                    item.label === "Settings"
                      ? "bg-[color:var(--accent-soft)] text-[color:var(--foreground)]"
                      : "text-[color:var(--muted)] hover:bg-[color:var(--surface-muted)] hover:text-[color:var(--foreground)]"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-muted)] p-4 text-sm leading-6 text-[color:var(--muted)]">
              Saved defaults keep new letters and archive records aligned across the app.
            </div>
            <Button href="/send" className="w-full">
              Send a Letter
            </Button>
          </div>
        </aside>

        <main>
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Settings</p>
            <h1 className="serif-heading mt-4 text-5xl font-normal leading-[0.95] text-[color:var(--foreground)] md:text-7xl">
              Business defaults and archive preferences.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[color:var(--muted)]">
              Save the sender profile you use most, keep your archive organized, and make the next letter start from the right template and proof level.
            </p>
          </div>

          <div className="mt-10 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-6">
              <Card className="p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold text-[color:var(--foreground)]">Business profile</h2>
                    <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">
                      These values prefill the sender fields when you start a new letter.
                    </p>
                  </div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Last saved {formatDate(savedAt)}
                  </p>
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  <div>
                    <Label>Business name</Label>
                    <Input value={settings.businessName} onChange={(event) => updateSettings({ businessName: event.target.value })} placeholder="Acme Studio LLC" />
                  </div>
                  <div>
                    <Label>Contact name</Label>
                    <Input value={settings.contactName} onChange={(event) => updateSettings({ contactName: event.target.value })} placeholder="Jordan Smith" />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input value={settings.email} onChange={(event) => updateSettings({ email: event.target.value })} placeholder="hello@acmestudio.com" type="email" />
                  </div>
                  <div>
                    <Label>Phone</Label>
                    <Input value={settings.phone} onChange={(event) => updateSettings({ phone: event.target.value })} placeholder="(310) 555-0100" />
                  </div>
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  <AddressBlock title="Sender address" value={settings.sender} onChange={(patch) => updateAddress("sender", patch)} />
                  <AddressBlock title="Return address" value={settings.returnAddress} onChange={(patch) => updateAddress("returnAddress", patch)} />
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <Button onClick={handleSave}>Save defaults</Button>
                  <Button variant="secondary" onClick={handleReset}>
                    Reset defaults
                  </Button>
                </div>
              </Card>

              <Card className="p-6">
                <h2 className="text-lg font-semibold text-[color:var(--foreground)]">Proof preferences</h2>
                <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">
                  Set the default proof level, starting template, and receipt format.
                </p>

                <div className="mt-6 grid gap-6">
                  <div>
                    <Label>Default proof level</Label>
                    <div className="grid gap-2 md:grid-cols-3">
                      {proofLevelOptions.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => updateSettings({ defaultProofLevel: option.value })}
                          className={`rounded-2xl border px-4 py-3 text-left transition ${
                            settings.defaultProofLevel === option.value
                              ? "border-[color:var(--accent)] bg-[color:var(--accent-soft)] text-[color:var(--foreground)]"
                              : "border-[color:var(--border)] bg-white text-[color:var(--muted)] hover:border-[color:var(--border-strong)]"
                          }`}
                        >
                          <div className="text-sm font-semibold">{option.label}</div>
                          <div className="mt-1 text-xs leading-5">{option.detail}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label>Default template</Label>
                      <select
                        className="h-11 w-full rounded-md border border-[color:var(--border)] bg-white px-3 text-sm text-[color:var(--foreground)] shadow-sm transition focus:border-[color:var(--accent)] focus:outline-none focus:ring-2 focus:ring-[color:var(--accent-soft)]"
                        value={settings.defaultTemplateId}
                        onChange={(event) => updateSettings({ defaultTemplateId: event.target.value })}
                      >
                        {templates.map((template) => (
                          <option key={template.id} value={template.id}>
                            {template.title}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label>Receipt format</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {(["pdf", "email"] as const).map((value) => (
                          <button
                            key={value}
                            type="button"
                            onClick={() => updateSettings({ receiptFormat: value })}
                            className={`rounded-md border px-3 py-2 text-sm font-medium transition ${
                              settings.receiptFormat === value
                                ? "border-[color:var(--accent)] bg-[color:var(--accent-soft)] text-[color:var(--foreground)]"
                                : "border-[color:var(--border)] bg-white text-[color:var(--muted)] hover:border-[color:var(--border-strong)]"
                            }`}
                          >
                            {value === "pdf" ? "PDF packet" : "Email copy"}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-muted)] p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Current default template</p>
                    <p className="mt-2 text-sm font-semibold text-[color:var(--foreground)]">{selectedTemplate?.title}</p>
                    <p className="mt-1 text-sm leading-6 text-[color:var(--muted)]">{selectedTemplate?.summary}</p>
                    <p className="mt-3 text-xs leading-5 text-slate-500">{selectedTemplate?.disclaimer}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h2 className="text-lg font-semibold text-[color:var(--foreground)]">Data and archive</h2>
                <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">
                  Keep the browser archive portable, or clear the data if you are resetting this installation.
                </p>

                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-muted)] p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Archive summary</p>
                    <div className="mt-3 space-y-2 text-sm leading-6 text-[color:var(--muted)]">
                      <p>{archive.orders.length} saved letters</p>
                      <p>{senderProfiles.length} sender profiles</p>
                      <p>{recentContacts.length} recent contacts</p>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-muted)] p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Export tools</p>
                    <div className="mt-3 flex flex-wrap gap-3">
                      <Button variant="secondary" onClick={handleExport}>
                        Export archive
                      </Button>
                      <Button variant="secondary" onClick={handleClearArchive}>
                        Clear archive
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="p-6">
                <h2 className="text-lg font-semibold text-[color:var(--foreground)]">Current defaults</h2>
                <div className="mt-4 space-y-4 text-sm leading-6 text-[color:var(--muted)]">
                  <SummaryRow label="Company" value={settings.businessName || "Not set"} />
                  <SummaryRow label="Email" value={settings.email || "Not set"} />
                  <SummaryRow label="Proof level" value={getProofLevelLabel(settings.defaultProofLevel)} />
                  <SummaryRow label="Template" value={selectedTemplate?.title ?? "Not set"} />
                  <SummaryRow label="Receipt format" value={settings.receiptFormat === "pdf" ? "PDF packet" : "Email copy"} />
                </div>
              </Card>

              <Card className="p-6">
                <h2 className="text-lg font-semibold text-[color:var(--foreground)]">Support</h2>
                <div className="mt-4 space-y-3 text-sm leading-6 text-[color:var(--muted)]">
                  <p className="font-medium text-[color:var(--foreground)]">support@proofpost.com</p>
                  <p>
                    Use this for billing questions, proof packet issues, and order lookup problems.
                  </p>
                  <Button href="mailto:support@proofpost.com" variant="secondary">
                    Email support
                  </Button>
                </div>
              </Card>

              <Card className="p-6">
                <h2 className="text-lg font-semibold text-[color:var(--foreground)]">Security</h2>
                <div className="mt-4 space-y-3 text-sm leading-6 text-[color:var(--muted)]">
                  <p>PDFs remain private by default.</p>
                  <p>Secure order pages require the lookup token.</p>
                  <p>Archive data stays in this browser unless you export it.</p>
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                    Locale: U.S. domestic mail only
                  </p>
                </div>
              </Card>

              <Card className="p-6">
                <h2 className="text-lg font-semibold text-[color:var(--foreground)]">Recent activity</h2>
                <div className="mt-4 space-y-3">
                  {archive.orders.slice(0, 3).map((order) => (
                    <div key={order.orderId} className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-muted)] p-4 text-sm leading-6 text-[color:var(--muted)]">
                      <p className="font-semibold text-[color:var(--foreground)]">{order.templateTitle}</p>
                      <p>{order.recipientName}</p>
                      <p>{formatDate(order.createdAt)} · {orderStatusLabels[order.status] ?? order.status}</p>
                    </div>
                  ))}
                  {!archive.orders.length ? (
                    <p className="text-sm leading-6 text-[color:var(--muted)]">No archived letters yet.</p>
                  ) : null}
                </div>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function AddressBlock({
  title,
  value,
  onChange,
}: {
  title: string;
  value: CustomerAddress;
  onChange: (patch: Partial<CustomerAddress>) => void;
}) {
  return (
    <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-muted)] p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{title}</p>
      <div className="mt-4 grid gap-3">
        <Input value={value.name} onChange={(event) => onChange({ name: event.target.value })} placeholder="Full name" />
        <Input value={value.line1} onChange={(event) => onChange({ line1: event.target.value })} placeholder="Street address" />
        <Input value={value.line2} onChange={(event) => onChange({ line2: event.target.value })} placeholder="Apartment, suite, etc. (optional)" />
        <div className="grid grid-cols-2 gap-3">
          <Input value={value.city} onChange={(event) => onChange({ city: event.target.value })} placeholder="City" />
          <Input value={value.state} onChange={(event) => onChange({ state: event.target.value.toUpperCase() })} placeholder="State" maxLength={2} />
        </div>
        <Input value={value.postalCode} onChange={(event) => onChange({ postalCode: event.target.value })} placeholder="ZIP code" />
      </div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-[color:var(--border)] pb-3 last:border-b-0 last:pb-0">
      <span className="text-slate-500">{label}</span>
      <span className="text-right font-medium text-[color:var(--foreground)]">{value}</span>
    </div>
  );
}
