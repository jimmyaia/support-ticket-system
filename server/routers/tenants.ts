import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  createTenant,
  createUser,
  deleteTenant,
  getAllTenantProducts,
  getAllStaff,
  getTenantById,
  getTenantBySlug,
  getTenantStats,
  getWebhookLogs,
  addTenantProduct,
  updateTenantProduct,
  deleteTenantProduct,
  listTenants,
  updateTenant,
  getUserByEmail,
  listTickets,
} from "../db";
import { hashPassword, createSessionToken, getRealUser } from "../_core/authService";
import { protectedProcedure, router } from "../_core/trpc";
import { IMPERSONATE_COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "../_core/cookies";
import { getGhlPipelines } from "../ghl";

// Only super-admins (role=admin, no tenantId) can manage tenants
const superAdminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin" || ctx.user.tenantId !== null) {
    throw new TRPCError({ code: "FORBIDDEN", message: "Super admin access required" });
  }
  return next({ ctx });
});

// Tenant admins can view/edit their own tenant
const tenantAdminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin" && ctx.user.role !== "staff") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin or staff access required" });
  }
  return next({ ctx });
});

export const tenantsRouter = router({
  // Super admin: start impersonating a tenant admin
  startImpersonation: superAdminProcedure
    .input(z.object({ tenantId: z.number().int() }))
    .mutation(async ({ input, ctx }) => {
      const tenant = await getTenantById(input.tenantId);
      if (!tenant) throw new TRPCError({ code: "NOT_FOUND", message: "Tenant not found" });
      const allUsers = await getAllStaff(input.tenantId);
      const tenantAdmin = allUsers.find(u => u.role === "admin");
      if (!tenantAdmin) throw new TRPCError({ code: "NOT_FOUND", message: "No admin user found for this tenant" });
      const impToken = await createSessionToken(tenantAdmin.id, tenantAdmin.email ?? "", tenantAdmin.role);
      const cookieOpts = getSessionCookieOptions(ctx.req);
      ctx.res.cookie(IMPERSONATE_COOKIE_NAME, impToken, { ...cookieOpts, maxAge: 60 * 60 * 1000 });
      return { success: true, tenantName: tenant.name, adminEmail: tenantAdmin.email };
    }),

  // Super admin: exit impersonation
  exitImpersonation: protectedProcedure
    .mutation(async ({ ctx }) => {
      // During impersonation ctx.user is the tenant admin, not the real super admin.
      // We must verify the real user (from the original session cookie) is a super admin.
      const realUser = await getRealUser(ctx.req);
      if (!realUser || realUser.role !== "admin" || realUser.tenantId !== null) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Super admin access required" });
      }
      ctx.res.clearCookie(IMPERSONATE_COOKIE_NAME, { path: "/" });
      return { success: true };
    }),

  // Any authenticated user: check impersonation status
  impersonationStatus: protectedProcedure.query(async ({ ctx }) => {
    const realUser = await getRealUser(ctx.req);
    if (!realUser || realUser.role !== "admin" || realUser.tenantId !== null) {
      return { isImpersonating: false };
    }
    const cookieHeader = ctx.req.headers.cookie;
    if (!cookieHeader) return { isImpersonating: false };
    const { parse } = await import("cookie");
    const parsed = parse(cookieHeader);
    if (!parsed[IMPERSONATE_COOKIE_NAME]) return { isImpersonating: false };
    const tenantId = ctx.user.tenantId;
    const tenant = tenantId ? await getTenantById(tenantId) : null;
    return {
      isImpersonating: true,
      tenantName: tenant?.name ?? "Unknown Tenant",
      tenantId: tenantId ?? null,
      realAdminName: realUser.name,
    };
  }),

  // Super admin: global ticket search across all tenants
  searchTicketsGlobal: superAdminProcedure
    .input(z.object({ search: z.string().min(1).max(200) }))
    .query(async ({ input }) => {
      const allTenants = await listTenants();
      const allTickets = await listTickets({ search: input.search });
      const tenantMap = new Map(allTenants.map(t => [t.id, t]));
      return allTickets.map(t => ({
        ...t,
        tenantName: tenantMap.get(t.tenantId ?? 0)?.name ?? "Unknown",
        tenantSlug: tenantMap.get(t.tenantId ?? 0)?.slug ?? "",
      }));
    }),

  // Tenant admin: get their own tenant info (for settings page and branding)
  getMyTenant: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user.tenantId) return null;
    const tenant = await getTenantById(ctx.user.tenantId);
    if (!tenant) return null;
    return { id: tenant.id, name: tenant.name, slug: tenant.slug, logoUrl: tenant.logoUrl, isActive: tenant.isActive };
  }),

  // Tenant admin: update their own tenant settings (name, logoUrl)
  updateMyTenant: protectedProcedure
    .input(z.object({
      name: z.string().min(1).max(255).optional(),
      logoUrl: z.string().url().optional().or(z.literal("")),
    }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user.tenantId) throw new TRPCError({ code: "FORBIDDEN", message: "Not a tenant admin" });
      if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
      const data: Record<string, unknown> = {};
      if (input.name !== undefined) data.name = input.name;
      if (input.logoUrl !== undefined) data.logoUrl = input.logoUrl || null;
      await updateTenant(ctx.user.tenantId, data as any);
      return { success: true };
    }),

  // Super admin: list all tenants with stats
  list: superAdminProcedure.query(async () => {
    const all = await listTenants();
    const withStats = await Promise.all(
      all.map(async (t) => {
        const stats = await getTenantStats(t.id);
        return { ...t, ...stats };
      })
    );
    return withStats;
  }),

  // Super admin: get single tenant detail
  getById: superAdminProcedure
    .input(z.object({ id: z.number().int() }))
    .query(async ({ input }) => {
      const tenant = await getTenantById(input.id);
      if (!tenant) throw new TRPCError({ code: "NOT_FOUND", message: "Tenant not found" });
      const [products, logs] = await Promise.all([
        getAllTenantProducts(input.id),
        getWebhookLogs(input.id, 20),
      ]);
      return { tenant, products, webhookLogs: logs };
    }),

  // Super admin: create a new tenant with initial admin user
  create: superAdminProcedure
    .input(
      z.object({
        name: z.string().min(1).max(255),
        slug: z.string().min(1).max(63).regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, and hyphens only"),
        adminName: z.string().min(1).max(255),
        adminEmail: z.string().email().max(320),
        adminPassword: z.string().min(8),
        ghlWebhookUrl: z.string().url().optional().or(z.literal("")),
        ghlApiKey: z.string().optional(),
        logoUrl: z.string().url().optional().or(z.literal("")),
        internalNotes: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      // Check slug uniqueness
      const existing = await getTenantBySlug(input.slug);
      if (existing) throw new TRPCError({ code: "CONFLICT", message: "A tenant with this slug already exists." });

      // Check admin email uniqueness
      const existingUser = await getUserByEmail(input.adminEmail);
      if (existingUser) throw new TRPCError({ code: "CONFLICT", message: "A user with this email already exists." });

      // Create tenant
      const tenant = await createTenant({
        name: input.name,
        slug: input.slug,
        ghlWebhookUrl: input.ghlWebhookUrl || null,
        ghlApiKey: input.ghlApiKey || null,
        logoUrl: input.logoUrl || null,
        internalNotes: input.internalNotes || null,
      });

      // Create tenant admin user
      const passwordHash = await hashPassword(input.adminPassword);
      await createUser({
        name: input.adminName,
        email: input.adminEmail,
        passwordHash,
        role: "admin",
        tenantId: tenant.id,
      });

      return { tenant };
    }),

  // Super admin: update tenant settings
  update: superAdminProcedure
    .input(
      z.object({
        id: z.number().int(),
        name: z.string().min(1).max(255).optional(),
        slug: z.string().min(1).max(63).optional(),
        logoUrl: z.string().url().optional().or(z.literal("")).optional(),
        isActive: z.boolean().optional(),
        ghlWebhookUrl: z.string().url().optional().or(z.literal("")).optional(),
        ghlApiKey: z.string().optional(),
        ghlWebhookNewTicket: z.boolean().optional(),
        ghlWebhookStatusChange: z.boolean().optional(),
        ghlWebhookAssignment: z.boolean().optional(),
        ghlLocationId: z.string().max(100).optional(),
        ghlPipelineId: z.string().max(100).optional(),
        ghlStageNew: z.string().max(100).optional(),
        ghlStageInProgress: z.string().max(100).optional(),
        ghlStageStuck: z.string().max(100).optional(),
        ghlStageCompleted: z.string().max(100).optional(),
        ghlStageClosed: z.string().max(100).optional(),
        ghlSendEmail: z.boolean().optional(),
        ghlSendSms: z.boolean().optional(),
        internalNotes: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      // Clean empty strings to null
      const cleaned: any = { ...data };
      if (cleaned.ghlWebhookUrl === "") cleaned.ghlWebhookUrl = null;
      if (cleaned.ghlApiKey === "") cleaned.ghlApiKey = null;
      if (cleaned.logoUrl === "") cleaned.logoUrl = null;
      await updateTenant(id, cleaned);
      return { success: true };
    }),

  // Super admin: suspend/activate tenant
  toggleActive: superAdminProcedure
    .input(z.object({ id: z.number().int(), isActive: z.boolean() }))
    .mutation(async ({ input }) => {
      await updateTenant(input.id, { isActive: input.isActive });
      return { success: true };
    }),

  // Super admin: delete tenant
  delete: superAdminProcedure
    .input(z.object({ id: z.number().int() }))
    .mutation(async ({ input }) => {
      await deleteTenant(input.id);
      return { success: true };
    }),

  // Super admin / tenant admin: manage products
  getProducts: tenantAdminProcedure
    .input(z.object({ tenantId: z.number().int() }))
    .query(async ({ input, ctx }) => {
      // Tenant staff can only see their own tenant's products
      if (ctx.user.tenantId !== null && ctx.user.tenantId !== input.tenantId) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      return getAllTenantProducts(input.tenantId);
    }),

  addProduct: tenantAdminProcedure
    .input(z.object({
      tenantId: z.number().int(),
      label: z.string().min(1).max(255),
      sortOrder: z.number().int().default(0),
    }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.user.tenantId !== null && ctx.user.tenantId !== input.tenantId) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      await addTenantProduct({ tenantId: input.tenantId, label: input.label, sortOrder: input.sortOrder });
      return { success: true };
    }),

  updateProduct: tenantAdminProcedure
    .input(z.object({
      id: z.number().int(),
      label: z.string().min(1).max(255).optional(),
      sortOrder: z.number().int().optional(),
      isActive: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      await updateTenantProduct(id, data);
      return { success: true };
    }),

  deleteProduct: tenantAdminProcedure
    .input(z.object({ id: z.number().int() }))
    .mutation(async ({ input }) => {
      await deleteTenantProduct(input.id);
      return { success: true };
    }),

  // Super admin: get webhook delivery logs for a tenant
  webhookLogs: superAdminProcedure
    .input(z.object({ tenantId: z.number().int(), limit: z.number().int().max(100).default(50) }))
    .query(async ({ input }) => {
      return getWebhookLogs(input.tenantId, input.limit);
    }),

  // Super admin: test webhook by sending a test payload
  testWebhook: superAdminProcedure
    .input(z.object({ tenantId: z.number().int() }))
    .mutation(async ({ input }) => {
      const tenant = await getTenantById(input.tenantId);
      if (!tenant?.ghlWebhookUrl) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "No webhook URL configured for this tenant." });
      }
      const testPayload = {
        event: "webhook.test",
        tenantId: tenant.id,
        tenantName: tenant.name,
        message: "This is a test webhook from AIA SupportDesk",
        timestamp: new Date().toISOString(),
      };
      try {
        const response = await fetch(tenant.ghlWebhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json", "X-AIA-Event": "webhook.test" },
          body: JSON.stringify(testPayload),
          signal: AbortSignal.timeout(10000),
        });
        return { success: response.ok, statusCode: response.status };
      } catch (err: any) {
        return { success: false, error: err?.message ?? "Connection failed" };
      }
    }),

  // Public: resolve tenant by slug (for portal routing)

  // Super admin: fetch GHL pipelines for a tenant (for onboarding UI)
  getGhlPipelines: superAdminProcedure
    .input(z.object({ tenantId: z.number().int() }))
    .query(async ({ input }) => {
      const tenant = await getTenantById(input.tenantId);
      if (!tenant) throw new TRPCError({ code: "NOT_FOUND", message: "Tenant not found" });
      if (!tenant.ghlApiKey || !tenant.ghlLocationId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "GHL API key and Location ID must be configured before fetching pipelines.",
        });
      }
      try {
        const pipelines = await getGhlPipelines(tenant.ghlApiKey, tenant.ghlLocationId);
        return { pipelines };
      } catch (err: any) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: err?.message ?? "Failed to fetch GHL pipelines",
        });
      }
    }),

  // Super admin: save GHL config (API key, location, pipeline, stage mapping)
  saveGhlConfig: superAdminProcedure
    .input(
      z.object({
        tenantId: z.number().int(),
        ghlApiKey: z.string().min(1).max(500),
        ghlLocationId: z.string().min(1).max(100),
        ghlPipelineId: z.string().min(1).max(100),
        ghlStageNew: z.string().max(100).optional(),
        ghlStageInProgress: z.string().max(100).optional(),
        ghlStageStuck: z.string().max(100).optional(),
        ghlStageCompleted: z.string().max(100).optional(),
        ghlStageClosed: z.string().max(100).optional(),
        ghlSendEmail: z.boolean().default(true),
        ghlSendSms: z.boolean().default(true),
      })
    )
    .mutation(async ({ input }) => {
      const { tenantId, ...data } = input;
      await updateTenant(tenantId, data as any);
      return { success: true };
    }),

  getBySlug: protectedProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const tenant = await getTenantBySlug(input.slug);
      if (!tenant || !tenant.isActive) throw new TRPCError({ code: "NOT_FOUND" });
      // Return only public-safe fields
      return { id: tenant.id, name: tenant.name, slug: tenant.slug, logoUrl: tenant.logoUrl };
    }),
});
