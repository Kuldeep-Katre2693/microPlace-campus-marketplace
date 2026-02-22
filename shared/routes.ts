import { z } from 'zod';
import { insertUserSchema, insertListingSchema, insertOrderSchema, users, listings, orders } from './schema';

export const errorSchemas = {
  validation: z.object({ message: z.string(), field: z.string().optional() }),
  notFound: z.object({ message: z.string() }),
  internal: z.object({ message: z.string() }),
};

export const api = {
  auth: {
    login: {
      method: 'POST' as const,
      path: '/api/auth/login' as const,
      input: z.object({
        email: z.string().email(),
        password: z.string().min(6),
      }),
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: errorSchemas.validation,
      }
    },
    register: {
      method: 'POST' as const,
      path: '/api/auth/register' as const,
      input: z.object({
        name: z.string().min(2),
        email: z.string().email(),
        password: z.string().min(6),
      }),
      responses: {
        201: z.custom<typeof users.$inferSelect>(),
        400: errorSchemas.validation,
      }
    },
    verifyId: {
      method: 'POST' as const,
      path: '/api/auth/verify-id' as const,
      input: z.object({
        userId: z.number(),
        idImageUrl: z.string()
      }),
      responses: {
        200: z.object({ success: z.boolean(), studentId: z.string().optional(), message: z.string() }),
      }
    }
  },
  listings: {
    list: {
      method: 'GET' as const,
      path: '/api/listings' as const,
      responses: {
        200: z.array(z.custom<typeof listings.$inferSelect>()),
      }
    },
    create: {
      method: 'POST' as const,
      path: '/api/listings' as const,
      input: insertListingSchema,
      responses: {
        201: z.custom<typeof listings.$inferSelect>(),
        400: errorSchemas.validation,
      }
    },
    analyzePrice: {
      method: 'POST' as const,
      path: '/api/listings/analyze' as const,
      input: z.object({
        title: z.string(),
        condition: z.string(),
        category: z.string(),
      }),
      responses: {
        200: z.object({
          fair_price: z.string(),
          quick_sell_price: z.string(),
          premium_price: z.string(),
          demand_level: z.string(),
          confidence_score: z.string()
        })
      }
    },
    checkScam: {
      method: 'POST' as const,
      path: '/api/listings/check-scam' as const,
      input: z.object({
        title: z.string(),
        description: z.string(),
        price: z.number(),
      }),
      responses: {
        200: z.object({
          risk_level: z.string(),
          scam_probability: z.string(),
          trust_score_adjustment: z.string()
        })
      }
    }
  },
  orders: {
    create: {
      method: 'POST' as const,
      path: '/api/orders' as const,
      input: insertOrderSchema,
      responses: {
        201: z.custom<typeof orders.$inferSelect>(),
        400: errorSchemas.validation,
      }
    },
    verifyPayment: {
      method: 'POST' as const,
      path: '/api/orders/verify-payment' as const,
      input: z.object({
        orderId: z.number(),
        razorpayPaymentId: z.string(),
        razorpaySignature: z.string(),
      }),
      responses: {
        200: z.object({ success: z.boolean() }),
      }
    }
  },
  users: {
    get: {
      method: 'GET' as const,
      path: '/api/users/:id' as const,
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        404: errorSchemas.notFound,
      }
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
