# Étape 1 : Construction
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

# Étape 2 : Exécution
FROM node:18
WORKDIR /app
COPY --from=builder /app ./
EXPOSE 80
CMD ["npm", "run", "start", "--", "-p", "80"]