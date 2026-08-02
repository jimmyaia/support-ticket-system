import { and, asc, desc, eq, gte, lte, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertTicket,
  InsertTicketNote,
  InsertTenant,
  InsertTenantProduct,
  tickets,
  ticketNotes,
  ticketAttachments,
  tenants,
  tenantProducts,
  webhookLogs,
  users,
  User,
  Tenant,
} from "../drizzle/schema";

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

export async function createUser(data: {
  name: string;
  email: string;
  passwordHash: string;
  role?: "user" | "admin" | "staff";
  tenantId?: number;
}): Promise<User> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(users).values({
    name: data.name,
    email: data.email,
    passwordHash: data.passwordHash,
    role: data.role ?? "user",
    tenantId: data.tenantId ?? null,
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

export async function getAllStaff(tenantId?: number) {
  const db = await getDb();
  if (!db) return [];
  const conditions: any[] = [sql`${users.role} IN ('admin', 'staff')`];
  if (tenantId !== undefined) {
    conditions.push(eq(users.tenantId, tenantId));
  }
  return db.select().from(users).where(and(...conditions)).orderBy(asc(users.name));
}

export async function getAllUsers() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(users).orderBy(asc(users.name));
}

export async function updateUserRole(userId: number, role: "user" | "admin" | "staff") {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set({ role }).where(eq(users.id, userId));
}

  export async function updateUserTenant(userId: number, tenantId: number | null) {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set({ tenantId: tenantId ?? undefined } as any).where(eq(users.id, userId));
}

/** Create a global staff member (tenantId = null, role = staff) */
export async function createGlobalStaff(data: {
  firstName: string;
  lastName: string;
  email: string;
}): Promise<User> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const existing = await getUserByEmail(data.email);
  if (existing) throw new Error("A user with this email already exists");
  const name = `${data.firstName.trim()} ${data.lastName.trim()}`.trim();
  await db.insert(users).values({
    name,
    email: data.email.toLowerCase().trim(),
    passwordHash: null,
    role: "staff",
    tenantId: null,
    loginMethod: "invite",
    lastSignedIn: new Date(),
  } as any);
  const created = await getUserByEmail(data.email);
  if (!created) throw new Error("Failed to create staff member");
  return created;
}

/** Get all global staff (tenantId = null, role = staff) */
export async function getGlobalStaff() {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(users)
    .where(and(eq(users.role, "staff"), sql`${users.tenantId} IS NULL`))
    .orderBy(asc(users.name));
}

/** Delete a user by ID */
export async function deleteUser(userId: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(users).where(eq(users.id, userId));
}

export async function updateUserPassword(userId: number, passwordHash: string) {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set({ passwordHash, loginMethod: "email" } as any).where(eq(users.id, userId));
}

// ─── Tenants ──────────────────────────────────────────────────────────────────

export async function createTenant(data: InsertTenant): Promise<Tenant> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(tenants).values(data);
  const result = await db.select().from(tenants).where(eq(tenants.slug, data.slug)).limit(1);
  if (!result[0]) throw new Error("Failed to create tenant");
  return result[0];
}

export async function listTenants() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(tenants).orderBy(asc(tenants.name));
}

export async function getTenantById(id: number): Promise<Tenant | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(tenants).where(eq(tenants.id, id)).limit(1);
  return result[0];
}

export async function getTenantBySlug(slug: string): Promise<Tenant | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(tenants).where(eq(tenants.slug, slug)).limit(1);
  return result[0];
}

export async function updateTenant(id: number, data: Partial<InsertTenant>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(tenants).set(data as any).where(eq(tenants.id, id));
}

export async function deleteTenant(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(tenants).where(eq(tenants.id, id));
}

export async function getTenantStats(id: number) {
  const db = await getDb();
  if (!db) return { ticketCount: 0, staffCount: 0, lastActivity: null };
  const [ticketRows, staffRows] = await Promise.all([
    db.select().from(tickets).where(eq(tickets.tenantId, id)),
    db.select().from(users).where(and(eq(users.tenantId, id), sql`${users.role} IN ('admin','staff')`)),
  ]);
  const lastTicket = ticketRows.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())[0];
  return {
    ticketCount: ticketRows.length,
    staffCount: staffRows.length,
    lastActivity: lastTicket?.updatedAt ?? null,
  };
}

// ─── Tenant Products ──────────────────────────────────────────────────────────

export async function getTenantProducts(tenantId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(tenantProducts)
    .where(and(eq(tenantProducts.tenantId, tenantId), eq(tenantProducts.isActive, true)))
    .orderBy(asc(tenantProducts.sortOrder), asc(tenantProducts.label));
}

export async function getAllTenantProducts(tenantId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(tenantProducts)
    .where(eq(tenantProducts.tenantId, tenantId))
    .orderBy(asc(tenantProducts.sortOrder), asc(tenantProducts.label));
}

export async function addTenantProduct(data: InsertTenantProduct) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(tenantProducts).values(data);
}

export async function updateTenantProduct(id: number, data: Partial<InsertTenantProduct>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(tenantProducts).set(data as any).where(eq(tenantProducts.id, id));
}

export async function deleteTenantProduct(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(tenantProducts).where(eq(tenantProducts.id, id));
}

// ─── Webhook Logs ─────────────────────────────────────────────────────────────

export async function logWebhook(data: {
  tenantId: number;
  ticketId?: number;
  event: string;
  webhookUrl: string;
  payload: string;
  statusCode?: number;
  success: boolean;
  errorMessage?: string;
}) {
  const db = await getDb();
  if (!db) return;
  await db.insert(webhookLogs).values({
    tenantId: data.tenantId,
    ticketId: data.ticketId ?? null,
    event: data.event,
    webhookUrl: data.webhookUrl,
    payload: data.payload,
    statusCode: data.statusCode ?? null,
    success: data.success,
    errorMessage: data.errorMessage ?? null,
  } as any);
}

export async function getWebhookLogs(tenantId: number, limit = 50) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(webhookLogs)
    .where(eq(webhookLogs.tenantId, tenantId))
    .orderBy(desc(webhookLogs.createdAt))
    .limit(limit);
}

// ─── Tickets (tenant-scoped) ──────────────────────────────────────────────────

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
  tenantId?: number;
  status?: string;
  priority?: string;
  product?: string;
  assigneeId?: number | null;
  search?: string;
  sortBy?: "createdAt" | "updatedAt" | "priority" | "status";
  sortDir?: "asc" | "desc";
};

export async function listTickets(filters: TicketFilters = {}) {
  const db = await getDb();
  if (!db) return [];

  const conditions: any[] = [];
  if (filters.tenantId !== undefined) conditions.push(eq(tickets.tenantId, filters.tenantId));
  if (filters.status) conditions.push(eq(tickets.status, filters.status as any));
  if (filters.priority) conditions.push(eq(tickets.priority, filters.priority as any));
  if (filters.product) conditions.push(eq(tickets.product, filters.product));
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

export async function getTicketByNumber(ticketNumber: string, tenantId?: number) {
  const db = await getDb();
  if (!db) return undefined;
  const conditions: any[] = [eq(tickets.ticketNumber, ticketNumber.trim().toUpperCase())];
  if (tenantId !== undefined) conditions.push(eq(tickets.tenantId, tenantId));
  const result = await db.select().from(tickets).where(and(...conditions)).limit(1);
  return result[0];
}

export async function getTicketById(id: number, tenantId?: number) {
  const db = await getDb();
  if (!db) return undefined;
  const conditions: any[] = [eq(tickets.id, id)];
  if (tenantId !== undefined) conditions.push(eq(tickets.tenantId, tenantId));
  const result = await db.select().from(tickets).where(and(...conditions)).limit(1);
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

// ─── Reporting (tenant-scoped) ────────────────────────────────────────────────

export async function getMonthlyStats(year: number, month: number, tenantId?: number) {
  const db = await getDb();
  if (!db) return null;

  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 1);

  const conditions: any[] = [gte(tickets.createdAt, startDate), lte(tickets.createdAt, endDate)];
  if (tenantId !== undefined) conditions.push(eq(tickets.tenantId, tenantId));

  const allTickets = await db.select().from(tickets).where(and(...conditions));

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

export async function getMonthlyVolume(months: number = 6, tenantId?: number) {
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

    const conditions: any[] = [gte(tickets.createdAt, startDate), lte(tickets.createdAt, endDate)];
    if (tenantId !== undefined) conditions.push(eq(tickets.tenantId, tenantId));

    const monthTickets = await db.select().from(tickets).where(and(...conditions));

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
