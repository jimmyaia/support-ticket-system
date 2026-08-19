import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const routerSource = readFileSync(resolve(process.cwd(), "server/routers.ts"), "utf8");
const dbSource = readFileSync(resolve(process.cwd(), "server/db.ts"), "utf8");

describe("administrator bootstrap safeguards", () => {
  it("creates the first self-service account as a global administrator and closes public registration afterwards", () => {
    expect(routerSource).toContain("if (await db.hasGlobalAdmin())");
    expect(routerSource).toContain('message: "Self-registration is unavailable. Ask an administrator to create your staff account."');
    expect(routerSource).toContain('role: "admin"');
  });

  it("recovers a legacy first account at successful login when no global administrator exists", () => {
    expect(routerSource).toContain('if (role === "user" && !(await db.hasGlobalAdmin()))');
    expect(routerSource).toContain('await db.updateUserRole(user.id, "admin")');
    expect(routerSource).toContain("createSessionToken(user.id, user.email!, role)");
  });

  it("checks for a true global administrator rather than any tenant-level staff account", () => {
    expect(dbSource).toContain("export async function hasGlobalAdmin(): Promise<boolean>");
    expect(dbSource).toContain("${users.role} = 'admin' AND ${users.tenantId} IS NULL");
  });
});
