/**
 * ClickUp API integration
 * Handles task creation, connection testing, and status sync via webhooks.
 *
 * Priority mapping (ClickUp uses numbers):
 *   1 = urgent, 2 = high, 3 = normal, 4 = low
 */

const CLICKUP_API = "https://api.clickup.com/api/v2";

export interface ClickUpTaskInput {
  ticketNumber: string;
  subject: string;
  customerName: string;
  customerEmail: string;
  phone?: string | null;
  priority: "low" | "medium" | "high" | "urgent";
  product: string;
  description: string;
  imageUrl?: string | null;
  loomUrl?: string | null;
  ticketUrl: string; // direct link back to the ticket in SupportDesk
}

const PRIORITY_MAP: Record<string, number> = {
  urgent: 1,
  high: 2,
  medium: 3,
  low: 4,
};

/**
 * Create a ClickUp task for a new support ticket.
 * Returns the ClickUp task ID on success, null on failure.
 */
export async function createClickUpTask(
  apiKey: string,
  listId: string,
  ticket: ClickUpTaskInput
): Promise<string | null> {
  try {
    // Build the task name: [TKT-XXXXX] Subject — Customer Name
    const taskName = `[${ticket.ticketNumber}] ${ticket.subject} — ${ticket.customerName}`;

    // Build the task description with all ticket details
    const rawLines: (string | null)[] = [
      `📋 SUPPORT TICKET DETAILS`,
      ``,
      `Ticket Number: ${ticket.ticketNumber}`,
      `Customer: ${ticket.customerName}`,
      `Email: ${ticket.customerEmail}`,
      ticket.phone ? `Phone: ${ticket.phone}` : null,
      `Priority: ${ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}`,
      `Product/Department: ${ticket.product}`,
      ``,
      `Subject: ${ticket.subject}`,
      ``,
      `Description:`,
      ticket.description,
      ``,
      ticket.imageUrl ? `📎 Attachment: ${ticket.imageUrl}` : null,
      ticket.loomUrl ? `🎥 Loom Video: ${ticket.loomUrl}` : null,
      ``,
      `🔗 View in SupportDesk: ${ticket.ticketUrl}`,
    ];

    const description = rawLines.filter((l): l is string => l !== null).join("\n");

    const body = {
      name: taskName,
      description,
      priority: PRIORITY_MAP[ticket.priority] ?? 3,
      status: "NEW SUPPORT TICKET",
    };

    const res = await fetch(`${CLICKUP_API}/list/${listId}/task`, {
      method: "POST",
      headers: {
        Authorization: apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error(`[ClickUp] createTask failed ${res.status}: ${errText}`);
      return null;
    }

    const data = (await res.json()) as { id?: string };
    const taskId = data.id ?? null;
    if (taskId) {
      console.log(`[ClickUp] Task created: ${taskId} for ${ticket.ticketNumber}`);
    }
    return taskId;
  } catch (err) {
    console.error("[ClickUp] createTask exception:", err);
    return null;
  }
}

/**
 * Test that an API key + list ID combination is valid.
 * Returns { ok: true, listName } on success, { ok: false, error } on failure.
 */
export async function testClickUpConnection(
  apiKey: string,
  listId: string
): Promise<{ ok: boolean; listName?: string; error?: string }> {
  try {
    const res = await fetch(`${CLICKUP_API}/list/${listId}`, {
      headers: { Authorization: apiKey },
    });
    if (!res.ok) {
      const errText = await res.text();
      return { ok: false, error: `ClickUp API error ${res.status}: ${errText}` };
    }
    const data = (await res.json()) as { name?: string };
    return { ok: true, listName: data.name ?? listId };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}

/**
 * Get the ClickUp task URL for display in the admin UI.
 */
export function getClickUpTaskUrl(taskId: string): string {
  return `https://app.clickup.com/t/${taskId}`;
}
