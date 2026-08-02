/**
 * GoHighLevel (GHL) API Service
 *
 * Handles all GHL API interactions for the support ticket system:
 * - Contact upsert: search by email → phone → create
 * - Opportunity create / stage update
 * - Email and SMS notifications via GHL
 * - Pipeline and stage listing for onboarding UI
 *
 * All functions accept a `apiKey` (sub-account API key) and `locationId`.
 * GHL API v2 base: https://services.leadconnectorhq.com
 */

const GHL_BASE = "https://services.leadconnectorhq.com";
const GHL_VERSION = "2021-07-28";

function ghlHeaders(apiKey: string) {
  return {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
    Version: GHL_VERSION,
  };
}

// ── Types ────────────────────────────────────────────────────────────────────

export interface GhlContact {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
}

export interface GhlOpportunity {
  id: string;
  name: string;
  pipelineId: string;
  pipelineStageId: string;
  status: string;
  contactId: string;
}

export interface GhlPipeline {
  id: string;
  name: string;
  stages: { id: string; name: string }[];
}

// ── Contact Upsert ───────────────────────────────────────────────────────────

/**
 * Search for a GHL contact by email, then phone, then create if not found.
 * Returns the contact ID.
 */
export async function upsertGhlContact(
  apiKey: string,
  locationId: string,
  data: { name: string; email: string; phone?: string }
): Promise<string> {
  const headers = ghlHeaders(apiKey);

  // 1. Search by email
  const emailSearch = await fetch(
    `${GHL_BASE}/contacts/search/duplicate?locationId=${encodeURIComponent(locationId)}&email=${encodeURIComponent(data.email)}`,
    { headers }
  );
  if (emailSearch.ok) {
    const emailResult = await emailSearch.json() as { contact?: GhlContact };
    if (emailResult.contact?.id) {
      // Update the contact with latest info
      await updateGhlContact(apiKey, emailResult.contact.id, data);
      return emailResult.contact.id;
    }
  }

  // 2. Search by phone (if provided)
  if (data.phone) {
    const phoneSearch = await fetch(
      `${GHL_BASE}/contacts/search/duplicate?locationId=${encodeURIComponent(locationId)}&phone=${encodeURIComponent(data.phone)}`,
      { headers }
    );
    if (phoneSearch.ok) {
      const phoneResult = await phoneSearch.json() as { contact?: GhlContact };
      if (phoneResult.contact?.id) {
        await updateGhlContact(apiKey, phoneResult.contact.id, data);
        return phoneResult.contact.id;
      }
    }
  }

  // 3. Create new contact
  const nameParts = data.name.trim().split(/\s+/);
  const firstName = nameParts[0] ?? data.name;
  const lastName = nameParts.slice(1).join(" ") || undefined;

  const createResp = await fetch(`${GHL_BASE}/contacts/`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      locationId,
      firstName,
      lastName,
      email: data.email,
      phone: data.phone ?? undefined,
      source: "AIA SupportDesk",
    }),
  });

  if (!createResp.ok) {
    const err = await createResp.text();
    throw new Error(`GHL create contact failed: ${createResp.status} ${err}`);
  }

  const created = await createResp.json() as { contact: GhlContact };
  return created.contact.id;
}

async function updateGhlContact(
  apiKey: string,
  contactId: string,
  data: { name: string; email: string; phone?: string }
): Promise<void> {
  const nameParts = data.name.trim().split(/\s+/);
  const firstName = nameParts[0] ?? data.name;
  const lastName = nameParts.slice(1).join(" ") || undefined;

  await fetch(`${GHL_BASE}/contacts/${contactId}`, {
    method: "PUT",
    headers: ghlHeaders(apiKey),
    body: JSON.stringify({
      firstName,
      lastName,
      email: data.email,
      phone: data.phone ?? undefined,
    }),
  });
}

// ── Opportunity ──────────────────────────────────────────────────────────────

/**
 * Create a new GHL opportunity linked to a contact.
 * Returns the opportunity ID.
 */
export async function createGhlOpportunity(
  apiKey: string,
  locationId: string,
  data: {
    contactId: string;
    pipelineId: string;
    stageId: string;
    name: string;         // formatted as "TICKET# - subject"
    status?: string;
    customFields?: { id: string; value: string }[];
  }
): Promise<string> {
  const resp = await fetch(`${GHL_BASE}/opportunities/`, {
    method: "POST",
    headers: ghlHeaders(apiKey),
    body: JSON.stringify({
      locationId,
      pipelineId: data.pipelineId,
      pipelineStageId: data.stageId,
      contactId: data.contactId,
      name: data.name,
      status: data.status ?? "open",
      source: "AIA SupportDesk",
      ...(data.customFields && data.customFields.length > 0 ? { customFields: data.customFields } : {}),
    }),
  });

  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(`GHL create opportunity failed: ${resp.status} ${err}`);
  }

  const result = await resp.json() as { opportunity: GhlOpportunity };
  return result.opportunity.id;
}

/**
 * Move an existing opportunity to a new pipeline stage.
 */
export async function updateGhlOpportunityStage(
  apiKey: string,
  opportunityId: string,
  stageId: string,
  opportunityStatus?: "open" | "won" | "lost" | "abandoned",
  customFields?: { id: string; value: string }[]
): Promise<void> {
  const resp = await fetch(`${GHL_BASE}/opportunities/${opportunityId}`, {
    method: "PUT",
    headers: ghlHeaders(apiKey),
    body: JSON.stringify({
      pipelineStageId: stageId,
      ...(opportunityStatus ? { status: opportunityStatus } : {}),
      ...(customFields && customFields.length > 0 ? { customFields } : {}),
    }),
  });

  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(`GHL update opportunity failed: ${resp.status} ${err}`);
  }
}

// ── Notifications ────────────────────────────────────────────────────────────

/**
 * Send an email to a GHL contact via the Conversations API.
 */
export async function sendGhlEmail(
  apiKey: string,
  locationId: string,
  data: {
    contactId: string;
    toEmail: string;
    subject: string;
    body: string; // HTML or plain text
  }
): Promise<void> {
  const resp = await fetch(`${GHL_BASE}/conversations/messages/outbound`, {
    method: "POST",
    headers: ghlHeaders(apiKey),
    body: JSON.stringify({
      locationId,
      contactId: data.contactId,
      type: "Email",
      subject: data.subject,
      html: data.body,
      to: data.toEmail,
    }),
  });

  if (!resp.ok) {
    const err = await resp.text();
    console.error(`[GHL] Send email failed: ${resp.status} ${err}`);
    // Non-fatal: log but don't throw so ticket flow continues
  }
}

/**
 * Send an SMS to a GHL contact via the Conversations API.
 */
export async function sendGhlSms(
  apiKey: string,
  locationId: string,
  data: {
    contactId: string;
    toPhone: string;
    message: string;
  }
): Promise<void> {
  const resp = await fetch(`${GHL_BASE}/conversations/messages/outbound`, {
    method: "POST",
    headers: ghlHeaders(apiKey),
    body: JSON.stringify({
      locationId,
      contactId: data.contactId,
      type: "SMS",
      message: data.message,
      to: data.toPhone,
    }),
  });

  if (!resp.ok) {
    const err = await resp.text();
    console.error(`[GHL] Send SMS failed: ${resp.status} ${err}`);
    // Non-fatal: log but don't throw
  }
}

// ── Pipeline / Stage listing (for onboarding UI) ─────────────────────────────

/**
 * Fetch all pipelines and their stages for a GHL sub-account.
 */
export async function getGhlPipelines(
  apiKey: string,
  locationId: string
): Promise<GhlPipeline[]> {
  const resp = await fetch(
    `${GHL_BASE}/opportunities/pipelines?locationId=${encodeURIComponent(locationId)}`,
    { headers: ghlHeaders(apiKey) }
  );

  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(`GHL get pipelines failed: ${resp.status} ${err}`);
  }

  const result = await resp.json() as { pipelines: GhlPipeline[] };
  return result.pipelines ?? [];
}

// ── Notification message builders ────────────────────────────────────────────

const STATUS_LABELS: Record<string, string> = {
  new: "New",
  in_progress: "In Progress",
  stuck: "Needs Attention",
  completed: "Completed",
  closed: "Closed",
};

const STATUS_MESSAGES: Record<string, { subject: (ticketNumber: string) => string; email: (name: string, ticketNumber: string, subject: string, statusPageUrl: string) => string; sms: (name: string, ticketNumber: string, statusPageUrl: string) => string }> = {
  new: {
    subject: (ticketNumber: string) => `Support Ticket ${ticketNumber} Received`,
    email: (name, ticketNumber, subject, statusPageUrl) =>
      `<p>Hi ${name},</p><p>We've received your support ticket <strong>${ticketNumber}</strong>: <em>${subject}</em>.</p><p>Our team will review it shortly. You can check the status at any time here: <a href="${statusPageUrl}">${statusPageUrl}</a></p><p>Thank you,<br/>Support Team</p>`,
    sms: (name, ticketNumber, statusPageUrl) =>
      `Hi ${name}, your support ticket ${ticketNumber} has been received. Track status: ${statusPageUrl}`,
  },
  in_progress: {
    subject: (ticketNumber: string) => `Support Ticket ${ticketNumber} — Now In Progress`,
    email: (name, ticketNumber, subject, statusPageUrl) =>
      `<p>Hi ${name},</p><p>Good news! Your support ticket <strong>${ticketNumber}</strong>: <em>${subject}</em> is now being worked on by our team.</p><p>Track your ticket status: <a href="${statusPageUrl}">${statusPageUrl}</a></p><p>Thank you,<br/>Support Team</p>`,
    sms: (name, ticketNumber, statusPageUrl) =>
      `Hi ${name}, your support ticket ${ticketNumber} is now in progress. Track status: ${statusPageUrl}`,
  },
  stuck: {
    subject: (ticketNumber: string) => `Support Ticket ${ticketNumber} — We Need More Info`,
    email: (name, ticketNumber, subject, statusPageUrl) =>
      `<p>Hi ${name},</p><p>We're working on your ticket <strong>${ticketNumber}</strong>: <em>${subject}</em> but need some additional information to proceed.</p><p>Please reply to this email or check your ticket status for details: <a href="${statusPageUrl}">${statusPageUrl}</a></p><p>Thank you,<br/>Support Team</p>`,
    sms: (name, ticketNumber, statusPageUrl) =>
      `Hi ${name}, we need more info on ticket ${ticketNumber}. Please check: ${statusPageUrl}`,
  },
  completed: {
    subject: (ticketNumber: string) => `Support Ticket ${ticketNumber} — Resolved!`,
    email: (name, ticketNumber, subject, statusPageUrl) =>
      `<p>Hi ${name},</p><p>Great news! Your support ticket <strong>${ticketNumber}</strong>: <em>${subject}</em> has been resolved.</p><p>If you have any further questions, please don't hesitate to reach out. View your ticket: <a href="${statusPageUrl}">${statusPageUrl}</a></p><p>Thank you for your patience,<br/>Support Team</p>`,
    sms: (name, ticketNumber, statusPageUrl) =>
      `Hi ${name}, your support ticket ${ticketNumber} has been resolved! View details: ${statusPageUrl}`,
  },
  closed: {
    subject: (ticketNumber: string) => `Support Ticket ${ticketNumber} — Closed`,
    email: (name, ticketNumber, subject, statusPageUrl) =>
      `<p>Hi ${name},</p><p>Your support ticket <strong>${ticketNumber}</strong>: <em>${subject}</em> has been closed.</p><p>If you need further assistance, please submit a new ticket. View your ticket history: <a href="${statusPageUrl}">${statusPageUrl}</a></p><p>Thank you,<br/>Support Team</p>`,
    sms: (name, ticketNumber, statusPageUrl) =>
      `Hi ${name}, your support ticket ${ticketNumber} has been closed. Submit a new ticket if needed: ${statusPageUrl}`,
  },
};

/**
 * Build the customFields array for a GHL opportunity from ticket data and tenant field key config.
 * Only includes fields where the tenant has configured a field key.
 */
export function buildGhlCustomFields(
  fieldKeys: {
    ghlFieldTicketNumber?: string | null;
    ghlFieldDescription?: string | null;
    ghlFieldPriority?: string | null;
    ghlFieldProduct?: string | null;
    ghlFieldStatus?: string | null;
    ghlFieldTicketUrl?: string | null;
    ghlFieldLoomUrl?: string | null;
  },
  ticketData: {
    ticketNumber: string;
    description: string;
    priority: string;
    product: string;
    status: string;
    ticketUrl: string;
    loomUrl?: string | null;
  }
): { id: string; value: string }[] {
  const fields: { id: string; value: string }[] = [];
  if (fieldKeys.ghlFieldTicketNumber) fields.push({ id: fieldKeys.ghlFieldTicketNumber, value: ticketData.ticketNumber });
  if (fieldKeys.ghlFieldDescription) fields.push({ id: fieldKeys.ghlFieldDescription, value: ticketData.description });
  if (fieldKeys.ghlFieldPriority) fields.push({ id: fieldKeys.ghlFieldPriority, value: ticketData.priority });
  if (fieldKeys.ghlFieldProduct) fields.push({ id: fieldKeys.ghlFieldProduct, value: ticketData.product });
  if (fieldKeys.ghlFieldStatus) fields.push({ id: fieldKeys.ghlFieldStatus, value: STATUS_LABELS[ticketData.status] ?? ticketData.status });
  if (fieldKeys.ghlFieldTicketUrl) fields.push({ id: fieldKeys.ghlFieldTicketUrl, value: ticketData.ticketUrl });
  if (fieldKeys.ghlFieldLoomUrl && ticketData.loomUrl) fields.push({ id: fieldKeys.ghlFieldLoomUrl, value: ticketData.loomUrl });
  return fields;
}

export function buildGhlNotificationMessages(
  status: string,
  data: { name: string; ticketNumber: string; subject: string; statusPageUrl: string }
): { subject: string; emailHtml: string; smsText: string } | null {
  const template = STATUS_MESSAGES[status];
  if (!template) return null;
  return {
    subject: template.subject(data.ticketNumber),
    emailHtml: template.email(data.name, data.ticketNumber, data.subject, data.statusPageUrl),
    smsText: template.sms(data.name, data.ticketNumber, data.statusPageUrl),
  };
}

export { STATUS_LABELS };
