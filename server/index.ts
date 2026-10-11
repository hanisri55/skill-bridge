import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";
import cors from "cors";
import fs from "fs";
import { initDb, closeDb, query } from "./db";
import { seedDatabase } from "./seed";
import apiRouter from "./routes/index";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  // Initialize Database and Seed data safely
  await initDb();
  await seedDatabase();

  const app = express();
  const server = createServer(app);

  // Trust reverse proxy (e.g. Render, Cloudflare, AWS)
  app.set("trust proxy", 1);

  // Security headers
  app.use((_req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "SAMEORIGIN");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    if (process.env.NODE_ENV === "production") {
      res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
    }
    next();
  });

  app.use(cors({
    origin: true,
    credentials: true,
  }));
  app.use(cookieParser());
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));

  // Health check endpoint for Render / cloud monitoring
  app.get(["/healthz", "/api/health"], async (_req, res) => {
    try {
      await query("SELECT 1");
      res.status(200).json({
        status: "ok",
        uptime: Math.round(process.uptime()),
        timestamp: new Date().toISOString(),
        database: "connected",
        environment: process.env.NODE_ENV || "development",
      });
    } catch (err: any) {
      res.status(503).json({
        status: "degraded",
        uptime: Math.round(process.uptime()),
        timestamp: new Date().toISOString(),
        database: "disconnected",
        error: err.message,
      });
    }
  });

  // Mount API routes
  app.use("/api", apiRouter);

  // Serve static files from dist/public in production (or whenever built bundle exists)
  const staticPath = path.resolve(__dirname, "public");
  if (process.env.NODE_ENV === "production" || fs.existsSync(staticPath)) {
    app.use(express.static(staticPath));

    // Client-side routing fallback
    app.get("*", (req, res, next) => {
      if (req.path.startsWith("/api") || req.path === "/healthz") return next();
      res.sendFile(path.join(staticPath, "index.html"));
    });
  }

  // Centralized Error Handler
  app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error("[Server Unhandled Error]", err);
    res.status(err.status || 500).json({
      success: false,
      error: process.env.NODE_ENV === "production" ? "Internal server error" : (err.message || "Internal server error"),
    });
  });

  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : (process.env.NODE_ENV === "production" ? 3000 : 3001);

  server.listen(port, "0.0.0.0", () => {
    console.log(`[Server] SkillBridge AI backend listening on port ${port} (${process.env.NODE_ENV || "development"})`);
  });

  const shutdown = async () => {
    console.log("[Server] Gracefully shutting down...");
    server.close();
    await closeDb();
    process.exit(0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

startServer().catch((err) => {
  console.error("[Server] Fatal startup error:", err);
  process.exit(1);
});
