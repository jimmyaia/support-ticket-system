// OAuth routes are no longer used for the main auth flow.
// The standalone email/password auth is handled by authService.ts and the
// auth.login / auth.register tRPC procedures in routers.ts.
// This file is kept as a no-op to avoid breaking any imports.
import type { Express } from "express";

export function registerOAuthRoutes(_app: Express) {
  // No-op: OAuth callback is disabled. Use email/password login instead.
}
