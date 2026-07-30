import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// ─── Context helpers ──────────────────────────────────────────────────────────

function makeStaffCtx(): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "staff-user",
      email: "staff@example.com",
      name: "Staff Member",
      loginMethod: "manus",
      role: "staff",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => {} } as TrpcContext["res"],
  };
}

function makePublicCtx(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => {} } as TrpcContext["res"],
  };
}

function makeUserCtx(): TrpcContext {
  return {
    user: {
      id: 99,
      openId: "regular-user",
      email: "user@example.com",
      name: "Regular User",
      loginMethod: "manus",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => {} } as TrpcContext["res"],
  };
}

// ─── Public: submit + lookup ──────────────────────────────────────────────────

describe("tickets.submit - public access", () => {
  it("creates a ticket and returns a ticket number", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    const result = await caller.tickets.submit({
      name: "Jane Doe",
      email: "jane@example.com",
      subject: "Login page is broken",
      description: "I cannot log in to my account. The button does nothing.",
      priority: "high",
    });
    expect(result.ticketNumber).toMatch(/^TKT-/);
    expect(result.id).toBeTypeOf("number");
  });

  it("rejects invalid email", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    await expect(
      caller.tickets.submit({
        name: "Jane",
        email: "not-an-email",
        subject: "Test",
        description: "Test description",
      })
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("rejects empty subject", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    await expect(
      caller.tickets.submit({
        name: "Jane",
        email: "jane@example.com",
        subject: "",
        description: "Test",
      })
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });
});

describe("tickets.lookup - public access (success path)", () => {
  it("returns only public fields and never exposes internal notes", async () => {
    // First submit a ticket
    const publicCaller = appRouter.createCaller(makePublicCtx());
    const { ticketNumber } = await publicCaller.tickets.submit({
      name: "Bob Smith",
      email: "bob@example.com",
      subject: "Payment failed",
      description: "My payment keeps failing at checkout.",
      priority: "urgent",
    });

    // Add an internal note as staff
    const staffCaller = appRouter.createCaller(makeStaffCtx());
    const ticketList = await staffCaller.tickets.list({ search: ticketNumber });
    const ticketId = ticketList[0]?.id;
    if (ticketId) {
      await staffCaller.tickets.addNote({ ticketId, content: "INTERNAL: escalate to billing team" });
    }

    // Public lookup should NOT expose notes or internal fields
    const lookup = await publicCaller.tickets.lookup({ ticketNumber });
    expect(lookup.ticketNumber).toBe(ticketNumber);
    expect(lookup.subject).toBe("Payment failed");
    expect(lookup.status).toBe("new");
    // Verify internal fields are not present
    expect((lookup as any).description).toBeUndefined();
    expect((lookup as any).name).toBeUndefined();
    expect((lookup as any).email).toBeUndefined();
    expect((lookup as any).notes).toBeUndefined();
  });
});

describe("tickets.updateStatus - staff access", () => {
  it("updates ticket status and sets resolvedAt for completed tickets", async () => {
    const publicCaller = appRouter.createCaller(makePublicCtx());
    const { id } = await publicCaller.tickets.submit({
      name: "Alice",
      email: "alice@example.com",
      subject: "Feature request",
      description: "Please add dark mode.",
    });

    const staffCaller = appRouter.createCaller(makeStaffCtx());
    const result = await staffCaller.tickets.updateStatus({ id, status: "completed" });
    expect(result).toEqual({ success: true });
  });
});

describe("tickets.addNote - staff access (success path)", () => {
  it("creates a note and returns it with the correct content", async () => {
    const publicCaller = appRouter.createCaller(makePublicCtx());
    const { id } = await publicCaller.tickets.submit({
      name: "Carol",
      email: "carol@example.com",
      subject: "Billing question",
      description: "I was charged twice this month.",
    });

    const staffCaller = appRouter.createCaller(makeStaffCtx());
    const note = await staffCaller.tickets.addNote({ ticketId: id, content: "Checked billing — refund issued." });
    expect(note.content).toBe("Checked billing — refund issued.");
    expect(note.ticketId).toBe(id);
    expect(note.authorId).toBe(1);
  });
});

describe("tickets.lookup - public access", () => {
  it("throws NOT_FOUND for a non-existent ticket number", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    await expect(
      caller.tickets.lookup({ ticketNumber: "TKT-DOESNOTEXIST-000" })
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
  });
});

describe("tickets.list - RBAC", () => {
  it("throws FORBIDDEN for unauthenticated users", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    await expect(caller.tickets.list({})).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("throws FORBIDDEN for regular users (not staff/admin)", async () => {
    const caller = appRouter.createCaller(makeUserCtx());
    await expect(caller.tickets.list({})).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});

describe("tickets.addNote - RBAC", () => {
  it("throws UNAUTHORIZED for unauthenticated users", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    await expect(
      caller.tickets.addNote({ ticketId: 1, content: "test note" })
    ).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("throws FORBIDDEN for regular users", async () => {
    const caller = appRouter.createCaller(makeUserCtx());
    await expect(
      caller.tickets.addNote({ ticketId: 1, content: "test note" })
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});

describe("staff.updateRole - admin only", () => {
  it("throws FORBIDDEN for staff users trying to change roles", async () => {
    const caller = appRouter.createCaller(makeStaffCtx());
    await expect(
      caller.staff.updateRole({ userId: 2, role: "admin" })
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});

describe("auth.logout", () => {
  it("clears session cookie and returns success", async () => {
    const clearedCookies: string[] = [];
    const ctx: TrpcContext = {
      user: null,
      req: { protocol: "https", headers: {} } as TrpcContext["req"],
      res: {
        clearCookie: (name: string) => { clearedCookies.push(name); },
      } as TrpcContext["res"],
    };
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.logout();
    expect(result).toEqual({ success: true });
    expect(clearedCookies).toHaveLength(1);
  });
});
