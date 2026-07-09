import { orderStatusLabels } from "./site-content";
import type { ProofLevel } from "./proof-levels";

export type DemoEvent = {
  eventType: string;
  message: string;
  createdAt: string;
};

export type DemoOrder = {
  id: string;
  token: string;
  email: string;
  status: keyof typeof orderStatusLabels;
  fileName: string;
  fileSizeBytes: number;
  pageCount: number;
  fileDataUrl?: string;
  senderName: string;
  senderAddressLine1: string;
  senderCity: string;
  senderState: string;
  senderPostalCode: string;
  recipientName: string;
  recipientAddressLine1: string;
  recipientCity: string;
  recipientState: string;
  recipientPostalCode: string;
  priceCents: number;
  proofLevel: ProofLevel;
  templateTitle: string;
  currency: "usd";
  stripeCheckoutSessionId?: string;
  lobLetterId?: string;
  lobExpectedDeliveryDate?: string | null;
  lobTrackingEvents?: Array<Record<string, unknown>>;
  lobRawResponse?: unknown;
  mailProvider?: string | null;
  providerLetterId?: string | null;
  providerTrackingNumber?: string | null;
  providerExpectedDeliveryDate?: string | null;
  providerTrackingEvents?: Array<Record<string, unknown>>;
  providerRawResponse?: unknown;
  addressVerificationStatus?: string | null;
  addressVerificationRaw?: unknown;
  createdAt: string;
  paidAt?: string;
  submittedToProviderAt?: string;
  mailedAt?: string;
  deliveredAt?: string;
  failedAt?: string;
  events: DemoEvent[];
  adminNotes?: string;
};

let ordersCache: DemoOrder[] | null = null;

function getCache() {
  if (!ordersCache) {
    ordersCache = seedOrders();
  }
  return ordersCache;
}

export function listDemoOrders() {
  return getCache();
}

export function getDemoOrder(id: string) {
  return listDemoOrders().find((order) => order.id === id);
}

export function upsertDemoOrder(order: DemoOrder) {
  const orders = listDemoOrders();
  const next = orders.some((current) => current.id === order.id)
    ? orders.map((current) => (current.id === order.id ? order : current))
    : [order, ...orders];
  ordersCache = next;
  return order;
}

export function patchDemoOrder(id: string, updates: Partial<DemoOrder>) {
  const order = getDemoOrder(id);
  if (!order) return undefined;

  const next = { ...order, ...updates };
  upsertDemoOrder(next);
  return next;
}

export function appendDemoEvent(id: string, event: DemoEvent) {
  const order = getDemoOrder(id);
  if (!order) return undefined;

  const next = {
    ...order,
    events: [event, ...(order.events ?? [])].slice(0, 20),
  };
  upsertDemoOrder(next);
  return next;
}

function seedOrders(): DemoOrder[] {
  const now = new Date().toISOString();
  const seeded: DemoOrder[] = [
    {
      id: "demo-order-1",
      token: "demo-token-1",
      email: "customer@example.com",
      status: "provider_processing",
      fileName: "notice.pdf",
      fileSizeBytes: 221032,
      pageCount: 3,
      senderName: "Jordan Smith",
      senderAddressLine1: "123 Main St",
      senderCity: "Los Angeles",
      senderState: "CA",
      senderPostalCode: "90001",
      recipientName: "Jane Doe",
      recipientAddressLine1: "500 Market St",
      recipientCity: "San Francisco",
      recipientState: "CA",
      recipientPostalCode: "94105",
      priceCents: 699,
      proofLevel: "proof",
      templateTitle: "Client payment reminder",
      currency: "usd",
      stripeCheckoutSessionId: "cs_demo_123",
      lobLetterId: "ltr_demo_456",
      createdAt: now,
      paidAt: now,
      submittedToProviderAt: now,
      events: [
        {
          eventType: "provider.submitted",
          message: "The proof file was created.",
          createdAt: now,
        },
        {
          eventType: "payment.received",
          message: "Payment received.",
          createdAt: now,
        },
      ],
    },
    {
      id: "demo-order-2",
      token: "demo-token-2",
      email: "ops@example.com",
      status: "failed_provider_submission",
      fileName: "business-letter.pdf",
      fileSizeBytes: 432110,
      pageCount: 2,
      senderName: "Acme Support",
      senderAddressLine1: "1 Market Square",
      senderCity: "Austin",
      senderState: "TX",
      senderPostalCode: "78701",
      recipientName: "Client Services",
      recipientAddressLine1: "88 Broad Ave",
      recipientCity: "Seattle",
      recipientState: "WA",
      recipientPostalCode: "98101",
      priceCents: 499,
      proofLevel: "standard",
      templateTitle: "General formal business letter",
      currency: "usd",
      createdAt: now,
      paidAt: now,
      events: [
        {
          eventType: "provider.failed",
          message: "The proof file needs review.",
          createdAt: now,
        },
      ],
      adminNotes: "Retry after verifying the recipient address.",
    },
  ];

  return seeded;
}
