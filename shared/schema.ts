import { pgTable, text, serial, integer, boolean, timestamp, numeric, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  clerkId: text("clerk_id").notNull().unique(), // kept for backward compatibility
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  studentId: text("student_id"),
  studentIdVerified: boolean("student_id_verified").default(false),
  trustScore: integer("trust_score").default(50),
  totalTransactions: integer("total_transactions").default(0),
  rating: numeric("rating").default('0'),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("users_email_idx").on(table.email),
  index("users_clerk_id_idx").on(table.clerkId),
]);

export const listings = pgTable("listings", {
  id: serial("id").primaryKey(),
  sellerId: integer("seller_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  price: integer("price").notNull(),
  category: text("category").notNull(),
  condition: text("condition").notNull(),
  images: text("images").array().notNull(),
  status: text("status").default("active"),
  fairPrice: integer("fair_price"),
  quickSellPrice: integer("quick_sell_price"),
  premiumPrice: integer("premium_price"),
  demandLevel: text("demand_level"),
  confidenceScore: integer("confidence_score"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("listings_seller_id_idx").on(table.sellerId),
  index("listings_category_idx").on(table.category),
  index("listings_status_idx").on(table.status),
]);

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  listingId: integer("listing_id").notNull().references(() => listings.id),
  buyerId: integer("buyer_id").notNull().references(() => users.id),
  sellerId: integer("seller_id").notNull().references(() => users.id),
  amount: integer("amount").notNull(),
  commissionAmount: integer("commission_amount").notNull(),
  status: text("status").default("created"),
  razorpayOrderId: text("razorpay_order_id"),
  razorpayPaymentId: text("razorpay_payment_id"),
  meetingZone: text("meeting_zone").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("orders_listing_id_idx").on(table.listingId),
  index("orders_buyer_id_idx").on(table.buyerId),
  index("orders_seller_id_idx").on(table.sellerId),
]);

// Auth Schemas
export const registerUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address").max(150),
  password: z.string().min(6, "Password must be at least 6 characters").max(100),
  studentIdImage: z.string().optional(),
});

export const loginUserSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const insertUserSchema = createInsertSchema(users)
  .omit({
    id: true,
    trustScore: true,
    totalTransactions: true,
    rating: true,
    createdAt: true,
  })
  .extend({
    clerkId: z.string().optional(),
    studentIdImage: z.string().optional(),
  });

export const insertListingSchema = createInsertSchema(listings)
  .omit({
    id: true,
    status: true,
    createdAt: true,
  })
  .extend({
    sellerId: z.number().optional(), // Optional in client payload, overridden by server session
  });

export const insertOrderSchema = createInsertSchema(orders)
  .omit({
    id: true,
    status: true,
    razorpayOrderId: true,
    razorpayPaymentId: true,
    commissionAmount: true,
    createdAt: true,
  })
  .extend({
    buyerId: z.number().optional(), // Overridden by server session
    sellerId: z.number().optional(), // Derived from listing
    amount: z.number().optional(), // Derived from listing
  });

export type User = typeof users.$inferSelect;
export type PublicUser = Omit<User, "passwordHash">;
export type InsertUser = z.infer<typeof insertUserSchema>;

export function toPublicUser(user: User): PublicUser {
  const { passwordHash: _hash, ...publicData } = user;
  return publicData;
}

export type Listing = typeof listings.$inferSelect;
export type InsertListing = z.infer<typeof insertListingSchema>;

export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;

export const conversations = pgTable("conversations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("conversations_user_id_idx").on(table.userId),
]);

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").notNull().references(() => conversations.id, { onDelete: "cascade" }),
  role: text("role").notNull(), // 'user' | 'assistant'
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("messages_conversation_id_idx").on(table.conversationId),
]);

export const insertConversationSchema = createInsertSchema(conversations).omit({
  id: true,
  createdAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
});

export type Conversation = typeof conversations.$inferSelect;
export type InsertConversation = z.infer<typeof insertConversationSchema>;

export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
