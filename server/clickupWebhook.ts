/**
 * ClickUp → AIA SupportDesk status sync
 *
 * ClickUp fires a POST to /api/webhooks/clickup whenever a task status changes.
 * We look up the ticket by its stored clickupTaskId, map the ClickUp status to
 * our internal status, update the ticket, log the activity, and fire the same
 * GHL side-effects that the manual updateStatus tRPC procedure fires.
 *
 * Status mapping (case-insensitive):
 *   ClickUp status contains "complete" or "done"  → "completed"
 *   ClickUp status contains "in progress"         → "in_progress"
 *   ClickUp status contains "stuck"               → "stuck"
 *   ClickUp status contains "close" or "closed"   → "closed"
 *   anything else                                 → ignored (no update)
 *
 * Signature verification:
 *   ClickUp signs every request with HMAC-SHA256 using the webhook secret
 *   returned when the webhook was registered.  We store that secret per-tenant
 *   in tenants.clickupWebhookSecret.  If the secret is not yet stored we still
 *   accept the request (graceful degradation) but log a warning.
 */

import crypto from "crypto";
import type { Request, Response } from "express";
import {
  getTicketByClickUpTaskId,
  updateTicketStatus,
  logActivity,
  getTenantById,
  getUserById,
} from "./db";
import { fireWebhook, buildStatusPageUrl } from "./ghlWebhook";
import {
  updateGhlOpportunityStage,
  sendGhlEmail,
  sendGhlSms,
  buildGhlNotificationMessages,
  buildGhlCustomFields,
} from "./ghl";

type SupportDeskStatus = "new" | "in_progress" | "stuck" | "completed" | "closed";

/**
 * Map a raw ClickUp status string to a SupportDesk status.
 * Returns null if the status should be ignored.
 */
function mapClickUpStatus(raw: string): SupportDeskStatus | null {
  const s = raw.toLowerCase().trim();
  if (s.includes("complete") || s.includes("done")) return "completed";
  if (s.includes("in progress") || s === "in_progress") return "in_progress";
  if (s.includes("stuck")) return "stuck";
  if (s.includes("close")) return "closed";
  return null;
}

/**
 * Verify the X-Signature header sent by ClickUp.
 * Returns true if valid or if no secret is configured (graceful degradation).
 */
function verifySignature(
  rawBody: string,
  signature: string | undefined,
  secret: string | null | undefined
): boolean {
  if (!secret) {
    console.warn("[ClickUp Webhook] No webhook secret configured; skipping signature check");
    return true;
  }
  if (!signature) {
    console.warn("[ClickUp Webhook] Missing X-Signature header");
    return false;
  }
  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  } catch {
    return false;
  }
}

/**
 * Express handler for POST /api/webhooks/clickup
 *
 * The route MUST be registered with express.raw() so we get the raw body for
 * signature verification, then we parse JSON ourselves.
 */
export async function handleClickUpWebhook(req: Request, res: Response): Promise<void> {
  // ── 1. Parse raw body ──────────────────────────────────────────────────────
  const rawBody = (req.body as Buffer).toString("utf-8");
  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(rawBody) as Record<string, unknown>;
  } catch {
    res.status(400).json({ error: "Invalid JSON" });
    return;
  }

  // ── 2. Only handle taskStatusUpdated events ────────────────────────────────
  const event = payload.event as string | undefined;
  if (event !== "taskStatusUpdated") {
    res.status(200).json({ ok: true, skipped: true });
    return;
  }

  // ── 3. Extract task_id and new status from payload ─────────────────────────
  const taskId = payload.task_id as string | undefined;
  if (!taskId) {
    res.status(400).json({ error: "Missing task_id" });
    return;
  }

  const historyItems = payload.history_items as Array<Record<string, unknown>> | undefined;
  const afterObj = historyItems?.[0]?.after as Record<string, unknown> | undefined;
  const afterStatus = afterObj?.status as string | undefined;

  if (!afterStatus) {
    res.status(400).json({ error: "Cannot determine new status from payload" });
    return;
  }

  // ── 4. Look up the ticket ──────────────────────────────────────────────────
  const ticket = await getTicketByClickUpTaskId(taskId);
  if (!ticket) {
    console.log(`[ClickUp Webhook] No ticket found for task ${taskId} — ignoring`);
    res.status(200).json({ ok: true, skipped: true });
    return;
  }

  // ── 5. Verify signature using the tenant's stored webhook secret ───────────
  const tenant = await getTenantById(ticket.tenantId);
  const secret = (tenant as Record<string, unknown> | undefined)?.clickupWebhookSecret as string | null | undefined;
  const signature = req.headers["x-signature"] as string | undefined;

  if (!verifySignature(rawBody, signature, secret)) {
    console.warn(`[ClickUp Webhook] Signature mismatch for task ${taskId}`);
    res.status(401).json({ error: "Invalid signature" });
    return;
  }

  // ── 6. Map ClickUp status → SupportDesk status ────────────────────────────
  const newStatus = mapClickUpStatus(afterStatus);
  if (!newStatus) {
    console.log(`[ClickUp Webhook] Unmapped ClickUp status "${afterStatus}" for task ${taskId} — ignoring`);
    res.status(200).json({ ok: true, skipped: true });
    return;
  }

  // Skip if already at this status (idempotency)
  if (ticket.status === newStatus) {
    res.status(200).json({ ok: true, skipped: true });
    return;
  }

  // ── 7. Update ticket status in DB ─────────────────────────────────────────
  const previousStatus = ticket.status;
  await updateTicketStatus(ticket.id, newStatus);

  // ── 8. Log activity ────────────────────────────────────────────────────────
  const actorUsername = (historyItems?.[0]?.user as Record<string, unknown> | undefined)?.username as string | undefined;
  const actorName = actorUsername ? `${actorUsername} (via ClickUp)` : "ClickUp";

  logActivity({
    ticketId: ticket.id,
    event: "status.changed",
    actorId: null,
    actorName,
    meta: {
      from: previousStatus,
      to: newStatus,
      clickupTaskId: taskId,
      clickupStatus: afterStatus,
      source: "clickup_webhook",
    },
  }).catch(console.error);

  console.log(
    `[ClickUp Webhook] Ticket ${ticket.ticketNumber}: ${previousStatus} → ${newStatus} (task ${taskId})`
  );

  // ── 9. Fire GHL side-effects (same as manual updateStatus) ────────────────
  if (tenant && ticket.tenantId > 0) {
    // GHL outbound webhook
    const assignee = ticket.assigneeId ? await getUserById(ticket.assigneeId) : null;
    fireWebhook(ticket.tenantId, "ticket.status_changed", {
      event: "ticket.status_changed",
      tenantId: ticket.tenantId,
      tenantName: tenant.name,
      ticket: {
        number: ticket.ticketNumber,
        subject: ticket.subject,
        product: ticket.product,
        priority: ticket.priority,
        status: newStatus,
        previousStatus,
        createdAt: ticket.createdAt.toISOString(),
        resolvedAt: (newStatus === "completed" || newStatus === "closed") ? new Date().toISOString() : null,
      },
      customer: { name: ticket.name, email: ticket.email, phone: ticket.phone },
      assignee: assignee ? { name: assignee.name, email: assignee.email } : null,
      statusPageUrl: buildStatusPageUrl(tenant.slug, ticket.ticketNumber),
    }, ticket.id).catch(console.error);

    // GHL API: update opportunity stage + send notification
    if (tenant.ghlApiKey && tenant.ghlLocationId) {
      (async () => {
        try {
          const stageMap: Record<string, string | null | undefined> = {
            new: tenant.ghlStageNew,
            in_progress: tenant.ghlStageInProgress,
            stuck: tenant.ghlStageStuck,
            completed: tenant.ghlStageCompleted,
            closed: tenant.ghlStageClosed,
          };
          const stageId = stageMap[newStatus];
          const oppStatus = newStatus === "completed" ? "won" : newStatus === "closed" ? "lost" : undefined;
          if (ticket.ghlOpportunityId && stageId) {
            await updateGhlOpportunityStage(
              tenant.ghlApiKey!,
              ticket.ghlOpportunityId,
              stageId,
              oppStatus,
              buildGhlCustomFields(tenant, {
                ticketNumber: ticket.ticketNumber,
                description: ticket.description,
                priority: ticket.priority,
                product: ticket.product,
                status: newStatus,
                ticketUrl: buildStatusPageUrl(tenant.slug, ticket.ticketNumber),
                loomUrl: ticket.loomUrl,
              })
            );
          }
          const msgs = buildGhlNotificationMessages(newStatus, {
            name: ticket.name,
            ticketNumber: ticket.ticketNumber,
            subject: ticket.subject,
            statusPageUrl: buildStatusPageUrl(tenant.slug, ticket.ticketNumber),
          });
          const contactId = ticket.ghlContactId;
          if (msgs && contactId) {
            if (tenant.ghlSendEmail) {
              await sendGhlEmail(tenant.ghlApiKey!, tenant.ghlLocationId!, {
                contactId, toEmail: ticket.email, subject: msgs.subject, body: msgs.emailHtml,
              });
            }
            if (tenant.ghlSendSms && ticket.phone) {
              await sendGhlSms(tenant.ghlApiKey!, tenant.ghlLocationId!, {
                contactId, toPhone: ticket.phone, message: msgs.smsText,
              });
            }
          }
        } catch (err) {
          console.error("[ClickUp Webhook] GHL side-effect error:", err);
        }
      })();
    }
  }

  res.status(200).json({ ok: true, ticketNumber: ticket.ticketNumber, status: newStatus });
}
