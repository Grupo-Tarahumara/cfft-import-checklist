# syntax=docker.io/docker/dockerfile:1

# =========================
# Dockerfile Multi-Entorno (Development + Production)
# =========================
# Soporta dos modos:
# - DEVELOPMENT: npm run dev con hot-reload (Docker Compose local)
# - PRODUCTION: build optimizado con standalone output (Coolify)

FROM node:20-alpine AS base

# Instalar dependencias básicas
RUN apk add --no-cache libc6-compat

WORKDIR /app

# =========================
# 1. Dependencias
# =========================
FROM base AS deps

COPY package.json ./

# SIEMPRE instalar TODAS las dependencias (incluyendo devDependencies)
# Next.js requiere devDependencies para compilar (TypeScript, etc.)
# El stage de producción final solo copiará el build, no las dependencias
# Usando npm install en lugar de npm ci para evitar problemas con package-lock.json
RUN echo "📦 Installing ALL dependencies for build..." && \
    npm install --legacy-peer-deps

# =========================
# 2. Builder (solo para producción)
# =========================
FROM base AS builder
WORKDIR /app

# Copiar dependencias instaladas
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Limpiar build anterior
RUN rm -rf .next

# SIEMPRE hacer build para el stage de producción
# Forzar NODE_ENV=production durante el build, independientemente de los build args
# Esto asegura que Next.js compile correctamente incluso si Coolify pasa NODE_ENV=development
RUN echo "🏗️  Building Next.js for production..." && \
    NODE_ENV=production npm run build

# =========================
# 3. Development Runner
# =========================
FROM base AS development
WORKDIR /app

ENV NODE_ENV=development
ENV HOSTNAME="0.0.0.0"
ENV PORT=3000

# Copiar dependencias completas (con devDependencies)
COPY --from=deps /app/node_modules ./node_modules
COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]

# =========================
# 4. Production Runner
# =========================
FROM base AS production
WORKDIR /app

ENV NODE_ENV=production
ENV HOSTNAME="0.0.0.0"
ENV PORT=3000

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copiar archivos necesarios desde el builder
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]

# =========================
# 5. Target por defecto
# =========================
# Por defecto usa production (para Coolify)
# Para development, especificar --target development
FROM production AS final
