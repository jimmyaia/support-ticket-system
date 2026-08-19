import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { ticketsRouter } from "./routers/tickets";
import { staffRouter } from "./routers/staff";
import { reportsRouter } from "./routers/reports";
import { tenantsRouter } from "./routers/tenants";
import { z } from "zod";
import * as db from "./db";
import { hashPassword, verifyPassword, createSessionToken } from "./_core/authService";
import { TRPCError } from "@trpc/server";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),

    register: publicProcedure
      .input(z.object({
        name: z.string().min(1).max(255),
        email: z.string().email().max(320),
        password: z.string()
          .min(8, "Password must be at least 8 characters")
          .max(128, "Password must be at most 128 characters")
          .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
          .regex(/[0-9]/, "Password must contain at least one number"),
      }))
      .mutation(async ({ input, ctx }) => {
        const existing = await db.getUserByEmail(input.email);
        if (existing) throw new TRPCError({ code: "CONFLICT", message: "An account with this email already exists." });

        // The public setup form is only for establishing the first global administrator.
        // Afterwards, staff accounts must be provisioned from the admin workspace.
        if (await db.hasGlobalAdmin()) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Self-registration is unavailable. Ask an administrator to create your staff account.",
          });
        }

        const passwordHash = await hashPassword(input.password);
        const user = await db.createUser({
          name: input.name,
          email: input.email,
          passwordHash,
          role: "admin",
        });
        const token = await createSessionToken(user.id, user.email!, user.role);
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, token, { ...cookieOptions, maxAge: 1000 * 60 * 60 * 24 * 7 });
        return { user: { id: user.id, name: user.name, email: user.email, role: user.role } };
      }),

    login: publicProcedure
      .input(z.object({
        email: z.string().email(),
        password: z.string().min(1).max(128),
      }))
      .mutation(async ({ input, ctx }) => {
        const user = await db.getUserByEmail(input.email);
        if (!user || !user.passwordHash) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid email or password." });
        }
        const valid = await verifyPassword(input.password, user.passwordHash);
        if (!valid) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid email or password." });
        }
        // Recover deployments that were created before first-account provisioning
        // assigned the administrator role correctly.
        let role = user.role;
        if (role === "user" && !(await db.hasGlobalAdmin())) {
          await db.updateUserRole(user.id, "admin");
          role = "admin";
        }

        await db.updateLastSignedIn(user.id);
        const token = await createSessionToken(user.id, user.email!, role);
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, token, { ...cookieOptions, maxAge: 1000 * 60 * 60 * 24 * 7 });
        return { user: { id: user.id, name: user.name, email: user.email, role } };
      }),

    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
    setPassword: protectedProcedure
      .input(z.object({
        newPassword: z.string()
          .min(8, "Password must be at least 8 characters")
          .max(128, "Password must be at most 128 characters")
          .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
          .regex(/[0-9]/, "Password must contain at least one number"),
        currentPassword: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const user = await db.getUserById(ctx.user.id);
        if (!user) throw new TRPCError({ code: "NOT_FOUND", message: "User not found." });
        // If user already has a password, require current password to change it
        if (user.passwordHash) {
          if (!input.currentPassword) {
            throw new TRPCError({ code: "BAD_REQUEST", message: "Current password is required to change your password." });
          }
          const valid = await verifyPassword(input.currentPassword, user.passwordHash);
          if (!valid) {
            throw new TRPCError({ code: "UNAUTHORIZED", message: "Current password is incorrect." });
          }
        }
        const passwordHash = await hashPassword(input.newPassword);
        await db.updateUserPassword(ctx.user.id, passwordHash);
        return { success: true };
      }),
  }),
  tickets: ticketsRouter,
  staff: staffRouter,
  reports: reportsRouter,
  tenants: tenantsRouter,
});

export type AppRouter = typeof appRouter;
