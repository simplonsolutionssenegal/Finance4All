# Étape 1 : Construction
FROM node:18-alpine AS builder
WORKDIR /app

# Copier seulement les fichiers de dépendances
COPY package*.json ./

# Installer toutes les dépendances nécessaires pour le build
RUN npm install --frozen-lockfile --silent || npm install --silent

# Copier le code source
COPY . .

# Builder l'application
RUN npm run build

# Nettoyer après le build
RUN npm cache clean --force && \
    rm -rf node_modules

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