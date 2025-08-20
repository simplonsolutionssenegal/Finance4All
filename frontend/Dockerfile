# Étape 1 : Construction
FROM node:18 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Étape 2 : Exécution
FROM node:18
WORKDIR /app
COPY --from=builder /app ./
EXPOSE 80
CMD ["npm", "run", "start", "--", "-p", "80"]