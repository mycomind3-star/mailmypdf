import { getEnv, hasLobEnv } from "@/lib/env";

export interface CreateLetterInput {
  to: {
    name: string;
    address_line1: string;
    address_line2?: string;
    address_city: string;
    address_state: string;
    address_zip: string;
    address_country: "US";
  };
  from: {
    name: string;
    address_line1: string;
    address_line2?: string;
    address_city: string;
    address_state: string;
    address_zip: string;
    address_country: "US";
  };
  file: string;
  color?: boolean;
  double_sided?: boolean;
  address_placement?: "top_first_page";
  metadata?: Record<string, string>;
}

export interface CreateLetterResult {
  id: string;
  raw: unknown;
}

export interface ProviderLetterStatus {
  status: string;
  raw: unknown;
}

export interface LobAddressVerificationInput {
  primaryLine: string;
  city: string;
  state: string;
  zipCode: string;
}

export interface LobAddressVerificationResult {
  status: string;
  deliverability: string | null;
  raw: unknown;
}

export interface MailProvider {
  createLetter(input: CreateLetterInput): Promise<CreateLetterResult>;
  getLetter(providerLetterId: string): Promise<ProviderLetterStatus>;
}

async function lobRequest(path: string, init?: RequestInit) {
  const response = await fetch(`https://api.lob.com/v1${path}`, {
    ...init,
    headers: {
      Authorization: `Basic ${Buffer.from(`${getEnv().LOB_API_KEY!}:`).toString("base64")}`,
      ...(init?.headers ?? {}),
    },
  });

  const raw = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(raw?.message || raw?.error || "Lob request failed.");
  }

  return raw as Record<string, unknown>;
}

class LobMailProvider implements MailProvider {
  async createLetter(input: CreateLetterInput): Promise<CreateLetterResult> {
    const raw = await lobRequest("/letters", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: input.to,
        from: input.from,
        file: input.file,
        color: input.color ?? false,
        double_sided: input.double_sided ?? false,
        address_placement: input.address_placement ?? "top_first_page",
        metadata: input.metadata ?? {},
      }),
    });

    return { id: String(raw.id ?? ""), raw };
  }

  async getLetter(providerLetterId: string): Promise<ProviderLetterStatus> {
    const raw = await lobRequest(`/letters/${providerLetterId}`);
    return { status: String(raw?.status ?? "unknown"), raw };
  }
}

export async function verifyAddressWithLob(input: LobAddressVerificationInput): Promise<LobAddressVerificationResult> {
  const raw = await lobRequest("/us_verifications", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      primary_line: input.primaryLine,
      city: input.city,
      state: input.state,
      zip_code: input.zipCode,
    }),
  });

  return {
    status: String(raw?.deliverability ?? raw?.status ?? "unknown"),
    deliverability: typeof raw?.deliverability === "string" ? raw.deliverability : null,
    raw,
  };
}

const statusRank: Record<string, number> = {
  draft: 0,
  uploaded: 1,
  priced: 2,
  checkout_created: 3,
  paid: 4,
  submitted_to_provider: 5,
  provider_processing: 6,
  in_transit: 7,
  mailed: 8,
  delivered: 9,
  returned: 9,
  failed_provider_submission: 4,
  failed_payment: 4,
};

export function mapLobEventToOrderStatus(currentStatus: string, eventType: string, resourceStatus: string) {
  const text = `${eventType} ${resourceStatus}`.toLowerCase();
  let nextStatus = currentStatus;

  if (text.includes("deliver")) {
    nextStatus = "delivered";
  } else if (text.includes("return")) {
    nextStatus = "returned";
  } else if (text.includes("mailed")) {
    nextStatus = "mailed";
  } else if (
    text.includes("processed_for_delivery") ||
    text.includes("in_transit") ||
    text.includes("in transit")
  ) {
    nextStatus = "in_transit";
  } else if (
    text.includes("fail") ||
    text.includes("error") ||
    text.includes("reject") ||
    text.includes("invalid")
  ) {
    nextStatus = "failed_provider_submission";
  } else if (
    text.includes("created") ||
    text.includes("received") ||
    text.includes("render") ||
    text.includes("print") ||
    text.includes("production") ||
    text.includes("queued") ||
    text.includes("submitted")
  ) {
    nextStatus = "provider_processing";
  }

  if (currentStatus === "delivered" || currentStatus === "returned") {
    return currentStatus;
  }

  if (nextStatus === "failed_provider_submission") {
    return nextStatus;
  }

  return (statusRank[nextStatus] ?? 0) >= (statusRank[currentStatus] ?? 0) ? nextStatus : currentStatus;
}

export function getMailProvider(): MailProvider | null {
  if (!hasLobEnv()) {
    return null;
  }

  return new LobMailProvider();
}
