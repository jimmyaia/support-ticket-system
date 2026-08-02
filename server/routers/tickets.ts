import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  addTicketNote,
  assignTicket,
  createTicket,
  getTicketAttachments,
  getTicketById,
  getTicketByNumber,
  getTicketNotes,
  getTenantById,
  getTenantProducts,
  getUserById,
  listTickets,
  updateTicketStatus,
} from "../db";
import { getTenantBySlug } from "../db";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { fireWebhook, buildStatusPageUrl } from "../ghlWebhook";
import { ENV } from "../_core/env";

async function getPresignedPutUrl(filename: string): Promise<{ uploadUrl: string; publicUrl: string }> {
  const forgeUrl = (ENV.forgeApiUrl ?? "").replace(/\/+$/, "");
  const forgeKey = ENV.forgeApiKey ?? "";
  const hash = crypto.randomUUID().replace(/-/g, "").slice(0, 8);
  const ext = filename.includes(".") ? filename.slice(filename.lastIndexOf(".")) : "";
  const key = `ticket-attachments/${hash}${ext}`;
  const presignUrl = new URL("v1/storage/presign/put", forgeUrl + "/");
  presignUrl.searchParams.set("path", key);
  const resp = await fetch(presignUrl.toString(), {
    headers: { Authorization: `Bearer ${forgeKey}` },
  });
  if (!resp.ok) throw new Error(`Presign failed: ${resp.status}`);
  const { url } = (await resp.json()) as { url: string };
  return { uploadUrl: url, publicUrl: `/manus-storage/${key}` };
}

const staffOrAdminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin" && ctx.user.role !== "staff") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Staff or admin access required" });
  }
  return next({ ctx });
});

export const ticketsRouter = router({
  // Public: submit a new ticket (tenantId required for multi-tenant; defaults to 0 for legacy)
  submit: publicProcedure
    .input(
      z.object({
        tenantId: z.number().int().optional().default(0),
        name: z.string().min(1).max(255),
        email: z.string().email().max(320),
        phone: z.string().max(30).optional(),
        subject: z.string().min(1).max(500),
        product: z.string().min(1).max(255).default("General"),
        description: z.string().min(1).max(10000),
        priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
        imageUrl: z.string().min(1).max(2048).optional(),
        loomUrl: z.string().url().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { tenantId, ...rest } = input;
      const ticket = await createTicket({ ...rest, tenantId });

      // Fire GHL webhook asynchronously (don't block the response)
      if (tenantId > 0) {
        const tenant = await getTenantById(tenantId);
        if (tenant) {
          fireWebhook(tenantId, "ticket.submitted", {
            event: "ticket.submitted",
            tenantId,
            tenantName: tenant.name,
            ticket: {
              number: ticket.ticketNumber,
              subject: ticket.subject,
              product: ticket.product,
              priority: ticket.priority,
              status: ticket.status,
              createdAt: ticket.createdAt.toISOString(),
              resolvedAt: null,
            },
            customer: { name: ticket.name, email: ticket.email, phone: ticket.phone },
            statusPageUrl: buildStatusPageUrl(tenant.slug, ticket.ticketNumber),
          }, ticket.id).catch(console.error);
        }
      }

      return { ticketNumber: ticket.ticketNumber, id: ticket.id };
    }),

  // Public: look up ticket by number (no internal notes)
  lookup: publicProcedure
    .input(z.object({ ticketNumber: z.string().min(1), tenantId: z.number().int().optional() }))
    .query(async ({ input }) => {
      const ticket = await getTicketByNumber(input.ticketNumber.trim().toUpperCase(), input.tenantId);
      if (!ticket) throw new TRPCError({ code: "NOT_FOUND", message: "Ticket not found" });
      return {
        ticketNumber: ticket.ticketNumber,
        subject: ticket.subject,
        status: ticket.status,
        priority: ticket.priority,
        product: ticket.product,
        createdAt: ticket.createdAt,
        updatedAt: ticket.updatedAt,
      };
    }),

  // Staff/Admin: list tickets (scoped to user's tenant if they have one)
  list: staffOrAdminProcedure
    .input(
      z.object({
        tenantId: z.number().int().optional(),
        status: z.string().optional(),
        priority: z.string().optional(),
        product: z.string().optional(),
        assigneeId: z.number().nullable().optional(),
        search: z.string().optional(),
        sortBy: z.enum(["createdAt", "updatedAt", "priority", "status"]).optional(),
        sortDir: z.enum(["asc", "desc"]).optional(),
      }).optional()
    )
    .query(async ({ input, ctx }) => {
      // Super admins can pass explicit tenantId; tenant staff are scoped to their tenant
      const tenantId = ctx.user.tenantId ?? input?.tenantId;
      return listTickets({ ...input, tenantId: tenantId ?? undefined });
    }),

  // Staff/Admin: get full ticket detail with notes and attachments
  getById: staffOrAdminProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input, ctx }) => {
      const tenantId = ctx.user.tenantId ?? undefined;
      const ticket = await getTicketById(input.id, tenantId);
      if (!ticket) throw new TRPCError({ code: "NOT_FOUND", message: "Ticket not found" });
      const notes = await getTicketNotes(ticket.id);
      const attachments = await getTicketAttachments(ticket.id);
      return { ticket, notes, attachments };
    }),

  // Staff/Admin: update ticket status
  updateStatus: staffOrAdminProcedure
    .input(
      z.object({
        id: z.number(),
        status: z.enum(["new", "in_progress", "stuck", "completed", "closed"]),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const tenantId = ctx.user.tenantId ?? undefined;
      const ticket = await getTicketById(input.id, tenantId);
      if (!ticket) throw new TRPCError({ code: "NOT_FOUND", message: "Ticket not found" });
      const previousStatus = ticket.status;
      await updateTicketStatus(input.id, input.status);

      // Fire GHL webhook
      if (ticket.tenantId > 0) {
        const tenant = await getTenantById(ticket.tenantId);
        if (tenant) {
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
              status: input.status,
              previousStatus,
              createdAt: ticket.createdAt.toISOString(),
              resolvedAt: (input.status === "completed" || input.status === "closed") ? new Date().toISOString() : null,
            },
            customer: { name: ticket.name, email: ticket.email, phone: ticket.phone },
            assignee: assignee ? { name: assignee.name, email: assignee.email } : null,
            statusPageUrl: buildStatusPageUrl(tenant.slug, ticket.ticketNumber),
          }, ticket.id).catch(console.error);
        }
      }

      return { success: true };
    }),

  // Staff/Admin: assign ticket
  assign: staffOrAdminProcedure
    .input(z.object({ id: z.number(), assigneeId: z.number().nullable() }))
    .mutation(async ({ input, ctx }) => {
      const tenantId = ctx.user.tenantId ?? undefined;
      const ticket = await getTicketById(input.id, tenantId);
      if (!ticket) throw new TRPCError({ code: "NOT_FOUND", message: "Ticket not found" });
      await assignTicket(input.id, input.assigneeId);

      // Fire GHL webhook
      if (ticket.tenantId > 0 && input.assigneeId) {
        const [tenant, assignee] = await Promise.all([
          getTenantById(ticket.tenantId),
          getUserById(input.assigneeId),
        ]);
        if (tenant) {
          fireWebhook(ticket.tenantId, "ticket.assigned", {
            event: "ticket.assigned",
            tenantId: ticket.tenantId,
            tenantName: tenant.name,
            ticket: {
              number: ticket.ticketNumber,
              subject: ticket.subject,
              product: ticket.product,
              priority: ticket.priority,
              status: ticket.status,
              createdAt: ticket.createdAt.toISOString(),
              resolvedAt: ticket.resolvedAt?.toISOString() ?? null,
            },
            customer: { name: ticket.name, email: ticket.email, phone: ticket.phone },
            assignee: assignee ? { name: assignee.name, email: assignee.email } : null,
            statusPageUrl: buildStatusPageUrl(tenant.slug, ticket.ticketNumber),
          }, ticket.id).catch(console.error);
        }
      }

      return { success: true };
    }),

  // Staff/Admin: add internal note
  addNote: staffOrAdminProcedure
    .input(z.object({ ticketId: z.number().int(), content: z.string().min(1).max(10000) }))
    .mutation(async ({ input, ctx }) => {
      const tenantId = ctx.user.tenantId ?? undefined;
      const ticket = await getTicketById(input.ticketId, tenantId);
      if (!ticket) throw new TRPCError({ code: "NOT_FOUND", message: "Ticket not found" });
      const note = await addTicketNote({
        ticketId: input.ticketId,
        tenantId: ticket.tenantId,
        authorId: ctx.user.id,
        content: input.content,
      });
      return note;
    }),

  // Public: get tenant products for submission form
  getProducts: publicProcedure
    .input(z.object({ tenantId: z.number().int() }))
    .query(async ({ input }) => {
      return getTenantProducts(input.tenantId);
    }),

  // Public: get basic tenant branding (name + logo) for submit/status pages
  getTenantInfo: publicProcedure
    .input(z.object({ tenantId: z.number().int() }))
    .query(async ({ input }) => {
      if (input.tenantId <= 0) return null;
      const tenant = await getTenantById(input.tenantId);
      if (!tenant || !tenant.isActive) return null;
      return { name: tenant.name, logoUrl: tenant.logoUrl ?? null };
    }),

  // Public: get tenant info by slug (for subdomain portals)
  getTenantInfoBySlug: publicProcedure
    .input(z.object({ slug: z.string().min(1).max(63) }))
    .query(async ({ input }) => {
      const tenant = await getTenantBySlug(input.slug);
      if (!tenant || !tenant.isActive) return null;
      return { id: tenant.id, name: tenant.name, logoUrl: tenant.logoUrl ?? null, slug: tenant.slug };
    }),

  // Public: get tenant products by slug (for subdomain portals)
  getProductsBySlug: publicProcedure
    .input(z.object({ slug: z.string().min(1).max(63) }))
    .query(async ({ input }) => {
      const tenant = await getTenantBySlug(input.slug);
      if (!tenant || !tenant.isActive) return [];
      return getTenantProducts(tenant.id);
    }),

  // Public: get a presigned S3 PUT URL for ticket image attachments (client-side upload)
  getUploadUrl: publicProcedure
    .input(z.object({ filename: z.string().min(1).max(255), contentType: z.string().min(1).max(100) }))
    .mutation(async ({ input }) => {
      const allowed = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"];
      if (!allowed.includes(input.contentType)) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Only image files are allowed." });
      }
      return getPresignedPutUrl(input.filename);
    }),
});
