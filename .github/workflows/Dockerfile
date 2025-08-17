# Étape 1 : Construction de l'image
FROM node:18-bullseye-slim AS build

# Définir le répertoire de travail
WORKDIR /app

# Copier package.json et package-lock.json
COPY package*.json ./

# Installer les dépendances
RUN npm ci --only=production

# Copier le reste du code source
COPY . .

# Étape 2 : Image finale
FROM node:18-bullseye-slim

# Définir le répertoire de travail
WORKDIR /app

# Copier les dépendances installées depuis l'étape de construction
COPY --from=build /app /app

# Exposer le port utilisé par l'application
EXPOSE 3000

# Commande pour démarrer l'application
CMD ["node", "src/index.js"]
