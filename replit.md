# MicroPlace - Campus Marketplace Platform

## Overview

MicroPlace is a campus-only trusted marketplace platform built for Priyadarshini College students. It allows verified students to buy and sell textbooks, electronics, stationery, and other items within a safe, student-verified ecosystem. Key features include student ID verification (with AI OCR simulation), a trust score system, listing management with AI-powered price analysis and scam detection, a seller dashboard with analytics, and simulated Razorpay payment integration.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **Framework**: React with TypeScript, using Vite as the build tool
- **Routing**: Wouter (lightweight alternative to React Router)
- **State Management**: TanStack React Query for server state; React Context for auth state
- **UI Components**: shadcn/ui component library (new-york style) built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming (campus blue theme)
- **Animations**: Framer Motion for page transitions and interactive elements
- **Charts**: Recharts for the seller dashboard analytics
- **File Uploads**: react-dropzone for student ID verification and listing images
- **Icons**: Lucide React

The frontend lives in `client/src/` with pages in `pages/`, reusable components in `components/`, hooks in `hooks/`, and utility functions in `lib/`. Path aliases are configured: `@/` maps to `client/src/`, `@shared/` maps to `shared/`, `@assets/` maps to `attached_assets/`.

### Backend
- **Runtime**: Node.js with Express 5
- **Language**: TypeScript, executed with tsx
- **API Pattern**: REST API with routes defined in `server/routes.ts`, with a shared route contract in `shared/routes.ts` that includes Zod schemas for input validation and response types
- **Development**: Vite dev server middleware is integrated into Express for HMR during development (see `server/vite.ts`)
- **Production**: Client is built with Vite, server is bundled with esbuild into `dist/index.cjs` (see `script/build.ts`)

### Database
- **Database**: PostgreSQL (required, connection via `DATABASE_URL` environment variable)
- **ORM**: Drizzle ORM with `drizzle-zod` for schema-to-Zod integration
- **Schema Location**: `shared/schema.ts` (main tables: users, listings, orders) and `shared/models/chat.ts` (conversations, messages for AI chat features)
- **Migrations**: Managed via `drizzle-kit push` (`npm run db:push`)
- **Storage Layer**: `server/storage.ts` implements a `DatabaseStorage` class with an `IStorage` interface for all data access

### Authentication
- **Approach**: Simple email/password auth stored in PostgreSQL (no external auth provider)
- **Client-side**: Auth state persisted in localStorage, managed via React Context (`use-auth.tsx`)
- **Campus Restriction**: Designed for `@priyadarshini.edu` email domain restriction
- **Student ID Verification**: Upload-based flow with simulated AI OCR analysis; updates user's `studentIdVerified` flag and `trustScore`
- **Note**: No session middleware or JWT is currently implemented; auth is client-side only for MVP

### Key Data Models
- **Users**: id, name, email, password, studentId, studentIdVerified, trustScore, totalTransactions, rating
- **Listings**: id, sellerId, title, description, price, category, condition, images (text array), status
- **Orders**: id, listingId, buyerId, sellerId, amount, commissionAmount, status, razorpayOrderId, razorpayPaymentId, meetingZone
- **Conversations/Messages**: For AI chat integration (separate model in `shared/models/chat.ts`)

### AI Integrations (Replit)
Located in `server/replit_integrations/` and `client/replit_integrations/`:
- **Chat**: OpenAI-powered conversation system with database-backed storage
- **Audio**: Voice recording, streaming playback, and speech-to-text via AudioWorklet
- **Image**: Image generation using OpenAI's gpt-image-1 model
- **Batch**: Batch processing utilities with rate limiting and retries
- These use `AI_INTEGRATIONS_OPENAI_API_KEY` and `AI_INTEGRATIONS_OPENAI_BASE_URL` environment variables

### Build & Development
- `npm run dev` — Starts development server with Vite HMR
- `npm run build` — Builds client (Vite) and server (esbuild) to `dist/`
- `npm start` — Runs production build
- `npm run db:push` — Pushes Drizzle schema to PostgreSQL
- `npm run check` — TypeScript type checking

## External Dependencies

### Required Services
- **PostgreSQL**: Primary database (provision and set `DATABASE_URL` environment variable)
- **OpenAI API** (via Replit AI Integrations): Used for chat, image generation, voice features. Requires `AI_INTEGRATIONS_OPENAI_API_KEY` and `AI_INTEGRATIONS_OPENAI_BASE_URL`

### Simulated/Planned Integrations
- **Razorpay**: Payment gateway integration is UI-simulated for MVP (order model has razorpay fields but no live integration)
- **Student ID OCR**: Currently simulated with a timeout; designed for AI-powered OCR extraction

### Key NPM Dependencies
- **Server**: express, drizzle-orm, pg, zod, openai, nanoid, connect-pg-simple
- **Client**: react, wouter, @tanstack/react-query, framer-motion, recharts, react-dropzone, shadcn/ui (Radix primitives + tailwindcss + class-variance-authority)
- **Shared**: drizzle-zod, zod (shared validation schemas between client and server)