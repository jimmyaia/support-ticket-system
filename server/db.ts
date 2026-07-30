import { and, asc, desc, eq, gte, lte, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertTicket, InsertTicketNote, tickets, ticketNotes, ticketAttachments, users, User } from "../drizzle/schema";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ─── Users ────────────────────────────────────────────────────────────────────

export async function getUserByEmail(email: string): Promise<User | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result[0];
}

export async function getUserById(id: number): Promise<User | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result[0];
}

export async function createUser(data: { name: string; email: string; passwordHash: string; role?: "user" | "admin" | "staff" }): Promise<User> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(users).values({
    name: data.name,
    email: data.email,
    passwordHash: data.passwordHash,
    role: data.role ?? "user",
    loginMethod: "email",
    lastSignedIn: new Date(),
  });
  const created = await getUserByEmail(data.email);
  if (!created) throw new Error("Failed to create user");
  return created;
}

export async function updateLastSignedIn(userId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set({ lastSignedIn: new Date() }).where(eq(users.id, userId));
}

export async function getAllStaff() {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(users)
    .where(sql`${users.role} IN ('admin', 'staff')`)
    .orderBy(asc(users.name));
}

export async function updateUserRole(userId: number, role: "user" | "admin" | "staff") {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set({ role }).where(eq(users.id, userId));
}

// ─── Tickets ──────────────────────────────────────────────────────────────────

function generateTicketNumber(): string {
  const prefix = "TKT";
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

export async function createTicket(data: Omit<InsertTicket, "ticketNumber">) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const ticketNumber = generateTicketNumber();
  await db.insert(tickets).values({ ...data, ticketNumber });
  const result = await db.select().from(tickets).where(eq(tickets.ticketNumber, ticketNumber)).limit(1);
  return result[0]!;
}

export type TicketFilters = {
  status?: string;
  priority?: string;
  assigneeId?: number | null;
  search?: string;
  sortBy?: "createdAt" | "updatedAt" | "priority" | "status";
  sortDir?: "asc" | "desc";
};

export async function listTickets(filters: TicketFilters = {}) {
  const db = await getDb();
  if (!db) return [];

  const conditions = [];
  if (filters.status) conditions.push(eq(tickets.status, filters.status as any));
  if (filters.priority) conditions.push(eq(tickets.priority, filters.priority as any));
  if (filters.assigneeId !== undefined) {
    if (filters.assigneeId === null) {
      conditions.push(sql`${tickets.assigneeId} IS NULL`);
    } else {
      conditions.push(eq(tickets.assigneeId, filters.assigneeId));
    }
  }

  const orderCol = filters.sortBy ?? "createdAt";
  const orderDir = filters.sortDir ?? "desc";
  const col = tickets[orderCol as keyof typeof tickets] as any;
  const orderFn = orderDir === "asc" ? asc : desc;

  const query = db.select().from(tickets);
  if (conditions.length > 0) query.where(and(...conditions));
  query.orderBy(orderFn(col));

  return query;
}

export async function getTicketByNumber(ticketNumber: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(tickets).where(eq(tickets.ticketNumber, ticketNumber)).limit(1);
  return result[0];
}

export async function getTicketById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(tickets).where(eq(tickets.id, id)).limit(1);
  return result[0];
}

export async function updateTicketStatus(
  id: number,
  status: "new" | "in_progress" | "stuck" | "completed" | "closed"
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const resolvedAt = status === "completed" || status === "closed" ? new Date() : null;
  const updateData: Record<string, unknown> = { status };
  if (resolvedAt) updateData.resolvedAt = resolvedAt;
  await db.update(tickets).set(updateData as any).where(eq(tickets.id, id));
}

export async function assignTicket(id: number, assigneeId: number | null) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(tickets).set({ assigneeId: assigneeId ?? undefined } as any).where(eq(tickets.id, id));
}

export async function updateTicketImageUrl(id: number, imageUrl: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(tickets).set({ imageUrl }).where(eq(tickets.id, id));
}

// ─── Ticket Notes ─────────────────────────────────────────────────────────────

export async function addTicketNote(data: InsertTicketNote) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(ticketNotes).values(data);
  const result = await db
    .select()
    .from(ticketNotes)
    .where(eq(ticketNotes.ticketId, data.ticketId))
    .orderBy(desc(ticketNotes.createdAt))
    .limit(1);
  return result[0]!;
}

export async function getTicketNotes(ticketId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(ticketNotes)
    .where(eq(ticketNotes.ticketId, ticketId))
    .orderBy(asc(ticketNotes.createdAt));
}

// ─── Ticket Attachments ───────────────────────────────────────────────────────

export async function getTicketAttachments(ticketId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(ticketAttachments)
    .where(eq(ticketAttachments.ticketId, ticketId))
    .orderBy(asc(ticketAttachments.createdAt));
}

// ─── Reporting ────────────────────────────────────────────────────────────────

export async function getMonthlyStats(year: number, month: number) {
  const db = await getDb();
  if (!db) return null;

  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 1);

  const allTickets = await db
    .select()
    .from(tickets)
    .where(and(gte(tickets.createdAt, startDate), lte(tickets.createdAt, endDate)));

  const total = allTickets.length;
  const byStatus = { new: 0, in_progress: 0, stuck: 0, completed: 0, closed: 0 };

  let totalResolveMs = 0;
  let resolvedCount = 0;

  for (const t of allTickets) {
    byStatus[t.status as keyof typeof byStatus]++;
    if ((t.status === "completed" || t.status === "closed") && t.resolvedAt) {
      totalResolveMs += t.resolvedAt.getTime() - t.createdAt.getTime();
      resolvedCount++;
    }
  }

  const completionRate = total > 0 ? ((byStatus.completed + byStatus.closed) / total) * 100 : 0;
  const avgResolveHours = resolvedCount > 0 ? totalResolveMs / resolvedCount / 1000 / 3600 : null;

  return { total, byStatus, completionRate, avgResolveHours, resolvedCount };
}

export async function getMonthlyVolume(months: number = 6) {
  const db = await getDb();
  if (!db) return [];

  const results = [];
  const now = new Date();

  for (let i = months - 1; i >= 0; i--) {
    const year = now.getFullYear();
    const month = now.getMonth() - i;
    const adjustedDate = new Date(year, month, 1);
    const startDate = new Date(adjustedDate.getFullYear(), adjustedDate.getMonth(), 1);
    const endDate = new Date(adjustedDate.getFullYear(), adjustedDate.getMonth() + 1, 1);

    const monthTickets = await db
      .select()
      .from(tickets)
      .where(and(gte(tickets.createdAt, startDate), lte(tickets.createdAt, endDate)));

    const resolved = monthTickets.filter(
      (t) => t.status === "completed" || t.status === "closed"
    ).length;

    results.push({
      year: adjustedDate.getFullYear(),
      month: adjustedDate.getMonth() + 1,
      label: adjustedDate.toLocaleString("default", { month: "short", year: "2-digit" }),
      total: monthTickets.length,
      resolved,
    });
  }

  return results;
}
