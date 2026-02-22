import { pgTable, text, serial, integer, boolean, timestamp, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  clerkId: text("clerk_id").notNull().unique(), // We'll mock Clerk auth for the hackathon MVP
  name: text("name").notNull(),
  email: text("email").notNull(),
  studentId: text("student_id"),
  studentIdVerified: boolean("student_id_verified").default(false),
  trustScore: integer("trust_score").default(50),
  totalTransactions: integer("total_transactions").default(0),
  rating: numeric("rating").default('0'),
  createdAt: timestamp("created_at").defaultNow(),
});

export const listings = pgTable("listings", {
  id: serial("id").primaryKey(),
  sellerId: integer("seller_id").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  price: integer("price").notNull(),
  category: text("category").notNull(),
  condition: text("condition").notNull(),
  images: text("images").array().notNull(),
  status: text("status").default("active"), // active, sold, deleted
  createdAt: timestamp("created_at").defaultNow(),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  listingId: integer("listing_id").notNull(),
  buyerId: integer("buyer_id").notNull(),
  sellerId: integer("seller_id").notNull(),
  amount: integer("amount").notNull(),
  commissionAmount: integer("commission_amount").notNull(),
  status: text("status").default("created"), // created, paid, hold, released, cancelled
  razorpayOrderId: text("razorpay_order_id"),
  razorpayPaymentId: text("razorpay_payment_id"),
  meetingZone: text("meeting_zone").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Zod schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true, trustScore: true, totalTransactions: true, rating: true, createdAt: true });
export const insertListingSchema = createInsertSchema(listings).omit({ id: true, status: true, createdAt: true });
export const insertOrderSchema = createInsertSchema(orders).omit({ id: true, status: true, razorpayOrderId: true, razorpayPaymentId: true, commissionAmount: true, createdAt: true });

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Listing = typeof listings.$inferSelect;
export type InsertListing = z.infer<typeof insertListingSchema>;
export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
