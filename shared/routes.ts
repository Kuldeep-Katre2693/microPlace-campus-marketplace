import { z } from 'zod';
import {
  registerUserSchema,
  loginUserSchema,
  insertListingSchema,
  insertOrderSchema,
  type PublicUser,
  type Listing,
  type Order
} from './schema';

export const errorSchemas = {
  validation: z.object({ message: z.string(), field: z.string().optional() }),
  unauthorized: z.object({ message: z.string() }),
  notFound: z.object({ message: z.string() }),
  internal: z.object({ message: z.string() }),
};

export const api = {
  auth: {
    login: {
      method: 'POST' as const,
      path: '/api/auth/login' as const,
      input: loginUserSchema,
      responses: {
        200: z.custom<PublicUser>(),
        401: errorSchemas.unauthorized,
      }
    },
    register: {
      method: 'POST' as const,
      path: '/api/auth/register' as const,
      input: registerUserSchema,
      responses: {
        201: z.custom<PublicUser>(),
        400: errorSchemas.validation,
      }
    },
    logout: {
      method: 'POST' as const,
      path: '/api/auth/logout' as const,
      responses: {
        200: z.object({ message: z.string() }),
      }
    },
    me: {
      method: 'GET' as const,
      path: '/api/auth/me' as const,
      responses: {
        200: z.custom<PublicUser>(),
        401: errorSchemas.unauthorized,
      }
    },
    verifyId: {
      method: 'POST' as const,
      path: '/api/auth/verify-id' as const,
      input: z.object({
        idImageUrl: z.string().optional()
      }),
      responses: {
        200: z.object({ success: z.boolean(), studentId: z.string().optional(), message: z.string() }),
        401: errorSchemas.unauthorized,
      }
    }
  },
  listings: {
    list: {
      method: 'GET' as const,
      path: '/api/listings' as const,
      responses: {
        200: z.array(z.custom<Listing>()),
      }
    },
    create: {
      method: 'POST' as const,
      path: '/api/listings' as const,
      input: insertListingSchema,
      responses: {
        201: z.custom<Listing>(),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
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
          premium_price: z.string().optional(),
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
        201: z.custom<Order>(),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
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
        401: errorSchemas.unauthorized,
      }
    }
  },
  users: {
    get: {
      method: 'GET' as const,
      path: '/api/users/:id' as const,
      responses: {
        200: z.custom<PublicUser>(),
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
      }
    }
  },
  health: {
    get: {
      method: 'GET' as const,
      path: '/api/health' as const,
      responses: {
        200: z.object({ status: z.literal('ok') }),
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
