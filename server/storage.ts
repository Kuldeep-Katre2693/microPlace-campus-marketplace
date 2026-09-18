import { db } from "./db";
import {
  users, listings, orders,
  type User, type InsertUser,
  type Listing, type InsertListing,
  type Order, type InsertOrder
} from "@shared/schema";
import { eq } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User>;
  
  getListings(): Promise<Listing[]>;
  getListing(id: number): Promise<Listing | undefined>;
  createListing(listing: InsertListing): Promise<Listing>;
  
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrder(id: number, updates: Partial<Order>): Promise<Order>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const { studentIdImage, ...userData } = insertUser;
    const [user] = await db.insert(users).values({
      ...userData,
      clerkId: userData.clerkId || `local_${Date.now()}`,
      studentIdVerified: userData.studentIdVerified ?? false,
      trustScore: 50,
      totalTransactions: 0,
      rating: '0',
    }).returning();
    return user;
  }
  
  async updateUser(id: number, updates: Partial<User>): Promise<User> {
    const [user] = await db.update(users).set(updates).where(eq(users.id, id)).returning();
    if (!user) throw new Error(`User with ID ${id} not found`);
    return user;
  }

  async getListings(): Promise<Listing[]> {
    return await db.select().from(listings);
  }

  async getListing(id: number): Promise<Listing | undefined> {
    const [listing] = await db.select().from(listings).where(eq(listings.id, id));
    return listing;
  }

  async createListing(insertListing: InsertListing): Promise<Listing> {
    const [listing] = await db.insert(listings).values({
      ...insertListing,
      status: "active",
    }).returning();
    return listing;
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const [order] = await db.insert(orders).values({
      ...insertOrder,
      status: "created",
      commissionAmount: Math.floor(insertOrder.amount * 0.05)
    }).returning();
    return order;
  }
  
  async updateOrder(id: number, updates: Partial<Order>): Promise<Order> {
    const [order] = await db.update(orders).set(updates).where(eq(orders.id, id)).returning();
    if (!order) throw new Error(`Order with ID ${id} not found`);
    return order;
  }
}

export class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private listings: Map<number, Listing> = new Map();
  private orders: Map<number, Order> = new Map();
  private currentUserId = 1;
  private currentListingId = 1;
  private currentOrderId = 1;

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const normalized = email.toLowerCase();
    return Array.from(this.users.values()).find((u) => u.email.toLowerCase() === normalized);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const { studentIdImage, ...userData } = insertUser;
    const user: User = {
      id,
      clerkId: userData.clerkId || `local_${Date.now()}`,
      name: userData.name,
      email: userData.email,
      password: userData.password,
      studentId: userData.studentId || null,
      studentIdVerified: userData.studentIdVerified ?? false,
      trustScore: 50,
      totalTransactions: 0,
      rating: "0",
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User> {
    const user = this.users.get(id);
    if (!user) throw new Error(`User ${id} not found`);
    const updated = { ...user, ...updates };
    this.users.set(id, updated);
    return updated;
  }

  async getListings(): Promise<Listing[]> {
    return Array.from(this.listings.values());
  }

  async getListing(id: number): Promise<Listing | undefined> {
    return this.listings.get(id);
  }

  async createListing(insertListing: InsertListing): Promise<Listing> {
    const id = this.currentListingId++;
    const listing: Listing = {
      id,
      sellerId: insertListing.sellerId,
      title: insertListing.title,
      description: insertListing.description,
      price: insertListing.price,
      category: insertListing.category,
      condition: insertListing.condition,
      images: insertListing.images || [],
      status: "active",
      fairPrice: insertListing.fairPrice ?? null,
      quickSellPrice: insertListing.quickSellPrice ?? null,
      premiumPrice: insertListing.premiumPrice ?? null,
      demandLevel: insertListing.demandLevel ?? null,
      confidenceScore: insertListing.confidenceScore ?? null,
      createdAt: new Date(),
    };
    this.listings.set(id, listing);
    return listing;
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const id = this.currentOrderId++;
    const order: Order = {
      id,
      listingId: insertOrder.listingId,
      buyerId: insertOrder.buyerId,
      sellerId: insertOrder.sellerId,
      amount: insertOrder.amount,
      commissionAmount: Math.floor(insertOrder.amount * 0.05),
      status: "created",
      razorpayOrderId: null,
      razorpayPaymentId: null,
      meetingZone: insertOrder.meetingZone,
      createdAt: new Date(),
    };
    this.orders.set(id, order);
    return order;
  }

  async updateOrder(id: number, updates: Partial<Order>): Promise<Order> {
    const order = this.orders.get(id);
    if (!order) throw new Error(`Order ${id} not found`);
    const updated = { ...order, ...updates };
    this.orders.set(id, updated);
    return updated;
  }
}

export const storage: IStorage = (() => {
  if (process.env.DATABASE_URL) {
    return new DatabaseStorage();
  }
  if (process.env.NODE_ENV === "test" || process.env.USE_MOCK_STORAGE === "true") {
    console.warn("[STORAGE] Using in-memory test storage (USE_MOCK_STORAGE=true).");
    return new MemStorage();
  }
  throw new Error("DATABASE_URL is required to initialize DatabaseStorage.");
})();
