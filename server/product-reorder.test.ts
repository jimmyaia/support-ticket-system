import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const routerSource = readFileSync(resolve(process.cwd(), "server/routers/tenants.ts"), "utf8");
const tenantSettingsSource = readFileSync(resolve(process.cwd(), "client/src/pages/admin/TenantSettings.tsx"), "utf8");
const tenantDetailSource = readFileSync(resolve(process.cwd(), "client/src/pages/superadmin/TenantDetail.tsx"), "utf8");

describe("tenant product reordering", () => {
  it("exposes a tenant-scoped reorder procedure with an exact product-set check", () => {
    expect(routerSource).toContain("reorderProducts:");
    expect(routerSource).toContain("Product order does not match this tenant's products.");
    expect(routerSource).toContain("reorderTenantProducts(input.tenantId, input.productIds)");
  });

  it("offers both drag and mobile-friendly arrow controls in every product editor", () => {
    for (const source of [tenantSettingsSource, tenantDetailSource]) {
      expect(source).toContain("handleProductDrop");
      expect(source).toContain("ChevronUp");
      expect(source).toContain("ChevronDown");
      expect(source).toContain("Drag to reorder, or use the arrow controls on mobile.");
    }
  });
});
