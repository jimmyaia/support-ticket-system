import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerStorageProxy } from "./storageProxy";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { storagePut } from "../storage";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => { server.close(() => resolve(true)); });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) return port;
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

// Allowed image MIME types for ticket attachments
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/gif", "image/webp"]);

async function startServer() {
  const app = express();
  const server = createServer(app);
  const isTest = process.env.NODE_ENV === "test";

  // Trust the first proxy hop (Manus/Cloud Run load balancer) so rate-limiters
  // and secure-cookie detection read the real client IP from X-Forwarded-For.
  app.set("trust proxy", 1);

  // ── Security headers ────────────────────────────────────────────────────────
  app.use(
    helmet({
      contentSecurityPolicy: false,    // Vite dev needs this off; handled by proxy in prod
      crossOriginEmbedderPolicy: false,
    })
  );

  // ── Body size limits (tight — no reason to accept 50 MB JSON) ──────────────
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ limit: "1mb", extended: true }));

  // ── Rate limiters ───────────────────────────────────────────────────────────
  // Auth: 10 attempts per 15 min per IP (brute-force protection)
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many attempts. Please try again in 15 minutes." },
    skip: () => isTest,
  });

  // Ticket submission: 20 per 10 min per IP (anti-spam)
  const submitLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many submissions. Please slow down." },
    skip: () => isTest,
  });

  // File upload: 10 per 10 min per IP
  const uploadLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many uploads. Please wait before uploading again." },
    skip: () => isTest,
  });

  // General API: 300 requests per minute per IP
  const apiLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
    skip: () => isTest,
  });

  // Apply rate limiters
  app.use("/api/trpc/auth.login", authLimiter);
  app.use("/api/trpc/auth.register", authLimiter);
  app.use("/api/trpc/tickets.submit", submitLimiter);
  app.use("/api", apiLimiter);

  registerStorageProxy(app);

  // ── Image upload endpoint ───────────────────────────────────────────────────
  app.post(
    "/api/upload-ticket-image",
    uploadLimiter,
    express.raw({ type: "*/*", limit: "10mb" }),
    async (req, res) => {
      try {
        const contentType = req.headers["content-type"] || "application/octet-stream";
        const body = req.body as Buffer;
        if (!body || body.length === 0) {
          res.status(400).json({ error: "No file data received" });
          return;
        }
        // Validate MIME type — only allow images
        const mimeType = contentType.split(";")[0].trim().toLowerCase();
        if (!ALLOWED_IMAGE_TYPES.has(mimeType)) {
          res.status(400).json({ error: "Only image files (JPEG, PNG, GIF, WebP) are allowed." });
          return;
        }
        const ext = mimeType.includes("png") ? "png"
          : mimeType.includes("gif") ? "gif"
          : mimeType.includes("webp") ? "webp"
          : "jpg";
        const { url } = await storagePut(`ticket-images/${Date.now()}.${ext}`, body, mimeType);
        res.json({ url });
      } catch (err) {
        console.error("[Upload] Error:", err);
        res.status(500).json({ error: "Upload failed" });
      }
    }
  );

  // ── tRPC ────────────────────────────────────────────────────────────────────
  app.use(
    "/api/trpc",
    createExpressMiddleware({ router: appRouter, createContext })
  );

  // ── Static / Vite ───────────────────────────────────────────────────────────
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);
  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
