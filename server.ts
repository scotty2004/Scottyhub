/**
 * Cajo Pro — unified server.
 *
 * This is the ONE process that runs the whole merged application: it serves
 * the Cajo Pro frontend (via Vite in dev / static dist in prod) AND mounts
 * every real ScottyHub backend route (auth, posts, wallet, boost, marketplace,
 * movies, sports, botgen, downloads, admin, analytics, messaging/socket chat,
 * etc.) under /api/*. The ScottyHub backend source lives under ./server
 * (routes, middleware, socket, utils, templates, db.js) — copied over as-is
 * from the ScottyHub repo, since that logic was already complete and working;
 * only this entry point and the frontend (src/) were adapted during the merge.
 */
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import rateLimit from "express-rate-limit";
import http from "http";
import path from "path";
import { createServer as createViteServer } from "vite";
import { Server as SocketIOServer } from "socket.io";

// @ts-ignore — CommonJS module from the ScottyHub backend (no type declarations)
import dbModule from "./server/db.js";
// @ts-ignore
import authMiddleware from "./server/middleware/auth.js";
// @ts-ignore
import chatSocket from "./server/socket/chat.js";

const { initDB, db } = dbModule as any;
const { protect } = authMiddleware as any;
const { attachSocket } = chatSocket as any;

// @ts-ignore
import authRoutes from "./server/routes/auth.js";
// @ts-ignore
import userRoutes from "./server/routes/users.js";
// @ts-ignore
import postRoutes from "./server/routes/posts.js";
// @ts-ignore
import aiRoutes from "./server/routes/ai.js";
// @ts-ignore
import moviesRoutes from "./server/routes/movies.js";
// @ts-ignore
import sportsRoutes from "./server/routes/sports.js";
// @ts-ignore
import downloadRoutes from "./server/routes/download.js";
// @ts-ignore
import adminRoutes from "./server/routes/admin.js";
// @ts-ignore
import notifRoutes from "./server/routes/notifications.js";
// @ts-ignore
import followRoutes from "./server/routes/follows.js";
// @ts-ignore
import searchRoutes from "./server/routes/search.js";
// @ts-ignore
import uploadRoutes from "./server/routes/upload.js";
// @ts-ignore
import boostRoutes from "./server/routes/boost.js";
// @ts-ignore
import dashboardRoutes from "./server/routes/dashboard.js";
// @ts-ignore
import earnRoutes from "./server/routes/earn.js";
// @ts-ignore
import walletRoutes from "./server/routes/wallet.js";
// @ts-ignore
import groupsRoutes from "./server/routes/groups.js";
// @ts-ignore
import premiumRoutes from "./server/routes/premium.js";
// @ts-ignore
import marketplaceRoutes from "./server/routes/marketplace.js";
// @ts-ignore
import analyticsRoutes from "./server/routes/analytics.js";
// @ts-ignore
import settingsRoutes from "./server/routes/settings.js";
// @ts-ignore
import botgenRoutes from "./server/routes/botgen.js";
// @ts-ignore
import roomchatModule from "./server/routes/roomchat.js";
// @ts-ignore
import messagesRoutes from "./server/routes/messages.js";
// @ts-ignore
import pushRoutes from "./server/routes/push.js";

const { router: roomchatRoutes } = roomchatModule as any;

dotenv.config();

const app = express();
const httpServer = http.createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: { origin: process.env.FRONTEND_URL || "*" },
});
app.set("io", io);
attachSocket(io);

const PORT = Number(process.env.PORT) || 3000;

// Render/most hosts sit behind a reverse proxy — trust the first hop so
// express-rate-limit reads the real client IP from X-Forwarded-For.
app.set("trust proxy", 1);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests, slow down!",
});
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: "Too many auth attempts, try again later.",
});

// Same-origin app (frontend + API share one process/port), so CORS is mostly
// a no-op here — kept for the case where FRONTEND_URL differs (e.g. a
// separately hosted staging frontend).
const allowedOrigin = process.env.FRONTEND_URL || "*";
app.use(
  cors({
    origin: allowedOrigin,
    credentials: allowedOrigin !== "*",
  })
);
app.use(express.json({ limit: "2mb" }));
app.use(limiter);

// Basic security headers (no extra dependency needed)
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "geolocation=(), microphone=(), camera=()");
  next();
});

// ---------- Real ScottyHub API (unchanged backend logic) ----------
app.get("/api", (req, res) => {
  res.json({ status: "ScottyHub API is running", version: "3.0.0" });
});

app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/movies", moviesRoutes);
app.use("/api/sports", sportsRoutes);
app.use("/api/download", downloadRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/notifications", notifRoutes);
app.use("/api/follows", followRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/boost", boostRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/earn", earnRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/groups", groupsRoutes);
app.use("/api/premium", premiumRoutes);
app.use("/api/marketplace", marketplaceRoutes);
app.use("/api/botgen", botgenRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/messages", messagesRoutes);
app.use("/api/roomchat", roomchatRoutes);
app.use("/api/push", pushRoutes);

// Public news endpoint (anyone logged-in can read)
app.get("/api/news", protect, async (req, res) => {
  try {
    const result = await db.execute("SELECT * FROM news ORDER BY created_at DESC");
    res.json({ news: result.rows });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Public announcements endpoint — returns pinned/admin posts
app.get("/api/announcements", protect, async (req, res) => {
  try {
    const result = await db.execute({
      sql: `SELECT p.id, p.content, p.media_url, p.media_type, p.created_at, p.pinned,
                   u.username as author_username
            FROM posts p
            JOIN users u ON p.author_id = u.id
            WHERE p.pinned = 1 OR u.role = 'admin'
            ORDER BY p.pinned DESC, p.created_at DESC
            LIMIT 50`,
    });
    res.json({ announcements: result.rows });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Public, no-auth stats used by the landing hero (real counts, not fabricated)
app.get("/api/stats/public", async (req, res) => {
  try {
    const [users, posts, bots] = await Promise.all([
      db.execute("SELECT COUNT(*) as c FROM users"),
      db.execute("SELECT COUNT(*) as c FROM posts"),
      db.execute("SELECT COUNT(*) as c FROM bot_listings WHERE status = 'active'"),
    ]);
    res.json({ users: users.rows[0].c, posts: posts.rows[0].c, bots: bots.rows[0].c });
  } catch (err) {
    res.json({ users: 0, posts: 0, bots: 0 });
  }
});

// ---------- Frontend (Cajo Pro UI) ----------
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(err.stack);
    res.status(500).json({ message: "Something went wrong" });
  });

  try {
    await initDB();
  } catch (err: any) {
    console.error("DB init failed:", err.message);
    process.exit(1);
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Cajo Pro (ScottyHub) running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
