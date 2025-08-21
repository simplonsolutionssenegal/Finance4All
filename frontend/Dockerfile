# Étape 1 : Construction
FROM node:18-alpine AS builder
WORKDIR /app

# Copier seulement les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances (avec cache pour Docker layers)
RUN npm ci --only=production --silent && \
    npm cache clean --force

# Copier le code source
COPY . .

# Builder l'application
RUN npm run build

# Étape 2 : Image de production avec Nginx
FROM nginx:alpine
WORKDIR /usr/share/nginx/html

# Supprimer les fichiers par défaut de nginx
RUN rm -rf /usr/share/nginx/html/*

# Copier seulement les fichiers buildés
COPY --from=builder /app/dist ./

# Utiliser la configuration nginx par défaut

# Exposer le port 80
EXPOSE 80

# Démarrer nginx
CMD ["nginx", "-g", "daemon off;"]