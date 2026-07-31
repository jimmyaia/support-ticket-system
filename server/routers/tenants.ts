import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  createTenant,
  createUser,
  deleteTenant,
  getAllTenantProducts,
  getTenantById,
  getTenantBySlug,
  getTenantProducts,
  getTenantStats,
  getWebhookLogs,
  addTenantProduct,
  updateTenantProduct,
  deleteTenantProduct,
  listTenants,
  updateTenant,
  getUserByEmail,
} from "../db";
import { hashPassword } from "../_core/authService";
import { protectedProcedure, router } from "../_core/trpc";

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
  getBySlug: protectedProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const tenant = await getTenantBySlug(input.slug);
      if (!tenant || !tenant.isActive) throw new TRPCError({ code: "NOT_FOUND" });
      // Return only public-safe fields
      return { id: tenant.id, name: tenant.name, slug: tenant.slug, logoUrl: tenant.logoUrl };
    }),
});
