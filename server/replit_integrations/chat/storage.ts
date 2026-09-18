import { db } from "../../db";
import { conversations, messages } from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export interface IChatStorage {
  getConversation(id: number): Promise<typeof conversations.$inferSelect | undefined>;
  getAllConversations(): Promise<(typeof conversations.$inferSelect)[]>;
  createConversation(title: string): Promise<typeof conversations.$inferSelect>;
  deleteConversation(id: number): Promise<void>;
  getMessagesByConversation(conversationId: number): Promise<(typeof messages.$inferSelect)[]>;
  createMessage(conversationId: number, role: string, content: string): Promise<typeof messages.$inferSelect>;
}

class DatabaseChatStorage implements IChatStorage {
  async getConversation(id: number) {
    const [conversation] = await db.select().from(conversations).where(eq(conversations.id, id));
    return conversation;
  }

  async getAllConversations() {
    return db.select().from(conversations).orderBy(desc(conversations.createdAt));
  }

  async createConversation(title: string) {
    const [conversation] = await db.insert(conversations).values({ title }).returning();
    return conversation;
  }

  async deleteConversation(id: number) {
    await db.delete(messages).where(eq(messages.conversationId, id));
    await db.delete(conversations).where(eq(conversations.id, id));
  }

  async getMessagesByConversation(conversationId: number) {
    return db.select().from(messages).where(eq(messages.conversationId, conversationId)).orderBy(messages.createdAt);
  }

  async createMessage(conversationId: number, role: string, content: string) {
    const [message] = await db.insert(messages).values({ conversationId, role, content }).returning();
    return message;
  }
}

class MemChatStorage implements IChatStorage {
  private conversations: Map<number, typeof conversations.$inferSelect> = new Map();
  private messages: Map<number, typeof messages.$inferSelect> = new Map();
  private currentConvId = 1;
  private currentMsgId = 1;

  async getConversation(id: number) {
    return this.conversations.get(id);
  }

  async getAllConversations() {
    return Array.from(this.conversations.values()).sort(
      (a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0)
    );
  }

  async createConversation(title: string) {
    const id = this.currentConvId++;
    const conversation = {
      id,
      userId: 1,
      title,
      createdAt: new Date(),
    };
    this.conversations.set(id, conversation);
    return conversation;
  }

  async deleteConversation(id: number) {
    for (const [msgId, msg] of this.messages.entries()) {
      if (msg.conversationId === id) {
        this.messages.delete(msgId);
      }
    }
    this.conversations.delete(id);
  }

  async getMessagesByConversation(conversationId: number) {
    return Array.from(this.messages.values())
      .filter((m) => m.conversationId === conversationId)
      .sort((a, b) => (a.createdAt?.getTime() || 0) - (b.createdAt?.getTime() || 0));
  }

  async createMessage(conversationId: number, role: string, content: string) {
    const id = this.currentMsgId++;
    const message = {
      id,
      conversationId,
      role,
      content,
      createdAt: new Date(),
    };
    this.messages.set(id, message);
    return message;
  }
}

export const chatStorage: IChatStorage = process.env.DATABASE_URL
  ? new DatabaseChatStorage()
  : new MemChatStorage();


