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

export interface MailProvider {
  createLetter(input: CreateLetterInput): Promise<CreateLetterResult>;
  getLetter(providerLetterId: string): Promise<ProviderLetterStatus>;
}

class LobMailProvider implements MailProvider {
  async createLetter(input: CreateLetterInput): Promise<CreateLetterResult> {
    const response = await fetch("https://api.lob.com/v1/letters", {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${getEnv().LOB_API_KEY!}:`).toString("base64")}`,
        "Content-Type": "application/json",
      },
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

    const raw = await response.json();
    if (!response.ok) {
      throw new Error(raw?.message || "Lob letter creation failed.");
    }

    return { id: raw.id, raw };
  }

  async getLetter(providerLetterId: string): Promise<ProviderLetterStatus> {
    const response = await fetch(`https://api.lob.com/v1/letters/${providerLetterId}`, {
      headers: {
        Authorization: `Basic ${Buffer.from(`${getEnv().LOB_API_KEY!}:`).toString("base64")}`,
      },
    });
    const raw = await response.json();
    if (!response.ok) {
      throw new Error(raw?.message || "Lob lookup failed.");
    }

    return { status: raw?.status ?? "unknown", raw };
  }
}

export function getMailProvider(): MailProvider | null {
  if (!hasLobEnv()) {
    return null;
  }

  return new LobMailProvider();
}

