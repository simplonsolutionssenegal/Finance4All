# Stage 1: Dependencies
FROM node:20-alpine AS deps
WORKDIR /app

# Copy package files first
COPY package*.json ./

# Copy prisma schema BEFORE npm install (postinstall needs it)
COPY src/infrastructure/config/schema.prisma ./src/infrastructure/config/schema.prisma

# Copy rest of src
COPY src ./src/

# Install production dependencies
RUN npm install --production --no-package-lock

# Stage 2: Builder
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Copy source files (includes prisma schema)
COPY src ./src/

# Install all dependencies (including dev dependencies for build)
RUN npm install --no-package-lock

# Build TypeScript
RUN npm run build

# Stage 3: Runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Install wget for healthcheck
RUN apk add --no-cache wget

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nodejs

# Copy built application
COPY --from=deps --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/src/infrastructure/config/schema.prisma ./src/infrastructure/config/schema.prisma
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/package*.json ./

# Create logs directory with proper permissions
RUN mkdir -p logs && chown -R nodejs:nodejs logs

USER nodejs

EXPOSE 3001

# Health check endpoint
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3001/health || exit 1

CMD ["node", "dist/main.js"]