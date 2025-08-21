# Étape 1 : Construction
FROM node:22-alpine AS builder
WORKDIR /app

# Copier seulement les fichiers de dépendances
COPY package*.json ./

# Installer toutes les dépendances nécessaires pour le build
RUN npm install --frozen-lockfile --silent || npm install --silent

# Copier le code source
COPY . .

# Builder l'application Next.js
RUN npm run build

# Étape 2 : Image de production avec Node.js (Next.js a besoin de Node)
FROM node:22-alpine AS runner
WORKDIR /app

# Copier les fichiers nécessaires de Next.js
COPY --from=builder /app/next.config.* ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json

# Copier les fichiers buildés de Next.js
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Exposer le port 80
EXPOSE 80

# Variables d'environnement
ENV NODE_ENV=production
ENV PORT=80

# Démarrer l'application Next.js
CMD ["node", "server.js"]