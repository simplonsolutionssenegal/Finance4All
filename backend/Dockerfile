# Utiliser l'image Node.js officielle avec Alpine pour réduire la taille
FROM node:22-alpine AS base

# Installer les dépendances système nécessaires et créer l'utilisateur non-root
RUN apk add --no-cache \
    libc6-compat \
    dumb-init \
    && addgroup -g 1001 -S nodejs \
    && adduser -S nodejs -u 1001

WORKDIR /app

# Étape de build des dépendances de production uniquement
FROM base AS deps
COPY package.json ./
RUN npm install --omit=dev && \
    npm cache clean --force

# Étape de build de l'application
FROM base AS builder
COPY package.json ./
RUN npm install

# Copier seulement les fichiers nécessaires pour le build
COPY src ./src
COPY prisma ./prisma
COPY tsconfig.json ./

# Générer le client Prisma et compiler TypeScript
RUN npx prisma generate && \
    npm run build && \
    npm prune --production

# Étape de production finale
FROM node:22-alpine AS runner

# Installer dumb-init pour une meilleure gestion des signaux
RUN apk add --no-cache dumb-init && \
    addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

WORKDIR /app

# Variables d'environnement optimisées
ENV NODE_ENV=production \
    NODE_OPTIONS="--enable-source-maps --max-old-space-size=512" \
    PORT=5000 \
    NPM_CONFIG_CACHE=/tmp/.npm

# Copier les fichiers de production avec les bonnes permissions
COPY --from=deps --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nodejs:nodejs /app/package.json ./package.json

# Générer le client Prisma, créer les dossiers et configurer les permissions
RUN mkdir -p logs /tmp && \
    chown -R nodejs:nodejs /app /tmp && \
    npm cache clean --force && \
    rm -rf /tmp/.npm

# Passer à l'utilisateur non-root
USER nodejs

# Exposer le port
EXPOSE 5000

# Healthcheck pour vérifier que l'application fonctionne
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:5000/health', (r) => r.statusCode === 200 ? process.exit(0) : process.exit(1))"

# Utiliser dumb-init pour une meilleure gestion des signaux
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/index.js"]