import { getTenantById, logWebhook } from "./db";

export type WebhookEvent =
  | "ticket.submitted"
  | "ticket.status_changed"
  | "ticket.assigned";

export interface WebhookPayload {
  event: WebhookEvent;
  tenantId: number;
  tenantName: string;
  ticket: {
    number: string;
    subject: string;
    product: string;
    priority: string;
    status: string;
    previousStatus?: string;
    createdAt: string;
    resolvedAt: string | null;
  };
  customer: {
    name: string;
    email: string;
    phone?: string | null;
  };
  assignee?: {
    name: string | null;
    email: string | null;
  } | null;
  statusPageUrl: string;
}

export async function fireWebhook(
  tenantId: number,
  event: WebhookEvent,
  payload: WebhookPayload,
  ticketId?: number
): Promise<void> {
  const tenant = await getTenantById(tenantId);
  if (!tenant?.ghlWebhookUrl) return;

  // Check per-event toggles
  if (event === "ticket.submitted" && !tenant.ghlWebhookNewTicket) return;
  if (event === "ticket.status_changed" && !tenant.ghlWebhookStatusChange) return;
  if (event === "ticket.assigned" && !tenant.ghlWebhookAssignment) return;

  const payloadStr = JSON.stringify(payload);

  try {
    const response = await fetch(tenant.ghlWebhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-AIA-Event": event,
        "X-AIA-Tenant": tenant.slug,
      },
      body: payloadStr,
      signal: AbortSignal.timeout(10000), // 10s timeout
    });

    await logWebhook({
      tenantId,
      ticketId,
      event,
      webhookUrl: tenant.ghlWebhookUrl,
      payload: payloadStr,
      statusCode: response.status,
      success: response.ok,
      errorMessage: response.ok ? undefined : `HTTP ${response.status}`,
    });
  } catch (err: any) {
    await logWebhook({
      tenantId,
      ticketId,
      event,
      webhookUrl: tenant.ghlWebhookUrl,
      payload: payloadStr,
      success: false,
      errorMessage: err?.message ?? "Unknown error",
    });
  }
}

export function buildStatusPageUrl(tenantSlug: string, ticketNumber: string): string {
  // Subdomain-based URL: https://{slug}.aia-supportdesk.com/status?ticket={ticketNumber}
  return `https://${tenantSlug}.aia-supportdesk.com/status?ticket=${ticketNumber}`;
}
