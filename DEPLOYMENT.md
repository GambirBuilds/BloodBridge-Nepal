# BLOODBRIDGE Nepal — Production Deployment Guide

This guide describes how to deploy BLOODBRIDGE into a resilient, production-grade cloud architecture.

---

## 1. Target Infrastructure Overview

- **Frontend**: Vercel (or Cloudflare Pages / Netlify)
- **Backend**: Render, Railway, AWS ECS, or Google Cloud Run (Node.js runtime)
- **Database**: Managed PostgreSQL (AWS RDS, Supabase, Neon, or Google Cloud SQL)
- **Email Service**: Resend (Transactional verification & notices)
- **SMS Gateway**: Sparrow SMS (Nepal mobile delivery)

---

## 2. Environment Configuration

Deployments require environment variables defined in production secrets managers. Never commit production secrets to Git.

### 2.1 Backend Environment Variables
```env
NODE_ENV=production
PORT=5000
APP_URL=https://bloodbridge.np

DATABASE_URL=postgresql://user:password@pg-host.provider.com:5432/bloodbridge_prod?sslmode=require

JWT_ACCESS_SECRET=generated-high-entropy-access-secret-32-chars
JWT_REFRESH_SECRET=generated-high-entropy-refresh-secret-32-chars
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

CORS_ORIGIN=https://bloodbridge.np
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=300
AUTH_RATE_LIMIT_MAX=25

RESEND_API_KEY=re_your_api_key_here
RESEND_FROM_EMAIL=notifications@bloodbridge.np

SPARROW_SMS_TOKEN=your_sparrow_sms_token
SPARROW_SMS_FROM=BloodBridge
```

### 2.2 Frontend Environment Variables (Vercel)
```env
VITE_API_BASE_URL=https://api.bloodbridge.np/api
VITE_NEPAL_DEFAULT_LAT=28.0000
VITE_NEPAL_DEFAULT_LNG=84.2000
VITE_ENABLE_INTERACTIVE_MAP=true
```

---

## 3. Database Migration & Provisioning

Before launching the backend, run Prisma database migrations against your managed PostgreSQL instance:

```bash
# 1. Apply database schema migrations
npx prisma migrate deploy

# 2. (Optional: Development/Staging only)
# Seed demonstration records for testing in staging
npm run seed
```

*Important*: Never run development seed scripts on a production hospital database.

---

## 4. Building & Running

### 4.1 Production Frontend Build (Vercel)
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Framework Preset**: Vite

### 4.2 Production Backend (Render / Docker)
- **Build Command**: `npm install --production=false && npx prisma generate`
- **Start Command**: `npm start` (or `node server.ts`)

---

## 5. Health Checks & Monitoring

- **Health Endpoint**: `GET /api/health`
  - Expected Response: `HTTP 200 OK`
  - Returns service status and UTC timestamp.
- **Monitoring**: Configure UptimeRobot, BetterUptime, or CloudWatch alarms on `https://api.bloodbridge.np/api/health`.

---

## 6. Security Hardening Checklist

- [x] Enforce SSL/TLS (`https://`) across all public traffic.
- [x] Configure strict CORS headers restricting API access to the production frontend domain.
- [x] Protect API from abuse with Rate Limiting (`express-rate-limit`).
- [x] Rotate JWT access tokens every 15 minutes; store refresh tokens securely.
- [x] Sanitize public donor discovery responses to ensure phone and email credentials are never transmitted over the wire.
- [x] Enable tamper-evident audit logging for hospital verification and administrative status changes.
