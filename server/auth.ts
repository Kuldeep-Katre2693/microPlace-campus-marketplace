import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import memorystore from "memorystore";
import argon2 from "argon2";
import type { Request, Response, NextFunction } from "express";
import rateLimit from "express-rate-limit";
import { pool } from "./db";
import { storage } from "./storage";
import { User } from "@shared/schema";

declare module "express-session" {
  interface SessionData {
    userId?: number;
  }
}

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

const isProduction = process.env.NODE_ENV === "production";
const sessionSecret = process.env.SESSION_SECRET;

if (isProduction && !sessionSecret) {
  throw new Error("FATAL: SESSION_SECRET environment variable is required in production mode.");
}

function createSessionStore(): session.Store {
  if (pool && process.env.DATABASE_URL) {
    const PgStore = connectPgSimple(session);
    return new PgStore({
      pool,
      tableName: "session",
      createTableIfMissing: true,
    });
  }

  if (process.env.NODE_ENV === "test" || process.env.USE_MOCK_STORAGE === "true") {
    console.warn("[AUTH] Using in-memory session store for testing/mock environment.");
    const MemoryStore = memorystore(session);
    return new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    });
  }

  throw new Error("Cannot initialize session store: DATABASE_URL is missing.");
}

export const sessionMiddleware = session({
  store: createSessionStore(),
  secret: sessionSecret || "microplace_dev_secret_key_change_in_prod",
  resave: false,
  saveUninitialized: false,
  name: "microplace.sid",
  cookie: {
    httpOnly: true,
    sameSite: "lax",
    secure: isProduction,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  },
});

export async function hashPassword(password: string): Promise<string> {
  return await argon2.hash(password, {
    type: argon2.argon2id,
  });
}

export async function verifyPassword(hash: string, password: string): Promise<boolean> {
  try {
    return await argon2.verify(hash, password);
  } catch (err) {
    return false;
  }
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const userId = req.session?.userId;
  if (!userId) {
    return res.status(401).json({ message: "Authentication required" });
  }

  try {
    const user = await storage.getUser(userId);
    if (!user) {
      // Session has invalid userId, clean it up
      req.session.destroy(() => {});
      return res.status(401).json({ message: "Invalid session" });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("Auth middleware error:", err);
    res.status(500).json({ message: "Internal authentication error" });
  }
}

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15, // limit each IP to 15 login/register requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many authentication attempts. Please try again later." },
});
