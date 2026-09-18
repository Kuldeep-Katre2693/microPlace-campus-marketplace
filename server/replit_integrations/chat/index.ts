import OpenAI from "openai";
import { registerChatRoutes } from "./routes";
import { chatStorage } from "./storage";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY || process.env.OPENAI_API_KEY || "dummy_key",
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

export const chat = openai.chat;

export { registerChatRoutes, chatStorage };

