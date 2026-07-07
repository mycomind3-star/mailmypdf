import { createHmac, timingSafeEqual } from "node:crypto";
import { getAppUrl, getEnv } from "@/lib/env";
import {
  addOrderEvent,
  findOrderByLobLetterId,
  recordWebhookEvent,
  updateOrder,
} from "@/lib/orders";

const WEBHOOK_REPLAY_WINDOW_MS = 5 * 60 * 1000;

type LobWebhookPayload = Record<string, unknown> & {
  id?: string;
  event_id?: string;
  type?: string;
  event_type?: { id?: string; resource?: string } | string;
  body?: Record<string, unknown>;
  data?: Record<string, unknown>;
  object?: Record<string, unknown>;
  letter_id?: string;
  reference_id?: string;
  status?: string;
  expected_delivery_date?: string;
  target_delivery_date?: string;
};

function parseTimestamp(value: string) {
  const numeric = Number(value);
  if (Number.isFinite(numeric)) {
    return numeric < 1e12 ? numeric * 1000 : numeric;
  }

  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? null : parsed;
}

function verifyWebhookSignature(rawBody: string, headers: Headers) {
  const secret = getEnv().LOB_WEBHOOK_SECRET?.trim();
  if (!secret) {
    throw new Error("Missing Lob webhook secret.");
  }

  const signature = headers.get("Lob-Signature") ?? "";
  const timestamp = headers.get("Lob-Signature-Timestamp") ?? "";
  if (!signature || !timestamp) {
    throw new Error("Missing Lob webhook signature headers.");
  }

  const parsedTimestamp = parseTimestamp(timestamp);
  if (parsedTimestamp === null) {
    throw new Error("Invalid Lob webhook timestamp.");
  }

  if (Math.abs(Date.now() - parsedTimestamp) > WEBHOOK_REPLAY_WINDOW_MS) {
    throw new Error("Lob webhook timestamp is outside the allowed window.");
  }

  const expected = createHmac("sha256", secret).update(`${timestamp}.${rawBody}`).digest("hex");
  const expectedBuffer = Buffer.from(expected, "hex");
  const providedBuffer = Buffer.from(signature.trim().toLowerCase(), "hex");

  if (expectedBuffer.length !== providedBuffer.length || !timingSafeEqual(expectedBuffer, providedBuffer)) {
    throw new Error("Invalid Lob webhook signature.");
  }
}

function extractWebhookDetails(payload: LobWebhookPayload) {
  const eventId = String(payload.id ?? payload.event_id ?? "");
  const eventType =
    String(
      typeof payload.event_type === "string"
        ? payload.event_type
        : payload.event_type?.id ?? payload.type ?? "",
    ) || "lob.webhook";

  const resource =
    (payload.body ?? payload.data ?? payload.object ?? {}) as Record<string, unknown>;

  const lobLetterId = String(
    resource.id ??
      payload.reference_id ??
      payload.letter_id ??
      resource.letter_id ??
      "",
  );

  const resourceStatus = String(
    resource.status ??
      payload.status ??
      resource.event_type ??
      "",
  );

  const expectedDeliveryDate = String(
    resource.expected_delivery_date ??
      payload.expected_delivery_date ??
      resource.target_delivery_date ??
      payload.target_delivery_date ??
      "",
  );

  return {
    eventId,
    eventType,
    lobLetterId,
    resourceStatus,
    expectedDeliveryDate,
  };
}

function rankStatus(status: string) {
  switch (status) {
    case "draft":
      return 0;
    case "uploaded":
      return 1;
    case "priced":
      return 2;
    case "checkout_created":
      return 3;
    case "paid":
      return 4;
    case "submitted_to_provider":
      return 5;
    case "provider_processing":
      return 6;
    case "in_transit":
      return 7;
    case "mailed":
      return 8;
    case "delivered":
      return 9;
    case "returned":
      return 9;
    case "failed_provider_submission":
      return 4;
    case "failed_payment":
      return 4;
    default:
      return 0;
  }
}

function deriveOrderStatus(currentStatus: string, eventType: string, resourceStatus: string) {
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

  return rankStatus(nextStatus) >= rankStatus(currentStatus) ? nextStatus : currentStatus;
}

function buildOrderLink(orderId: string, token: string) {
  return `${getAppUrl()}/orders/${orderId}?token=${token}`;
}

export async function handleLobWebhook(request: Request) {
  const rawBody = await request.text();
  verifyWebhookSignature(rawBody, request.headers);

  const payload = JSON.parse(rawBody) as LobWebhookPayload;
  const { eventId, eventType, lobLetterId, resourceStatus, expectedDeliveryDate } =
    extractWebhookDetails(payload);

  const stored = await recordWebhookEvent("lob", eventId || null, eventType, payload);
  if (!stored) {
    return { received: true, duplicate: true } as const;
  }

  const order = lobLetterId ? await findOrderByLobLetterId(lobLetterId).catch(() => null) : null;
  if (!order) {
    return { received: true, unmatched: true } as const;
  }

  const nextStatus = deriveOrderStatus(order.status, eventType, resourceStatus);
  const patch: Record<string, unknown> = {};

  if (nextStatus !== order.status) {
    patch.status = nextStatus;
  }

  const currentTrackingEvents = Array.isArray(order.lob_tracking_events) ? order.lob_tracking_events : [];
  const trackingEvent = {
    event_id: eventId || null,
    event_type: eventType,
    status: nextStatus,
    resource_id: lobLetterId || null,
    created_at: String(payload.date_created ?? new Date().toISOString()),
  };

  patch.lob_tracking_events = [...currentTrackingEvents, trackingEvent].slice(-50);

  if (expectedDeliveryDate) {
    patch.lob_expected_delivery_date = expectedDeliveryDate;
  }

  if (nextStatus === "mailed" && !order.mailed_at) {
    patch.mailed_at = new Date().toISOString();
  }

  if (nextStatus === "delivered" && !order.delivered_at) {
    patch.delivered_at = new Date().toISOString();
  }

  if (nextStatus === "returned" && !order.failed_at) {
    patch.failed_at = new Date().toISOString();
  }

  if (Object.keys(patch).length > 0) {
    await updateOrder(order.id, patch);
  }

  await addOrderEvent(order.id, `lob.${nextStatus}`, "Lob status update received.", {
    event_id: eventId || null,
    event_type: eventType,
    lob_letter_id: lobLetterId || null,
    resource_status: resourceStatus || null,
  });

  return {
    received: true,
    mailed: nextStatus === "mailed",
    orderLink: nextStatus === "mailed" ? buildOrderLink(order.id, order.public_lookup_token) : null,
    order,
    nextStatus,
  } as const;
}
