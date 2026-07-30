import {
  boolean,
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

// ── USERS ────────────────────────────────────────────────────────────────────
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).unique(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 320 }).unique(),
  passwordHash: varchar("passwordHash", { length: 255 }),
  loginMethod: varchar("loginMethod", { length: 64 }).default("email"),
  role: mysqlEnum("role", ["user", "admin", "staff"]).default("user").notNull(),
  // tenantId is NULL for super-admins; set for tenant staff/admins
  tenantId: int("tenantId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ── TENANTS ──────────────────────────────────────────────────────────────────
export const tenants = mysqlTable("tenants", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 63 }).notNull().unique(), // subdomain slug e.g. "acme"
  logoUrl: text("logoUrl"),
  isActive: boolean("isActive").default(true).notNull(),
  // GoHighLevel integration
  ghlWebhookUrl: text("ghlWebhookUrl"),
  ghlApiKey: varchar("ghlApiKey", { length: 500 }),
  ghlWebhookNewTicket: boolean("ghlWebhookNewTicket").default(true).notNull(),
  ghlWebhookStatusChange: boolean("ghlWebhookStatusChange").default(true).notNull(),
  ghlWebhookAssignment: boolean("ghlWebhookAssignment").default(true).notNull(),
  // Internal notes (super-admin only)
  internalNotes: text("internalNotes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Tenant = typeof tenants.$inferSelect;
export type InsertTenant = typeof tenants.$inferInsert;

// ── TENANT PRODUCTS (configurable dropdown per tenant) ───────────────────────
export const tenantProducts = mysqlTable("tenant_products", {
  id: int("id").autoincrement().primaryKey(),
  tenantId: int("tenantId").notNull(),
  label: varchar("label", { length: 255 }).notNull(),
  sortOrder: int("sortOrder").default(0).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type TenantProduct = typeof tenantProducts.$inferSelect;
export type InsertTenantProduct = typeof tenantProducts.$inferInsert;

// ── TICKETS ──────────────────────────────────────────────────────────────────
export const tickets = mysqlTable("tickets", {
  id: int("id").autoincrement().primaryKey(),
  tenantId: int("tenantId").notNull(),
  ticketNumber: varchar("ticketNumber", { length: 20 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  phone: varchar("phone", { length: 30 }),
  subject: varchar("subject", { length: 500 }).notNull(),
  description: text("description").notNull(),
  product: varchar("product", { length: 255 }).notNull().default("General"),
  priority: mysqlEnum("priority", ["low", "medium", "high", "urgent"]).default("medium").notNull(),
  status: mysqlEnum("status", ["new", "in_progress", "stuck", "completed", "closed"]).default("new").notNull(),
  assigneeId: int("assigneeId"),
  imageUrl: text("imageUrl"),
  loomUrl: varchar("loomUrl", { length: 1000 }),
  resolvedAt: timestamp("resolvedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Ticket = typeof tickets.$inferSelect;
export type InsertTicket = typeof tickets.$inferInsert;

// ── TICKET NOTES ─────────────────────────────────────────────────────────────
export const ticketNotes = mysqlTable("ticket_notes", {
  id: int("id").autoincrement().primaryKey(),
  ticketId: int("ticketId").notNull(),
  tenantId: int("tenantId").notNull(),
  authorId: int("authorId").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type TicketNote = typeof ticketNotes.$inferSelect;
export type InsertTicketNote = typeof ticketNotes.$inferInsert;

// ── TICKET ATTACHMENTS ───────────────────────────────────────────────────────
export const ticketAttachments = mysqlTable("ticket_attachments", {
  id: int("id").autoincrement().primaryKey(),
  ticketId: int("ticketId").notNull(),
  tenantId: int("tenantId").notNull(),
  fileKey: varchar("fileKey", { length: 500 }).notNull(),
  url: text("url").notNull(),
  filename: varchar("filename", { length: 255 }),
  mimeType: varchar("mimeType", { length: 100 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type TicketAttachment = typeof ticketAttachments.$inferSelect;

// ── WEBHOOK DELIVERY LOG ─────────────────────────────────────────────────────
export const webhookLogs = mysqlTable("webhook_logs", {
  id: int("id").autoincrement().primaryKey(),
  tenantId: int("tenantId").notNull(),
  ticketId: int("ticketId"),
  event: varchar("event", { length: 64 }).notNull(), // e.g. "ticket.submitted"
  webhookUrl: text("webhookUrl").notNull(),
  payload: text("payload").notNull(), // JSON string
  statusCode: int("statusCode"),
  success: boolean("success").default(false).notNull(),
  errorMessage: text("errorMessage"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type WebhookLog = typeof webhookLogs.$inferSelect;
