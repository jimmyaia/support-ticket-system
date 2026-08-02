import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  getAllStaff,
  getAllUsers,
  updateUserRole,
  updateUserTenant,
  createGlobalStaff,
  getGlobalStaff,
  deleteUser,
} from "../db";
import { protectedProcedure, router } from "../_core/trpc";

const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  }
  return next({ ctx });
});

const staffOrAdminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin" && ctx.user.role !== "staff") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Staff or admin access required" });
  }
  return next({ ctx });
});

export const staffRouter = router({
  // Staff/admin: list staff for current tenant (or specified tenant)
  list: staffOrAdminProcedure
    .input(z.object({ tenantId: z.number().int().optional() }).optional())
    .query(async ({ input, ctx }) => {
      const tenantId = ctx.user.tenantId ?? input?.tenantId;
      return getAllStaff(tenantId);
    }),

  // Admin: list all staff (super admin sees all, tenant admin sees their tenant)
  listAll: adminProcedure.query(async ({ ctx }) => {
    if (ctx.user.tenantId) {
      return getAllStaff(ctx.user.tenantId);
    }
    return getAllUsers();
  }),

  // Super admin: list all global staff (tenantId = null, role = staff)
  listGlobal: adminProcedure.query(async ({ ctx }) => {
    if (ctx.user.tenantId) {
      throw new TRPCError({ code: "FORBIDDEN", message: "Super admin access required" });
    }
    return getGlobalStaff();
  }),

  // Super admin: add a new global staff member
  addGlobal: adminProcedure
    .input(z.object({
      firstName: z.string().min(1).max(100),
      lastName: z.string().min(1).max(100),
      email: z.string().email().max(320),
    }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.user.tenantId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Super admin access required" });
      }
      const staff = await createGlobalStaff({
        firstName: input.firstName.trim(),
        lastName: input.lastName.trim(),
        email: input.email.toLowerCase().trim(),
      });
      return { success: true, staff };
    }),

  // Super admin: remove a global staff member
  removeGlobal: adminProcedure
    .input(z.object({ userId: z.number().int() }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.user.tenantId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Super admin access required" });
      }
      const allGlobal = await getGlobalStaff();
      const target = allGlobal.find(u => u.id === input.userId);
      if (!target) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Global staff member not found" });
      }
      await deleteUser(input.userId);
      return { success: true };
    }),

  // Admin: update a user's role (scoped to tenant for tenant admins)
  updateRole: adminProcedure
    .input(z.object({ userId: z.number(), role: z.enum(["user", "admin", "staff"]) }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.user.tenantId) {
        const targetUsers = await getAllStaff(ctx.user.tenantId);
        const isInTenant = targetUsers.some(u => u.id === input.userId);
        if (!isInTenant) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Cannot modify users outside your tenant" });
        }
      }
      await updateUserRole(input.userId, input.role);
      return { success: true };
    }),

  // Admin: update a user's tenant assignment
  updateTenant: adminProcedure
    .input(z.object({ userId: z.number(), tenantId: z.number().nullable() }))
    .mutation(async ({ input }) => {
      await updateUserTenant(input.userId, input.tenantId);
      return { success: true };
    }),
});
