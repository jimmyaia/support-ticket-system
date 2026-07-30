import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { getAllStaff, getAllUsers, updateUserRole, updateUserTenant } from "../db";
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
  list: staffOrAdminProcedure
    .input(z.object({ tenantId: z.number().int().optional() }).optional())
    .query(async ({ input, ctx }) => {
      const tenantId = ctx.user.tenantId ?? input?.tenantId;
      return getAllStaff(tenantId);
    }),

  listAll: adminProcedure.query(async () => {
    return getAllUsers();
  }),

  updateRole: adminProcedure
    .input(z.object({ userId: z.number(), role: z.enum(["user", "admin", "staff"]) }))
    .mutation(async ({ input }) => {
      await updateUserRole(input.userId, input.role);
      return { success: true };
    }),

  updateTenant: adminProcedure
    .input(z.object({ userId: z.number(), tenantId: z.number().nullable() }))
    .mutation(async ({ input }) => {
      await updateUserTenant(input.userId, input.tenantId);
      return { success: true };
    }),
});
