import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  app.post(api.auth.login.path, async (req, res) => {
    try {
      const input = api.auth.login.input.parse(req.body);
      const user = await storage.getUserByEmail(input.email);
      if (!user || user.password !== input.password) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      res.status(200).json(user);
    } catch (err) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  app.post(api.auth.register.path, async (req, res) => {
    try {
      const input = api.auth.register.input.parse(req.body);
      const existing = await storage.getUserByEmail(input.email);
      if (existing) {
        return res.status(400).json({ message: "Email already registered" });
      }
      const user = await storage.createUser(input);
      res.status(201).json(user);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(400).json({ message: "Invalid input" });
    }
  });

  app.post(api.auth.verifyId.path, async (req, res) => {
    try {
      const input = api.auth.verifyId.input.parse(req.body);
      const updated = await storage.updateUser(input.userId, { studentIdVerified: true, trustScore: 60 });
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

  app.get("/api/listings/:id", async (req, res) => {
    const listing = await storage.getListing(Number(req.params.id));
    if (!listing) return res.status(404).json({ message: "Listing not found" });
    res.status(200).json(listing);
  });

  // Seed data
  setTimeout(async () => {
    try {
      const existingUsers = await storage.getUserByEmail("bokdesaurabh802@gmail.com");
      if (!existingUsers) {
        const user1 = await storage.createUser({
          clerkId: "user_1",
          name: "Himanshu Bokde",
          email: "bokdesaurabh802@gmail.com",
          password: "password123456",
          studentId: "230400033",
          studentIdVerified: true,
          trustScore: 90,
        });

        const user2 = await storage.createUser({
          clerkId: "user_2",
          name: "Kuldeep Katre",
          email: "kuldeepkatre2693@gmail.com",
          password: "password112233",
          studentId: "230400034",
          studentIdVerified: true,
          trustScore: 85,
        });

        const listings = await storage.getListings();
        if (listings.length === 0) {
          await storage.createListing({
            sellerId: user1.id,
            title: "Engineering Drawing Kit",
            description: "Complete mini-drafter kit, barely used. Perfect for first-year students.",
            price: 500,
            category: "Academic",
            condition: "Like New",
            images: ["https://images.unsplash.com/photo-1506784365847-bbad939e9335"]
          });

          await storage.createListing({
            sellerId: user2.id,
            title: "Scientific Calculator FX-991EX",
            description: "Advanced scientific calculator, essential for all engineering branches.",
            price: 800,
            category: "Electronics",
            condition: "Good",
            images: ["https://images.unsplash.com/photo-1587145820266-a5951ee6f620"]
          });

          await storage.createListing({
            sellerId: user1.id,
            title: "Lab Coat - Size L",
            description: "Clean lab coat, used only for chemistry labs.",
            price: 200,
            category: "Academic",
            condition: "Used",
            images: ["https://images.unsplash.com/photo-1584622650111-993a426fbf0a"]
          });

          await storage.createListing({
            sellerId: user2.id,
            title: "Standard Textbook: Engineering Math",
            description: "HK Dass, latest edition. Very helpful for M1, M2.",
            price: 450,
            category: "Academic",
            condition: "Like New",
            images: ["https://images.unsplash.com/photo-1532012197267-da84d127e765"]
          });

          await storage.createListing({
            sellerId: user2.id,
            title: "Study Desk and Chair",
            description: "Ergonomic chair and sturdy wooden desk for hostel room.",
            price: 2500,
            category: "Furniture",
            condition: "Good",
            images: ["https://picsum.photos/seed/furniture/300"]
          });

          await storage.createListing({
            sellerId: user1.id,
            title: "Mountain Bicycle",
            description: "Hercules mountain bike, 18 gears, well maintained.",
            price: 4500,
            category: "Bicycles",
            condition: "Used",
            images: ["https://picsum.photos/seed/bike/300"]
          });

          await storage.createListing({
            sellerId: user2.id,
            title: "Electric Kettle",
            description: "1.5L electric kettle, useful for making tea/coffee in hostel.",
            price: 600,
            category: "Hostel Essentials",
            condition: "Like New",
            images: ["https://picsum.photos/seed/kettle/300"]
          });
        }
      }
    } catch (e) {
      console.error("Failed to seed:", e);
    }
  }, 1000);

  return httpServer;
}
