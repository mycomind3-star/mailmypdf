import { createHmac, timingSafeEqual } from "node:crypto";
import { getAppUrl, getEnv } from "@/lib/env";
import { mapLobEventToOrderStatus } from "@/lib/lob";
import {
  addOrderEvent,
  findOrderByLobLetterId,
  findOrderByProviderLetterId,
  recordWebhookEvent,
  sendOrderEmail,
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
  date_created?: string;
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
    resource,
  };
}

function getTrackedString(resource: Record<string, unknown>, key: string) {
  const value = resource[key];
  return typeof value === "string" && value.trim() ? value : null;
}

function buildOrderLink(orderId: string, token: string) {
  return `${getAppUrl()}/orders/${orderId}?token=${token}`;
}

export async function handleLobWebhook(request: Request) {
  const rawBody = await request.text();
  verifyWebhookSignature(rawBody, request.headers);

  const payload = JSON.parse(rawBody) as LobWebhookPayload;
  const { eventId, eventType, lobLetterId, resourceStatus, expectedDeliveryDate, resource } =
    extractWebhookDetails(payload);
  const eventKey =
    eventId ||
    [lobLetterId, eventType, resourceStatus, expectedDeliveryDate]
      .filter((value) => Boolean(String(value).trim()))
      .join(":");

  const stored = await recordWebhookEvent("lob", eventKey || null, eventType, payload);
  if (!stored) {
    return { received: true, duplicate: true } as const;
  }

  const order = lobLetterId
    ? ((await findOrderByLobLetterId(lobLetterId).catch(() => null)) ??
        (await findOrderByProviderLetterId(lobLetterId).catch(() => null)))
    : null;
  if (!order) {
    return { received: true, unmatched: true } as const;
  }

  const nextStatus = mapLobEventToOrderStatus(order.status, eventType, resourceStatus);
  const patch: Record<string, unknown> = {};

  if (nextStatus !== order.status) {
    patch.status = nextStatus;
  }

  const currentTrackingEvents =
    Array.isArray(order.provider_tracking_events) && order.provider_tracking_events.length
      ? order.provider_tracking_events
      : Array.isArray(order.lob_tracking_events)
        ? order.lob_tracking_events
        : [];
  const providerTrackingNumber =
    getTrackedString(resource, "tracking_number") ??
    getTrackedString(resource, "trackingNumber") ??
    getTrackedString(payload as Record<string, unknown>, "tracking_number");
  const trackingEvent = {
    event_id: eventId || null,
    event_type: eventType,
    status: nextStatus,
    resource_id: lobLetterId || null,
    resource_status: resourceStatus || null,
    tracking_number: providerTrackingNumber,
    created_at: String(payload.date_created ?? new Date().toISOString()),
  };

  patch.mail_provider = order.mail_provider ?? "lob";
  patch.provider_letter_id = order.provider_letter_id ?? lobLetterId ?? null;
  patch.provider_tracking_number = providerTrackingNumber ?? order.provider_tracking_number ?? null;
  patch.provider_tracking_events = [...currentTrackingEvents, trackingEvent].slice(-50);
  patch.provider_raw_response = payload;
  patch.lob_tracking_events = [...currentTrackingEvents, trackingEvent].slice(-50);

  if (expectedDeliveryDate) {
    patch.provider_expected_delivery_date = expectedDeliveryDate;
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

  if (nextStatus === "failed_provider_submission" && !order.failed_at) {
    patch.failed_at = new Date().toISOString();
  }

  if (nextStatus !== "failed_provider_submission" && order.status === "failed_provider_submission") {
    patch.failed_at = null;
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

  const orderLink = buildOrderLink(order.id, order.public_lookup_token);
  const notificationTasks: Promise<void>[] = [];

  if (nextStatus === "mailed" && !order.mailed_at) {
    notificationTasks.push(
      (async () => {
        try {
          await sendOrderEmail(
            order.email,
            "Your letter has been mailed",
            `<p>Your letter has been mailed.</p><p>Order link: <a href="${orderLink}">${orderLink}</a></p>`,
          );
        } catch (error) {
          await addOrderEvent(order.id, "email.mailed_failed", "Mailed confirmation email failed to send.", {
            error: error instanceof Error ? error.message : "Unknown Resend error",
          });
        }
      })(),
    );
  }

  if (nextStatus === "delivered" && !order.delivered_at) {
    notificationTasks.push(
      (async () => {
        try {
          await sendOrderEmail(
            order.email,
            "Your letter was delivered",
            `<p>Your letter was delivered.</p><p>Order link: <a href="${orderLink}">${orderLink}</a></p>`,
          );
        } catch (error) {
          await addOrderEvent(order.id, "email.delivered_failed", "Delivered confirmation email failed to send.", {
            error: error instanceof Error ? error.message : "Unknown Resend error",
          });
        }
      })(),
    );
  }

  if (nextStatus === "returned" && !order.failed_at) {
    notificationTasks.push(
      (async () => {
        try {
          await sendOrderEmail(
            order.email,
            "Your letter was returned",
            `<p>Your letter was returned by the mail carrier.</p><p>Order link: <a href="${orderLink}">${orderLink}</a></p>`,
          );
        } catch (error) {
          await addOrderEvent(order.id, "email.returned_failed", "Returned confirmation email failed to send.", {
            error: error instanceof Error ? error.message : "Unknown Resend error",
          });
        }
      })(),
    );
  }

  if (nextStatus === "failed_provider_submission" && !order.failed_at) {
    notificationTasks.push(
      (async () => {
        try {
          await sendOrderEmail(
            order.email,
            "We need to review your letter",
            `<p>We could not complete the mailing submission yet.</p><p>Order link: <a href="${orderLink}">${orderLink}</a></p>`,
          );
        } catch (error) {
          await addOrderEvent(order.id, "email.provider_review_failed", "Failure review email failed to send.", {
            error: error instanceof Error ? error.message : "Unknown Resend error",
          });
        }
      })(),
    );
  }

  await Promise.all(notificationTasks);

  return {
    received: true,
    mailed: nextStatus === "mailed",
    delivered: nextStatus === "delivered",
    returned: nextStatus === "returned",
    failed: nextStatus === "failed_provider_submission",
    orderLink: nextStatus === "mailed" ? buildOrderLink(order.id, order.public_lookup_token) : null,
    order,
    nextStatus,
  } as const;
}
