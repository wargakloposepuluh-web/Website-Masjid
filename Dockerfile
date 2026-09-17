# Multi-stage Dockerfile untuk produksi
FROM node:20-alpine AS base

# 1. Install dependensi
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
COPY prisma ./prisma/

RUN npm ci

# 2. Build Next.js
FROM base AS builder
WORKDIR /app
COPY . .
COPY --from=deps /app/node_modules ./node_modules

ENV NEXT_TELEMETRY_DISABLED 1

RUN chmod -R +x ./node_modules/.bin
RUN npx prisma generate
RUN npm run build

# 3. Runner Produksi
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/package.json ./package.json

RUN mkdir -p /app/public/uploads /app/storage && chown -R nextjs:nodejs /app/public/uploads /app/storage
RUN chown -R nextjs:nodejs /app/prisma

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["npm", "start"]
