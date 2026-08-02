import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { parse as parseCookieHeader } from "cookie";
import type { Request } from "express";
import * as db from "../db";
import { ENV } from "./env";
import { COOKIE_NAME, IMPERSONATE_COOKIE_NAME } from "@shared/const";
import type { User } from "../../drizzle/schema";

const SALT_ROUNDS = 12;

function getSecret() {
  return new TextEncoder().encode(ENV.cookieSecret);
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createSessionToken(userId: number, email: string, role: string): Promise<string> {
  const secret = getSecret();
  const expiresAt = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7; // 7 days
  return new SignJWT({ userId, email, role })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setExpirationTime(expiresAt)
    .sign(secret);
}

export type SessionPayload = { userId: number; email: string; role: string };

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const secret = getSecret();
    const { payload } = await jwtVerify(token, secret, { algorithms: ["HS256"] });
    const { userId, email, role } = payload as Record<string, unknown>;
    if (typeof userId !== "number" || typeof email !== "string" || typeof role !== "string") return null;
    return { userId, email, role };
  } catch {
    return null;
  }
}

  export async function authenticateRequest(req: Request): Promise<User | null> {
  // Read from cookie
  const cookieHeader = req.headers.cookie;
  let token: string | undefined;

  if (cookieHeader) {
    const parsed = parseCookieHeader(cookieHeader);
    token = parsed[COOKIE_NAME];
  }

  // Fallback to Authorization header
  if (!token) {
    const authHeader = req.headers.authorization;
    if (typeof authHeader === "string" && authHeader.startsWith("Bearer ")) {
      token = authHeader.slice(7);
    }
  }

  if (!token) return null;

  const session = await verifySessionToken(token);
  if (!session) return null;

  const user = await db.getUserById(session.userId);
  if (!user) return null;

  // Check for impersonation cookie — only valid if the real user is a super admin
  if (user.role === "admin" && user.tenantId === null) {
    const cookieHeader2 = req.headers.cookie;
    if (cookieHeader2) {
      const parsed = parseCookieHeader(cookieHeader2);
      const impToken = parsed[IMPERSONATE_COOKIE_NAME];
      if (impToken) {
        const impSession = await verifySessionToken(impToken);
        if (impSession) {
          const impUser = await db.getUserById(impSession.userId);
          if (impUser) return impUser;
        }
      }
    }
  }

  return user;
}

/** Returns the real super-admin user regardless of impersonation cookie */
export async function getRealUser(req: Request): Promise<User | null> {
  const cookieHeader = req.headers.cookie;
  let token: string | undefined;
  if (cookieHeader) {
    const parsed = parseCookieHeader(cookieHeader);
    token = parsed[COOKIE_NAME];
  }
  if (!token) return null;
  const session = await verifySessionToken(token);
  if (!session) return null;
  const user = await db.getUserById(session.userId);
  return user ?? null;
}
