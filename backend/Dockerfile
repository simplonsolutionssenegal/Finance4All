# Utiliser Node.js 18 Alpine pour une image légère
FROM node:18-alpine AS base

# Installer les dépendances système nécessaires
RUN apk add --no-cache libc6-compat

# Définir le répertoire de travail
WORKDIR /app

# Arguments de build pour les variables d'environnement
ARG DATABASE_URL
ARG CLERK_PUBLISHABLE_KEY
ARG CLERK_SECRET_KEY
ARG CLERK_WEBHOOK_SECRET
ARG FRONTEND_URL
ARG GMAIL_USER
ARG GMAIL_APP_PASSWORD
ARG FROM_EMAIL
ARG FROM_NAME

# Définir les variables d'environnement pour le build
ENV DATABASE_URL=$DATABASE_URL
ENV CLERK_PUBLISHABLE_KEY=$CLERK_PUBLISHABLE_KEY
ENV CLERK_SECRET_KEY=$CLERK_SECRET_KEY
ENV CLERK_WEBHOOK_SECRET=$CLERK_WEBHOOK_SECRET
ENV FRONTEND_URL=$FRONTEND_URL
ENV GMAIL_USER=$GMAIL_USER
ENV GMAIL_APP_PASSWORD=$GMAIL_APP_PASSWORD
ENV FROM_EMAIL=$FROM_EMAIL
ENV FROM_NAME=$FROM_NAME

# Définir les variables d'environnement par défaut
ENV PORT=5000
ENV API_VERSION=v1

# Copier les fichiers de configuration de package
COPY package*.json ./

# Étape de construction des dépendances
FROM base AS deps

# Installer toutes les dépendances (dev + prod)
RUN npm install

# Étape de construction de l'application
FROM base AS builder

# Copier les dépendances depuis l'étape précédente
COPY --from=deps /app/node_modules ./node_modules

# Copier le code source
COPY . .

# Générer le client Prisma
RUN npx prisma generate

# Construire l'application TypeScript
RUN npm run build

# Étape de production
FROM base AS runner

# Créer un utilisateur non-root pour la sécurité
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodejs

# Définir l'environnement de production
ENV NODE_ENV=production

# Copier seulement les dépendances de production
COPY --from=deps /app/node_modules ./node_modules

# Copier les fichiers construits
COPY --from=builder /app/dist ./dist

# Créer la structure de répertoires et copier le fichier de schéma Prisma
RUN mkdir -p ./src/infrastructure/config
COPY --from=builder /app/src/infrastructure/config/schema.prisma ./src/infrastructure/config/schema.prisma

# Copier le package.json pour les scripts
COPY package*.json ./

# Changer les permissions pour l'utilisateur nodejs
RUN chown -R nodejs:nodejs /app
USER nodejs

# Exposer le port
EXPOSE 5000

# Commande de démarrage avec migration Prisma
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]