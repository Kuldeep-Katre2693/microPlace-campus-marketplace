import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Mock AI and Razorpay functionality for the hackathon MVP
  
  app.post(api.auth.sync.path, async (req, res) => {
    try {
      const input = api.auth.sync.input.parse(req.body);
      let user = await storage.getUserByClerkId(input.clerkId);
      if (!user) {
        user = await storage.createUser({
          clerkId: input.clerkId,
          name: input.name,
          email: input.email,
        });
      }
      res.status(200).json(user);
    } catch (err) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  app.post(api.auth.verifyId.path, async (req, res) => {
    try {
      const input = api.auth.verifyId.input.parse(req.body);
      // Mock AI OCR verification
      await storage.updateUser(input.userId, { studentIdVerified: true, trustScore: 60 });
      res.status(200).json({ success: true, studentId: "PC-2025-12345", message: "ID verified successfully" });
    } catch (err) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  app.get(api.listings.list.path, async (req, res) => {
    const listings = await storage.getListings();
    res.status(200).json(listings);
  });

  app.post(api.listings.create.path, async (req, res) => {
    try {
      const input = api.listings.create.input.parse(req.body);
      const listing = await storage.createListing(input);
      res.status(201).json(listing);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(400).json({ message: "Invalid input" });
    }
  });

  app.post(api.listings.analyzePrice.path, async (req, res) => {
    try {
      // Mock OpenAI price suggestion
      res.status(200).json({
        fair_price: "₹1,200",
        quick_sell_price: "₹950",
        premium_price: "₹1,500",
        demand_level: "High",
        confidence_score: "85%"
      });
    } catch (err) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  app.post(api.listings.checkScam.path, async (req, res) => {
    try {
      // Mock OpenAI scam detection
      res.status(200).json({
        risk_level: "Low",
        scam_probability: "5%",
        trust_score_adjustment: "+0"
      });
    } catch (err) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  app.post(api.orders.create.path, async (req, res) => {
    try {
      const input = api.orders.create.input.parse(req.body);
      const order = await storage.createOrder(input);
      res.status(201).json(order);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(400).json({ message: "Invalid input" });
    }
  });

  app.post(api.orders.verifyPayment.path, async (req, res) => {
    try {
      const input = api.orders.verifyPayment.input.parse(req.body);
      await storage.updateOrder(input.orderId, { status: "paid", razorpayPaymentId: input.razorpayPaymentId });
      res.status(200).json({ success: true });
    } catch (err) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  app.get(api.users.get.path, async (req, res) => {
    const user = await storage.getUser(Number(req.params.id));
    if (!user) return res.status(404).json({ message: "Not found" });
    res.status(200).json(user);
  });

  // Seed data
  setTimeout(async () => {
    try {
      const listings = await storage.getListings();
      if (listings.length === 0) {
        // Create dummy user
        const seller = await storage.createUser({
          clerkId: "mock_clerk_123",
          name: "Test User",
          email: "test@priyadarshini.edu",
        });
        
        await storage.createListing({
          sellerId: seller.id,
          title: "Engineering Drawing Kit",
          description: "Complete mini-drafter kit, barely used.",
          price: 500,
          category: "Academic",
          condition: "Like New",
          images: ["https://images.unsplash.com/photo-1506784365847-bbad939e9335"]
        });
      }
    } catch (e) {
      console.error("Failed to seed:", e);
    }
  }, 1000);

  return httpServer;
}
