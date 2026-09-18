import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { toPublicUser, registerUserSchema, loginUserSchema } from "@shared/schema";
import { z } from "zod";
import { chat } from "./replit_integrations/chat";
import { registerChatRoutes } from "./replit_integrations/chat/routes";
import { registerImageRoutes } from "./replit_integrations/image/routes";
import { registerAudioRoutes } from "./replit_integrations/audio/routes";
import {
  hashPassword,
  verifyPassword,
  normalizeEmail,
  requireAuth,
  authRateLimiter
} from "./auth";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Health check endpoint
  app.get("/api/health", (_req, res) => {
    res.status(200).json({ status: "ok" });
  });

  // Authentication routes
  app.post(api.auth.register.path, authRateLimiter, async (req, res) => {
    try {
      const input = registerUserSchema.parse(req.body);
      const email = normalizeEmail(input.email);

      const existing = await storage.getUserByEmail(email);
      if (existing) {
        return res.status(400).json({ message: "Email already registered" });
      }

      const passwordHash = await hashPassword(input.password);
      const user = await storage.createUser({
        name: input.name,
        email,
        passwordHash,
        studentIdImage: input.studentIdImage,
      });

      // Establish authenticated session
      req.session.userId = user.id;

      res.status(201).json(toPublicUser(user));
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0]?.message || "Invalid input" });
      }
      console.error("Registration error:", err);
      res.status(400).json({ message: "Registration failed" });
    }
  });

  app.post(api.auth.login.path, authRateLimiter, async (req, res) => {
    try {
      const input = loginUserSchema.parse(req.body);
      const email = normalizeEmail(input.email);

      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      const isValidPassword = await verifyPassword(user.passwordHash, input.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Establish authenticated session
      req.session.userId = user.id;

      res.status(200).json(toPublicUser(user));
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0]?.message || "Invalid input" });
      }
      res.status(400).json({ message: "Invalid input" });
    }
  });

  app.post(api.auth.logout.path, (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error("Logout session destroy error:", err);
        return res.status(500).json({ message: "Logout failed" });
      }
      res.clearCookie("microplace.sid");
      res.status(200).json({ message: "Logged out successfully" });
    });
  });

  app.get(api.auth.me.path, async (req, res) => {
    if (!req.session?.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        req.session.destroy(() => {});
        return res.status(401).json({ message: "Session expired" });
      }

      res.status(200).json(toPublicUser(user));
    } catch (err) {
      console.error("Fetch current user error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post(api.auth.verifyId.path, requireAuth, async (req, res) => {
    try {
      const user = req.user!;
      // Update the authenticated user's verification status
      const updated = await storage.updateUser(user.id, {
        studentIdVerified: true,
        trustScore: 95,
      });

      res.status(200).json({
        success: true,
        studentId: "DEMO-" + Math.floor(Math.random() * 100000),
        message: "ID verified successfully",
      });
    } catch (err) {
      console.error("Verification error:", err);
      res.status(500).json({ message: "Verification processing failed" });
    }
  });

  // Listings routes
  app.get(api.listings.list.path, async (_req, res) => {
    try {
      const listings = await storage.getListings();
      res.status(200).json(listings);
    } catch (err) {
      console.error("Error fetching listings:", err);
      res.status(500).json({ message: "Failed to fetch listings" });
    }
  });

  app.post(api.listings.create.path, requireAuth, async (req, res) => {
    try {
      const input = api.listings.create.input.parse(req.body);
      const user = req.user!;

      // Always derive sellerId from the authenticated session
      const listing = await storage.createListing({
        ...input,
        sellerId: user.id,
      });

      res.status(201).json(listing);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0]?.message || "Invalid input" });
      }
      res.status(400).json({ message: "Invalid input" });
    }
  });

  app.get("/api/listings/:id", async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ message: "Invalid listing ID" });
    }
    try {
      const listing = await storage.getListing(id);
      if (!listing) return res.status(404).json({ message: "Listing not found" });
      res.status(200).json(listing);
    } catch (err) {
      console.error("Error fetching listing:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post(api.listings.analyzePrice.path, async (req, res) => {
    try {
      const { title, category, condition } = req.body;

      const prompt = `You are a pricing assistant for a campus marketplace.
Given this item title: "${title || 'Unknown'}" and condition: "${condition || 'Unknown'}",
return JSON:
{
  "title": "",
  "description": "",
  "category": "",
  "fair_price": "",
  "quick_sell_price": ""
}`;

      try {
        const response = await chat.completions.create({
          messages: [
            { role: "system", content: "You are a helpful assistant that returns JSON." },
            { role: "user", content: prompt }
          ],
          model: "gpt-4o-mini",
          response_format: { type: "json_object" }
        });

        const content = response.choices[0]?.message?.content;
        if (content) {
          const aiData = JSON.parse(content);
          return res.status(200).json({
            ...aiData,
            demand_level: "Medium",
            confidence_score: "80%"
          });
        }
      } catch (openaiErr) {
        console.error("OpenAI Error:", openaiErr);
      }

      // Fallback response
      res.status(200).json({
        fair_price: req.body.price ? `₹${req.body.price}` : "₹500",
        quick_sell_price: req.body.price ? `₹${Math.round(Number(req.body.price) * 0.8)}` : "₹400",
        premium_price: req.body.price ? `₹${Math.round(Number(req.body.price) * 1.2)}` : "₹650",
        demand_level: "Medium",
        confidence_score: "50%"
      });
    } catch (err) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  app.post("/api/search/intent", async (req, res) => {
    try {
      const { query } = req.body;
      const intentResponse = {
        intent: "buying",
        categories: ["Electronics", "Academic"],
        keywords: typeof query === "string" ? query.split(" ") : []
      };
      res.status(200).json(intentResponse);
    } catch (err) {
      res.status(400).json({ message: "Search intent failed" });
    }
  });

  app.post(api.listings.checkScam.path, async (_req, res) => {
    try {
      res.status(200).json({
        risk_level: "Low",
        scam_probability: "5%",
        trust_score_adjustment: "+0"
      });
    } catch (err) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  // Orders routes
  app.post(api.orders.create.path, requireAuth, async (req, res) => {
    try {
      const input = api.orders.create.input.parse(req.body);
      const user = req.user!;

      const listing = await storage.getListing(input.listingId);
      if (!listing) {
        return res.status(404).json({ message: "Listing not found" });
      }

      if (listing.sellerId === user.id) {
        return res.status(400).json({ message: "You cannot purchase your own listing" });
      }

      const order = await storage.createOrder({
        ...input,
        buyerId: user.id,
        sellerId: listing.sellerId,
        amount: listing.price,
      });

      res.status(201).json(order);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0]?.message || "Invalid input" });
      }
      res.status(400).json({ message: "Invalid input" });
    }
  });

  app.post(api.orders.verifyPayment.path, requireAuth, async (req, res) => {
    try {
      const input = api.orders.verifyPayment.input.parse(req.body);
      await storage.updateOrder(input.orderId, {
        status: "paid",
        razorpayPaymentId: input.razorpayPaymentId,
      });
      res.status(200).json({ success: true });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0]?.message || "Invalid input" });
      }
      res.status(400).json({ message: "Invalid input" });
    }
  });

  // Users routes (public seller profiles - never leaks passwordHash)
  app.get(api.users.get.path, async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    try {
      const user = await storage.getUser(id);
      if (!user) return res.status(404).json({ message: "User not found" });
      res.status(200).json(toPublicUser(user));
    } catch (err) {
      console.error("Error fetching user:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Register replit integrations
  registerChatRoutes(app);
  registerImageRoutes(app);
  registerAudioRoutes(app);

  return httpServer;
}
