# Stage 1: Dependencies
FROM node:20-alpine AS deps
WORKDIR /app

# Copy package files and source (includes prisma schema)
# because postinstall runs prisma generate
COPY package*.json ./
COPY src ./src/

# Install production dependencies
RUN npm install --production --no-package-lock

# Stage 2: Builder
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package files
COPY package*.json ./

# Copy source code (includes prisma schema)
COPY src ./src/

# Install all dependencies (including dev dependencies for build)
RUN npm install --no-package-lock

# Copy remaining source files
COPY . ./

# Build TypeScript
RUN npm run build

# Stage 3: Runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nodejs

# Copy built application
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/src/infrastructure/config/schema.prisma ./src/infrastructure/config/schema.prisma
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./

USER nodejs

EXPOSE 3001

# Health check endpoint
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

CMD ["node", "dist/main.js"]