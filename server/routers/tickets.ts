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
  listTickets,
  updateTicketStatus,
} from "../db";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";

const staffOrAdminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin" && ctx.user.role !== "staff") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Staff or admin access required" });
  }
  return next({ ctx });
});

export const ticketsRouter = router({
  // Public: submit a new ticket
  submit: publicProcedure
    .input(
      z.object({
        name: z.string().min(1).max(255),
        email: z.string().email().max(320),
        subject: z.string().min(1).max(500),
        product: z.enum(["go_highlevel", "amply"]).default("go_highlevel"),
        description: z.string().min(1),
        priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
        imageUrl: z.string().url().optional(),
        loomUrl: z.string().url().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const ticket = await createTicket(input);
      return { ticketNumber: ticket.ticketNumber, id: ticket.id };
    }),

  // Public: look up ticket by number (no internal notes)
  lookup: publicProcedure
    .input(z.object({ ticketNumber: z.string().min(1) }))
    .query(async ({ input }) => {
      const ticket = await getTicketByNumber(input.ticketNumber.trim().toUpperCase());
      if (!ticket) throw new TRPCError({ code: "NOT_FOUND", message: "Ticket not found" });
      // Return only public-safe fields
      return {
        ticketNumber: ticket.ticketNumber,
        subject: ticket.subject,
        status: ticket.status,
        priority: ticket.priority,
        createdAt: ticket.createdAt,
        updatedAt: ticket.updatedAt,
      };
    }),

  // Staff/Admin: list all tickets with filters
  list: staffOrAdminProcedure
    .input(
      z.object({
        status: z.string().optional(),
        priority: z.string().optional(),
        assigneeId: z.number().nullable().optional(),
        search: z.string().optional(),
        sortBy: z.enum(["createdAt", "updatedAt", "priority", "status"]).optional(),
        sortDir: z.enum(["asc", "desc"]).optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      return listTickets(input ?? {});
    }),

  // Staff/Admin: get full ticket detail with notes and attachments
  getById: staffOrAdminProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const ticket = await getTicketById(input.id);
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
    .mutation(async ({ input }) => {
      await updateTicketStatus(input.id, input.status);
      return { success: true };
    }),

  // Staff/Admin: assign ticket to a staff member
  assign: staffOrAdminProcedure
    .input(
      z.object({
        id: z.number(),
        assigneeId: z.number().nullable(),
      })
    )
    .mutation(async ({ input }) => {
      await assignTicket(input.id, input.assigneeId);
      return { success: true };
    }),

  // Staff/Admin: add internal note
  addNote: staffOrAdminProcedure
    .input(
      z.object({
        ticketId: z.number(),
        content: z.string().min(1),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const note = await addTicketNote({
        ticketId: input.ticketId,
        authorId: ctx.user.id,
        content: input.content,
      });
      return note;
    }),
});
