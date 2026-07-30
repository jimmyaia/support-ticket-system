import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { getMonthlyStats, getMonthlyVolume } from "../db";
import { protectedProcedure, router } from "../_core/trpc";

const staffOrAdminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin" && ctx.user.role !== "staff") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Staff or admin access required" });
  }
  return next({ ctx });
});

export const reportsRouter = router({
  monthly: staffOrAdminProcedure
    .input(
      z.object({
        year: z.number().int().min(2020).max(2100),
        month: z.number().int().min(1).max(12),
      })
    )
    .query(async ({ input }) => {
      const stats = await getMonthlyStats(input.year, input.month);
      if (!stats) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      return stats;
    }),

  volume: staffOrAdminProcedure
    .input(z.object({ months: z.number().int().min(1).max(24).default(6) }))
    .query(async ({ input }) => {
      return getMonthlyVolume(input.months);
    }),
});

