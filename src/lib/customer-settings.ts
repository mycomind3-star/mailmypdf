import { templates } from "./templates";
import { normalizeProofLevel, type ProofLevel } from "./proof-levels";

export type CustomerAddress = {
  name: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  postalCode: string;
  country: "US";
};

export type CustomerSettings = {
  businessName: string;
  contactName: string;
  email: string;
  phone: string;
  sender: CustomerAddress;
  returnAddress: CustomerAddress;
  defaultProofLevel: ProofLevel;
  defaultTemplateId: string;
  receiptFormat: "pdf" | "email";
  updatedAt: string;
};

const STORAGE_KEY = "proofpost.customerSettings.v1";

function emptyAddress(): CustomerAddress {
  return {
    name: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "US",
  };
}

export function buildDefaultCustomerSettings(): CustomerSettings {
  return {
    businessName: "",
    contactName: "",
    email: "",
    phone: "",
    sender: emptyAddress(),
    returnAddress: emptyAddress(),
    defaultProofLevel: "proof",
    defaultTemplateId: templates[0]?.id ?? "formal-business-letter",
    receiptFormat: "pdf",
    updatedAt: new Date().toISOString(),
  };
}

function readStorage(): CustomerSettings {
  if (typeof window === "undefined") {
    return buildDefaultCustomerSettings();
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return buildDefaultCustomerSettings();
    const parsed = JSON.parse(raw) as Partial<CustomerSettings>;
    const defaults = buildDefaultCustomerSettings();
    return {
      businessName: String(parsed.businessName ?? defaults.businessName),
      contactName: String(parsed.contactName ?? defaults.contactName),
      email: String(parsed.email ?? defaults.email),
      phone: String(parsed.phone ?? defaults.phone),
      sender: {
        ...defaults.sender,
        ...(parsed.sender ?? {}),
        country: "US",
      },
      returnAddress: {
        ...defaults.returnAddress,
        ...(parsed.returnAddress ?? {}),
        country: "US",
      },
      defaultProofLevel: normalizeProofLevel(parsed.defaultProofLevel ?? defaults.defaultProofLevel),
      defaultTemplateId: String(parsed.defaultTemplateId ?? defaults.defaultTemplateId),
      receiptFormat: parsed.receiptFormat === "email" ? "email" : "pdf",
      updatedAt: String(parsed.updatedAt ?? defaults.updatedAt),
    };
  } catch {
    return buildDefaultCustomerSettings();
  }
}

function writeStorage(settings: CustomerSettings) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

export function getCustomerSettings() {
  return readStorage();
}

export function saveCustomerSettings(settings: CustomerSettings) {
  const next = { ...settings, updatedAt: new Date().toISOString() };
  writeStorage(next);
  return next;
}

export function clearCustomerSettings() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}

export function getTemplateDefault(templateId: string | null | undefined) {
  return templates.find((template) => template.id === templateId) ?? templates[0];
}
