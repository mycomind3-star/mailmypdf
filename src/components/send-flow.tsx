"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { appendDemoEvent, patchDemoOrder, upsertDemoOrder } from "@/lib/demo-store";
import { calculateLetterPrice, pricingCopy } from "@/lib/pricing";
import { detectPdfPageCount } from "@/lib/pdf";
import { getProofLevelLabel, proofLevelOptions, type ProofLevel } from "@/lib/proof-levels";
import { templates, type Template } from "@/lib/templates";
import { formatMoney } from "@/lib/utils";
import { Button, Card, Input, Label, SectionHeading } from "./ui";

type Address = {
  name: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  postalCode: string;
  country: "US";
};

type DraftOrder = {
  orderId: string;
  lookupToken: string;
  email: string;
  clientName: string;
  subject: string;
  goal: string;
  tone: "formal" | "calm" | "concise";
  proofLevel: ProofLevel;
  fileName: string;
  fileSizeBytes: number;
  file: File | null;
  fileDataUrl?: string;
  pageCount: number;
  sender: Address;
  recipient: Address;
  termsAccepted: boolean;
  reviewAccepted: boolean;
};

const emptyAddress = (): Address => ({
  name: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "US",
});

const emptyDraft = (): DraftOrder => ({
  orderId: crypto.randomUUID(),
  lookupToken: crypto.randomUUID().replaceAll("-", ""),
  email: "",
  clientName: "",
  subject: "",
  goal: "",
  tone: "formal",
  proofLevel: "proof",
  fileName: "",
  fileSizeBytes: 0,
  file: null,
  pageCount: 0,
  sender: emptyAddress(),
  recipient: emptyAddress(),
  termsAccepted: false,
  reviewAccepted: false,
});

function isValidState(value: string) {
  return /^(A[LKZRA]|C[AOT]|D[EC]|F[L]|G[AU]|H[I]|I[DLN]|K[SY]|L[A]|M[ADEHINOPST]|N[CDEHJMVY]|O[HKR]|P[ARW]|R[I]|S[CD]|T[NX]|U[T]|V[AIT]|W[AIVY])$/.test(
    value.toUpperCase(),
  );
}

function isValidZip(value: string) {
  return /^\d{5}(-\d{4})?$/.test(value);
}

function addressIsComplete(address: Address) {
  return (
    address.name.trim().length > 1 &&
    address.line1.trim().length > 1 &&
    address.city.trim().length > 1 &&
    isValidState(address.state) &&
    isValidZip(address.postalCode) &&
    address.country === "US"
  );
}

async function readFileAsDataUrl(file: File) {
  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error("Upload failed."));
    reader.readAsDataURL(file);
  });
}

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(String(data?.error ?? "Request failed."));
  }

  return data as T;
}

async function postFormData<T>(url: string, formData: FormData): Promise<T> {
  const response = await fetch(url, {
    method: "POST",
    body: formData,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(String(data?.error ?? "Request failed."));
  }

  return data as T;
}

function buildDraftPreview(templateTitle: string, clientName: string, subject: string, goal: string, tone: DraftOrder["tone"]) {
  const intro =
    tone === "concise"
      ? "I’m writing to confirm the request and next step."
      : tone === "calm"
        ? "I’m writing to confirm the request in a calm and professional way."
        : "I’m writing to document the request and keep the record professional.";
  const followUp =
    tone === "concise"
      ? "Please reply in writing with confirmation."
      : tone === "calm"
        ? "Please reply in writing so we can keep the record clear."
        : "Please reply in writing by the date stated below so the record is complete.";

  return [
    `${clientName || "Client name"}`,
    subject || templateTitle,
    "",
    intro,
    goal || "Use this space to describe the issue, request, or next step.",
    followUp,
    "",
    "Best,",
    "Your name",
  ].join("\n");
}

const useLiveStripeCheckout = Boolean(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY &&
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);

export function SendFlow({ templates: availableTemplates = templates }: { templates?: Template[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [draft, setDraft] = useState<DraftOrder>(() => emptyDraft());
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [paying, setPaying] = useState(false);
  const [templateId, setTemplateId] = useState(searchParams.get("template") ?? availableTemplates[0]?.id ?? "");
  const selectedTemplate = availableTemplates.find((item) => item.id === templateId) ?? availableTemplates[0];

  const priceQuote = draft.pageCount ? pricingCopy(draft.pageCount) : null;
  const finalPriceCents = draft.pageCount ? calculateLetterPrice(draft.pageCount) : 0;
  const draftPreview = buildDraftPreview(
    selectedTemplate?.title ?? "Formal business letter",
    draft.clientName,
    draft.subject,
    draft.goal,
    draft.tone,
  );

  function updateDraft(patch: Partial<DraftOrder>) {
    setDraft((current) => ({ ...current, ...patch }));
  }

  function updateAddress(which: "sender" | "recipient", patch: Partial<Address>) {
    setDraft((current) => ({
      ...current,
      [which]: { ...current[which], ...patch },
    }));
  }

  async function handleFile(file: File | null) {
    if (!file) return;

    setError("");
    setUploading(true);

    try {
      if (!file.type.includes("pdf") && !file.name.toLowerCase().endsWith(".pdf")) {
        throw new Error("This version only accepts PDF files.");
      }

      if (file.size > 10 * 1024 * 1024) {
        throw new Error("This version supports PDF files up to 10MB.");
      }

      const pageCount = await detectPdfPageCount(file);
      const dataUrl = await readFileAsDataUrl(file);
      const nextDraft = {
        ...draft,
        fileName: file.name,
        fileSizeBytes: file.size,
        file,
        pageCount,
        fileDataUrl: dataUrl,
      };
      setDraft(nextDraft);

      if (!useLiveStripeCheckout) {
        upsertDemoOrder({
          id: draft.orderId,
          token: draft.lookupToken,
          email: draft.email,
          status: "uploaded",
          fileName: file.name,
          fileSizeBytes: file.size,
          pageCount,
          fileDataUrl: dataUrl,
          proofLevel: draft.proofLevel,
          templateTitle: selectedTemplate?.title ?? "Formal business letter",
          senderName: draft.sender.name,
          senderAddressLine1: draft.sender.line1,
          senderCity: draft.sender.city,
          senderState: draft.sender.state,
          senderPostalCode: draft.sender.postalCode,
          recipientName: draft.recipient.name,
          recipientAddressLine1: draft.recipient.line1,
          recipientCity: draft.recipient.city,
          recipientState: draft.recipient.state,
          recipientPostalCode: draft.recipient.postalCode,
          priceCents: calculateLetterPrice(pageCount),
          currency: "usd",
          createdAt: new Date().toISOString(),
          events: [
            {
              eventType: "file.uploaded",
              message: "The PDF was uploaded and validated.",
              createdAt: new Date().toISOString(),
            },
          ],
        });
      }
      setStep(2);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "We could not upload this PDF.");
    } finally {
      setUploading(false);
    }
  }

  function validateAddresses() {
    if (!addressIsComplete(draft.sender) || !addressIsComplete(draft.recipient)) {
      setError("Please complete both U.S. addresses before continuing.");
      return;
    }

    setError("");
    setStep(3);
    if (!useLiveStripeCheckout) {
      patchDemoOrder(draft.orderId, {
        status: "priced",
        email: draft.email,
        proofLevel: draft.proofLevel,
        templateTitle: selectedTemplate?.title ?? "Formal business letter",
        senderName: draft.sender.name,
        senderAddressLine1: draft.sender.line1,
        senderCity: draft.sender.city,
        senderState: draft.sender.state,
        senderPostalCode: draft.sender.postalCode,
        recipientName: draft.recipient.name,
        recipientAddressLine1: draft.recipient.line1,
        recipientCity: draft.recipient.city,
        recipientState: draft.recipient.state,
        recipientPostalCode: draft.recipient.postalCode,
        priceCents: finalPriceCents,
      });
    }
  }

  function handlePay() {
    if (paying) return;

    if (!draft.reviewAccepted || !draft.termsAccepted) {
      setError("Please confirm the review and terms checkboxes.");
      return;
    }

    if (!addressIsComplete(draft.sender) || !addressIsComplete(draft.recipient) || !draft.fileName) {
      setError("Please complete upload and address steps first.");
      return;
    }

    setError("");
    setPaying(true);

    if (useLiveStripeCheckout) {
      void (async () => {
        try {
          if (!draft.file) {
            throw new Error("Please upload a PDF before continuing.");
          }

          const created = await postJson<{ orderId: string; lookupToken: string }>("/api/orders/create", {
            email: draft.email.trim(),
            proofLevel: draft.proofLevel,
            templateTitle: selectedTemplate?.title ?? null,
          });

          const uploadFormData = new FormData();
          uploadFormData.append("file", draft.file);
          uploadFormData.append("lookupToken", created.lookupToken);
          await postFormData<{ orderId: string; fileName: string; pageCount: number; fileSizeBytes: number }>(
            `/api/orders/${created.orderId}/upload`,
            uploadFormData,
          );

          await postJson<{ orderId: string; ok: boolean }>(`/api/orders/${created.orderId}/address`, {
            lookupToken: created.lookupToken,
            sender: {
              country: "US",
              state: draft.sender.state,
              postalCode: draft.sender.postalCode,
            },
            recipient: {
              country: "US",
              state: draft.recipient.state,
              postalCode: draft.recipient.postalCode,
            },
            senderName: draft.sender.name,
            senderLine1: draft.sender.line1,
            senderLine2: draft.sender.line2,
            senderCity: draft.sender.city,
            recipientName: draft.recipient.name,
            recipientLine1: draft.recipient.line1,
            recipientLine2: draft.recipient.line2,
            recipientCity: draft.recipient.city,
          });

          await postJson<{ orderId: string; priceCents: number; currency: string; pageCount: number }>(
            `/api/orders/${created.orderId}/price`,
            {
              pageCount: draft.pageCount,
            },
          );

          const checkout = await postJson<{ checkoutUrl: string }>("/api/checkout/create-session", {
            orderId: created.orderId,
            lookupToken: created.lookupToken,
          });

          window.location.assign(checkout.checkoutUrl);
        } catch (caught) {
          setError(caught instanceof Error ? caught.message : "We could not start Stripe Checkout.");
          setPaying(false);
        }
      })();
      return;
    }

    const now = new Date().toISOString();
    const checkoutSessionId = `cs_${crypto.randomUUID().replaceAll("-", "")}`;
    const lobLetterId = `ltr_${crypto.randomUUID().replaceAll("-", "")}`;

    upsertDemoOrder({
      id: draft.orderId,
      token: draft.lookupToken,
      email: draft.email,
      status: "submitted_to_provider",
      fileName: draft.fileName,
      fileSizeBytes: draft.fileSizeBytes,
      fileDataUrl: draft.fileDataUrl,
      pageCount: draft.pageCount,
      senderName: draft.sender.name,
      senderAddressLine1: draft.sender.line1,
      senderCity: draft.sender.city,
      senderState: draft.sender.state,
      senderPostalCode: draft.sender.postalCode,
      recipientName: draft.recipient.name,
      recipientAddressLine1: draft.recipient.line1,
      recipientCity: draft.recipient.city,
      recipientState: draft.recipient.state,
      recipientPostalCode: draft.recipient.postalCode,
      proofLevel: draft.proofLevel,
      templateTitle: selectedTemplate?.title ?? "Formal business letter",
      priceCents: finalPriceCents,
      currency: "usd",
      stripeCheckoutSessionId: checkoutSessionId,
      lobLetterId,
      createdAt: now,
      paidAt: now,
      submittedToProviderAt: now,
      events: [
          {
            eventType: "provider.submitted",
            message: "Payment received and the proof file was created.",
            createdAt: now,
          },
          {
            eventType: "payment.received",
            message: "Stripe Checkout completed successfully.",
          createdAt: now,
        },
      ],
    });

    window.setTimeout(() => {
      patchDemoOrder(draft.orderId, { status: "provider_processing" });
      appendDemoEvent(draft.orderId, {
        eventType: "provider.processing",
        message: "The proof file is being prepared.",
        createdAt: new Date().toISOString(),
      });
    }, 1500);

    window.setTimeout(() => {
      patchDemoOrder(draft.orderId, {
        status: "mailed",
        mailedAt: new Date().toISOString(),
      });
      appendDemoEvent(draft.orderId, {
        eventType: "mailed",
        message: "The proof file is archived and ready.",
        createdAt: new Date().toISOString(),
      });
    }, 6000);

    window.setTimeout(() => {
      router.push(`/success?session_id=${checkoutSessionId}&order_id=${draft.orderId}&token=${draft.lookupToken}`);
    }, 700);
  }

  return (
    <div className="container-shell py-10 md:py-14">
      <SectionHeading
        title="Template → Draft → Address → Review → Pay"
        description="Start from a business template, polish the draft, validate the address, and lock the price before checkout."
      />

      <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_0.84fr]">
        <Card className="overflow-hidden">
          <div className="border-b border-[color:var(--border)] px-6 py-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-[color:var(--foreground)]">Build a business letter</p>
                <p className="mt-1 text-sm text-[color:var(--muted)]">PDF only. Max 10MB. Max 10 pages. U.S. proof-file workflow in phase 1.</p>
              </div>
              <div className="flex items-center gap-2 rounded-full border border-[color:var(--border)] bg-[color:var(--surface-muted)] p-1 text-xs font-semibold">
                {["Upload", "Addresses", "Review", "Pay"].map((item, index) => (
                  <span
                    key={item}
                    className={`rounded-full px-3 py-1 ${step === index + 1 ? "bg-white text-[color:var(--foreground)] shadow-sm" : "text-slate-500"}`}
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="p-6">
            {step === 1 ? (
              <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                <div>
                  <Label>Template</Label>
                  <select
                    className="h-11 w-full rounded-md border border-[color:var(--border)] bg-white px-3 text-sm text-[color:var(--foreground)] shadow-sm transition focus:border-[color:var(--accent)] focus:outline-none focus:ring-2 focus:ring-[color:var(--accent-soft)]"
                    value={templateId}
                    onChange={(event) => setTemplateId(event.target.value)}
                  >
                    {availableTemplates.map((template) => (
                      <option key={template.id} value={template.id}>
                        {template.title}
                      </option>
                    ))}
                  </select>
                  <div className="mt-3 rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-muted)] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-[color:var(--foreground)]">{selectedTemplate?.title}</p>
                      <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600">
                        {selectedTemplate?.category}
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">{selectedTemplate?.summary}</p>
                    <p className="mt-3 text-sm leading-6 text-[color:var(--foreground)]">{selectedTemplate?.body}</p>
                    <p className="mt-3 text-xs leading-5 text-slate-500">{selectedTemplate?.disclaimer}</p>
                  </div>

                  <div className="mt-5 grid gap-4">
                    <div>
                      <Label>Client or company</Label>
                      <Input
                        value={draft.clientName}
                        onChange={(event) => updateDraft({ clientName: event.target.value })}
                        placeholder="Acme Studio LLC"
                      />
                    </div>
                    <div>
                      <Label>Letter subject</Label>
                      <Input
                        value={draft.subject}
                        onChange={(event) => updateDraft({ subject: event.target.value })}
                        placeholder="Invoice 1024 follow-up"
                      />
                    </div>
                    <div>
                      <Label>What this letter should do</Label>
                      <textarea
                        value={draft.goal}
                        onChange={(event) => updateDraft({ goal: event.target.value })}
                        placeholder="Confirm the overdue balance and ask for payment by Friday."
                        className="min-h-28 w-full rounded-md border border-[color:var(--border)] bg-white px-3 py-3 text-sm text-[color:var(--foreground)] shadow-sm transition focus:border-[color:var(--accent)] focus:outline-none focus:ring-2 focus:ring-[color:var(--accent-soft)]"
                      />
                    </div>
                    <div>
                      <Label>Polish</Label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { value: "formal", label: "Formal" },
                          { value: "calm", label: "Calm tone" },
                          { value: "concise", label: "Concise" },
                        ].map((item) => (
                          <button
                            key={item.value}
                            type="button"
                            onClick={() => updateDraft({ tone: item.value as DraftOrder["tone"] })}
                            className={`rounded-md border px-3 py-2 text-sm font-medium transition ${
                              draft.tone === item.value
                                ? "border-[color:var(--accent)] bg-[color:var(--accent-soft)] text-[color:var(--foreground)]"
                                : "border-[color:var(--border)] bg-white text-[color:var(--muted)] hover:border-[color:var(--border-strong)]"
                            }`}
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                      <p className="mt-2 text-xs text-slate-500">
                        Phase 1 uses local polish controls. Phase 3 adds a real AI writing assistant.
                      </p>
                    </div>
                    <div>
                      <Label>Proof level</Label>
                      <div className="grid gap-2 md:grid-cols-3">
                        {proofLevelOptions.map((item) => (
                          <button
                            key={item.value}
                            type="button"
                            onClick={() => {
                              updateDraft({ proofLevel: item.value });
                              if (!useLiveStripeCheckout && draft.fileName) {
                                patchDemoOrder(draft.orderId, { proofLevel: item.value });
                              }
                            }}
                            className={`rounded-2xl border px-4 py-3 text-left transition ${
                              draft.proofLevel === item.value
                                ? "border-[color:var(--accent)] bg-[color:var(--accent-soft)] text-[color:var(--foreground)]"
                                : "border-[color:var(--border)] bg-white text-[color:var(--muted)] hover:border-[color:var(--border-strong)]"
                            }`}
                          >
                            <div className="text-sm font-semibold">{item.label}</div>
                            <div className="mt-1 text-xs leading-5">{item.detail}</div>
                          </button>
                        ))}
                      </div>
                      <p className="mt-2 text-xs text-slate-500">
                        This choice is stored on the order record and included in the proof packet.
                      </p>
                    </div>
                  </div>

                  <Label>Email</Label>
                  <Input
                    value={draft.email}
                    onChange={(event) => updateDraft({ email: event.target.value })}
                    placeholder="customer@example.com"
                    type="email"
                  />

                  <div className="mt-5">
                    <Label>Upload PDF</Label>
                    <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[color:var(--border-strong)] bg-[color:var(--surface-muted)] px-6 py-10 text-center transition hover:bg-white">
                      <input
                        type="file"
                        accept="application/pdf,.pdf"
                        className="hidden"
                        onChange={(event) => handleFile(event.target.files?.[0] ?? null)}
                      />
                      <svg
                        viewBox="0 0 24 24"
                        className="h-11 w-11 text-[color:var(--accent)]"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.7"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M12 16V4" />
                        <path d="m8 8 4-4 4 4" />
                        <path d="M4 16.5A4.5 4.5 0 0 1 8.5 12H9" />
                        <path d="M20 16.5A4.5 4.5 0 0 0 15.5 12H15" />
                        <path d="M6 20h12" />
                      </svg>
                      <p className="mt-4 text-base font-semibold text-[color:var(--foreground)]">Drag and drop your PDF here</p>
                      <p className="mt-1 text-sm text-[color:var(--muted)]">or click to choose a file</p>
                    </label>
                    <p className="mt-3 text-xs text-slate-500">
                      File requirements: PDF only, max 10MB, max 10 pages, U.S. mail only.
                    </p>
                  </div>
                </div>

                <div className="space-y-4 rounded-2xl border border-[color:var(--border)] bg-white p-5">
                  <p className="text-sm font-semibold text-[color:var(--foreground)]">Draft preview</p>
                  <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-muted)] p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Starting point</p>
                    <p className="mt-2 text-sm font-semibold text-[color:var(--foreground)]">{selectedTemplate?.title}</p>
                    <p className="mt-1 text-sm text-[color:var(--muted)]">{selectedTemplate?.summary}</p>
                    <div className="mt-3 rounded-2xl border border-[color:var(--border)] bg-white p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Proof level</p>
                      <p className="mt-2 text-sm font-semibold text-[color:var(--foreground)]">{getProofLevelLabel(draft.proofLevel)}</p>
                      <p className="mt-1 text-sm text-[color:var(--muted)]">
                        {proofLevelOptions.find((item) => item.value === draft.proofLevel)?.detail}
                      </p>
                    </div>
                    <div className="mt-4 rounded-2xl border border-[color:var(--border)] bg-white p-4 text-sm leading-6 text-[color:var(--foreground)]">
                      <pre className="whitespace-pre-wrap font-sans">{draftPreview}</pre>
                    </div>
                  </div>
                  {draft.fileName ? (
                    <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-muted)] p-4">
                      <p className="text-sm font-semibold text-[color:var(--foreground)]">{draft.fileName}</p>
                      <p className="mt-1 text-sm text-[color:var(--muted)]">{draft.pageCount} pages</p>
                      <p className="text-sm text-[color:var(--muted)]">{formatMoney(finalPriceCents)}</p>
                    </div>
                  ) : (
                    <p className="text-sm text-[color:var(--muted)]">No PDF uploaded yet.</p>
                  )}
                  <div className="space-y-2 text-sm text-[color:var(--muted)]">
                    <p>• File type: PDF</p>
                    <p>• Max size: 10MB</p>
                    <p>• Max pages: 10</p>
                    <p>• Black-and-white only</p>
                  </div>
                  {error ? <p className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{error}</p> : null}
                  <Button className="w-full" onClick={() => setStep(draft.fileName && draft.email.trim() ? 2 : 1)} disabled={!draft.fileName || !draft.email.trim() || uploading}>
                    {uploading ? "Checking PDF..." : "Continue"}
                  </Button>
                </div>
              </div>
            ) : null}

            {step === 2 ? (
              <div className="grid gap-6 lg:grid-cols-2">
                <Card className="p-5">
                  <h3 className="text-lg font-semibold text-[color:var(--foreground)]">Sender address</h3>
                  <div className="mt-4 grid gap-3">
                    <Input placeholder="Full name" value={draft.sender.name} onChange={(e) => updateAddress("sender", { name: e.target.value })} />
                    <Input placeholder="Street address" value={draft.sender.line1} onChange={(e) => updateAddress("sender", { line1: e.target.value })} />
                    <Input placeholder="Apartment, suite, etc. (optional)" value={draft.sender.line2} onChange={(e) => updateAddress("sender", { line2: e.target.value })} />
                    <div className="grid grid-cols-2 gap-3">
                      <Input placeholder="City" value={draft.sender.city} onChange={(e) => updateAddress("sender", { city: e.target.value })} />
                      <Input placeholder="State" maxLength={2} value={draft.sender.state} onChange={(e) => updateAddress("sender", { state: e.target.value.toUpperCase() })} />
                    </div>
                    <Input placeholder="ZIP code" value={draft.sender.postalCode} onChange={(e) => updateAddress("sender", { postalCode: e.target.value })} />
                  </div>
                </Card>

                <Card className="p-5">
                  <h3 className="text-lg font-semibold text-[color:var(--foreground)]">Recipient address</h3>
                  <div className="mt-4 grid gap-3">
                    <Input placeholder="Full name" value={draft.recipient.name} onChange={(e) => updateAddress("recipient", { name: e.target.value })} />
                    <Input placeholder="Street address" value={draft.recipient.line1} onChange={(e) => updateAddress("recipient", { line1: e.target.value })} />
                    <Input placeholder="Apartment, suite, etc. (optional)" value={draft.recipient.line2} onChange={(e) => updateAddress("recipient", { line2: e.target.value })} />
                    <div className="grid grid-cols-2 gap-3">
                      <Input placeholder="City" value={draft.recipient.city} onChange={(e) => updateAddress("recipient", { city: e.target.value })} />
                      <Input placeholder="State" maxLength={2} value={draft.recipient.state} onChange={(e) => updateAddress("recipient", { state: e.target.value.toUpperCase() })} />
                    </div>
                    <Input placeholder="ZIP code" value={draft.recipient.postalCode} onChange={(e) => updateAddress("recipient", { postalCode: e.target.value })} />
                  </div>
                </Card>

                <div className="lg:col-span-2 flex flex-wrap items-center justify-between gap-4">
                  <p className="text-sm text-[color:var(--muted)]">Add a real U.S. sender and recipient before continuing.</p>
                  <div className="flex gap-3">
                    <Button variant="secondary" onClick={() => setStep(1)}>
                      Back
                    </Button>
                    <Button onClick={validateAddresses}>Continue</Button>
                  </div>
                </div>
              </div>
            ) : null}

            {step === 3 ? (
              <div className="grid gap-6 lg:grid-cols-[1fr_0.82fr]">
                <Card className="p-5">
                  <h3 className="text-lg font-semibold text-[color:var(--foreground)]">Review</h3>
                  <div className="mt-4 space-y-4 text-sm leading-6 text-[color:var(--muted)]">
                    <div>
                      <p className="font-semibold text-[color:var(--foreground)]">Document</p>
                      <p>{draft.fileName}</p>
                      <p>{draft.pageCount} pages</p>
                    </div>
                    <div>
                      <p className="font-semibold text-[color:var(--foreground)]">Sender</p>
                      <p>{draft.sender.name}</p>
                      <p>
                        {draft.sender.line1}
                        {draft.sender.line2 ? `, ${draft.sender.line2}` : ""}
                      </p>
                      <p>
                        {draft.sender.city}, {draft.sender.state} {draft.sender.postalCode}
                      </p>
                    </div>
                    <div>
                      <p className="font-semibold text-[color:var(--foreground)]">Recipient</p>
                      <p>{draft.recipient.name}</p>
                      <p>
                        {draft.recipient.line1}
                        {draft.recipient.line2 ? `, ${draft.recipient.line2}` : ""}
                      </p>
                      <p>
                        {draft.recipient.city}, {draft.recipient.state} {draft.recipient.postalCode}
                      </p>
                    </div>
                    <div>
                      <p className="font-semibold text-[color:var(--foreground)]">Proof level</p>
                      <p>{getProofLevelLabel(draft.proofLevel)}</p>
                    </div>
                    <p className="rounded-2xl bg-[color:var(--surface-muted)] p-4 text-sm text-[color:var(--foreground)]">
                      Please review carefully. We prepare the letter and proof record exactly as submitted.
                    </p>
                  </div>
                </Card>

                <Card className="p-5">
                  <h3 className="text-lg font-semibold text-[color:var(--foreground)]">Confirm & pay</h3>
                  <div className="mt-4 space-y-4">
                    <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-muted)] p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Price</p>
                      <p className="serif-heading mt-2 text-5xl text-[color:var(--accent)]">{formatMoney(finalPriceCents)}</p>
                      <p className="mt-2 text-sm text-[color:var(--muted)]">{priceQuote?.label ?? "Black-and-white proof file"}</p>
                    </div>
                    <label className="flex items-start gap-3 rounded-2xl border border-[color:var(--border)] p-4 text-sm leading-6 text-[color:var(--foreground)]">
                      <input
                        type="checkbox"
                        className="mt-1 h-4 w-4 rounded border-[color:var(--border-strong)]"
                        checked={draft.reviewAccepted}
                        onChange={(event) => updateDraft({ reviewAccepted: event.target.checked })}
                      />
                      <span>
                        I reviewed the document and addresses. I understand ProofPost prepares the proof file exactly as submitted.
                      </span>
                    </label>
                    <label className="flex items-start gap-3 rounded-2xl border border-[color:var(--border)] p-4 text-sm leading-6 text-[color:var(--foreground)]">
                      <input
                        type="checkbox"
                        className="mt-1 h-4 w-4 rounded border-[color:var(--border-strong)]"
                        checked={draft.termsAccepted}
                        onChange={(event) => updateDraft({ termsAccepted: event.target.checked })}
                      />
                      <span>I agree not to use ProofPost to send unlawful, threatening, fraudulent, or abusive content.</span>
                    </label>
                    {error ? <p className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{error}</p> : null}
                    <div className="flex flex-wrap gap-3">
                      <Button variant="secondary" onClick={() => setStep(2)}>
                        Back
                      </Button>
                      <Button className="flex-1" variant="dark" onClick={handlePay} disabled={!draft.reviewAccepted || !draft.termsAccepted || paying}>
                        {paying ? "Processing..." : `Pay & Archive — ${formatMoney(finalPriceCents)}`}
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>
            ) : null}
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="p-6">
            <p className="text-sm font-semibold text-[color:var(--foreground)]">Current order</p>
            <div className="mt-4 space-y-3 text-sm text-[color:var(--muted)]">
              <div className="flex items-center justify-between gap-4">
                <span>File name</span>
                <span className="font-medium text-[color:var(--foreground)]">{draft.fileName || "Waiting for upload"}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span>Page count</span>
                <span className="font-medium text-[color:var(--foreground)]">{draft.pageCount || "—"}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span>Price</span>
                <span className="font-medium text-[color:var(--foreground)]">{draft.pageCount ? formatMoney(finalPriceCents) : "—"}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span>Recipient</span>
                <span className="font-medium text-[color:var(--foreground)]">{draft.recipient.city || "—"}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span>Proof level</span>
                <span className="font-medium text-[color:var(--foreground)]">{getProofLevelLabel(draft.proofLevel)}</span>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <p className="text-sm font-semibold text-[color:var(--foreground)]">What happens next</p>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-[color:var(--muted)]">
              <li>1. Choose a formal template and shape the draft.</li>
              <li>2. Stripe Checkout receives the payment.</li>
              <li>3. The proof file and order record are created.</li>
              <li>4. You get a confirmation page and secure order link.</li>
              <li>5. Download a proof packet with the PDF, receipt, and timeline.</li>
            </ul>
          </Card>

          <Card className="p-6">
            <p className="text-sm font-semibold text-[color:var(--foreground)]">Customer-safe rules</p>
            <p className="mt-3 text-sm leading-7 text-[color:var(--muted)]">
              No accounts required. No international mail. No legal, tax, or financial advice. PDFs stay private.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
