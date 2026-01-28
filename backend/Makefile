.PHONY: help dev-up dev-up-all dev-up-tools dev-down dev-logs dev-ps dev-build setup db-migrate db-push db-studio clean

# Default target
help:
	@echo "Finance4All Backend - Commandes de développement"
	@echo ""
	@echo "Infrastructure Docker:"
	@echo "  make dev-up        - Démarrer les services (PostgreSQL, Redis, MinIO)"
	@echo "  make dev-up-all    - Démarrer TOUT (services + backend avec FFmpeg)"
	@echo "  make dev-up-tools  - Démarrer avec outils GUI (pgAdmin, Redis Commander)"
	@echo "  make dev-build     - Rebuild l'image Docker du backend"
	@echo "  make dev-down      - Arrêter tous les services"
	@echo "  make dev-logs      - Afficher les logs des services"
	@echo "  make dev-ps        - Afficher l'état des services"
	@echo "  make clean         - Supprimer les volumes Docker (reset complet)"
	@echo ""
	@echo "Base de données:"
	@echo "  make db-migrate    - Appliquer les migrations Prisma"
	@echo "  make db-push       - Pousser le schema vers la DB (dev)"
	@echo "  make db-studio     - Ouvrir Prisma Studio"
	@echo ""
	@echo "Setup:"
	@echo "  make setup         - Setup complet (infra Docker seulement)"
	@echo "  make setup-full    - Setup complet avec backend dockerisé"
	@echo ""
	@echo "Modes de développement:"
	@echo "  1. LOCAL:  make dev-up   + npm run dev (FFmpeg requis localement)"
	@echo "  2. DOCKER: make dev-up-all (FFmpeg inclus dans Docker)"
	@echo ""
	@echo "URLs utiles:"
	@echo "  - API Backend:     http://localhost:5000"
	@echo "  - Swagger UI:      http://localhost:5000/api-docs"
	@echo "  - MinIO Console:   http://localhost:9001 (minioadmin/minioadmin)"
	@echo "  - pgAdmin:         http://localhost:5050 (admin@finance4all.com/admin)"
	@echo "  - Redis Commander: http://localhost:8081"

# ============ Docker Commands ============

# Démarrer les services de base (sans le backend)
dev-up:
	@echo "🚀 Démarrage des services de développement..."
	docker compose -f docker-compose.dev.yml up -d postgres redis minio minio-init
	@echo ""
	@echo "✅ Services démarrés!"
	@echo "   - PostgreSQL: localhost:5432"
	@echo "   - Redis:      localhost:6379"
	@echo "   - MinIO API:  localhost:9000"
	@echo "   - MinIO UI:   localhost:9001"
	@echo ""
	@echo "💡 Lancez le backend avec: npm run dev"

# Démarrer TOUT (services + backend dockerisé avec FFmpeg)
dev-up-all:
	@echo "🚀 Démarrage de l'environnement complet (avec FFmpeg)..."
	docker compose -f docker-compose.dev.yml --profile backend up -d
	@echo ""
	@echo "✅ Environnement complet démarré!"
	@echo "   - Backend:    http://localhost:5000 (avec FFmpeg)"
	@echo "   - PostgreSQL: localhost:5432"
	@echo "   - Redis:      localhost:6379"
	@echo "   - MinIO:      localhost:9000"

# Rebuild l'image Docker du backend
dev-build:
	@echo "🔨 Rebuild de l'image Docker du backend..."
	docker compose -f docker-compose.dev.yml build backend
	@echo "✅ Image reconstruite"

# Démarrer avec les outils GUI
dev-up-tools:
	@echo "🚀 Démarrage des services avec outils GUI..."
	docker compose -f docker-compose.dev.yml --profile tools up -d
	@echo ""
	@echo "✅ Services démarrés!"
	@echo "   - pgAdmin:         http://localhost:5050"
	@echo "   - Redis Commander: http://localhost:8081"

# Arrêter les services
dev-down:
	@echo "🛑 Arrêt des services..."
	docker compose -f docker-compose.dev.yml --profile tools --profile backend down
	@echo "✅ Services arrêtés"

# Afficher les logs
dev-logs:
	docker compose -f docker-compose.dev.yml logs -f

# Logs du backend uniquement
dev-logs-backend:
	docker compose -f docker-compose.dev.yml logs -f backend

# Afficher l'état des services
dev-ps:
	docker compose -f docker-compose.dev.yml --profile backend --profile tools ps -a

# Supprimer les volumes (reset complet)
clean:
	@echo "⚠️  Suppression de toutes les données..."
	docker compose -f docker-compose.dev.yml --profile tools --profile backend down -v --rmi local
	@echo "✅ Volumes et images supprimés"

# ============ Database Commands ============

# Appliquer les migrations
db-migrate:
	@echo "📦 Application des migrations..."
	npx prisma migrate dev

# Pousser le schema (sans créer de migration)
db-push:
	@echo "📦 Push du schema vers la base de données..."
	npx prisma db push

# Ouvrir Prisma Studio
db-studio:
	@echo "🔍 Ouverture de Prisma Studio..."
	npx prisma studio

# ============ Setup ============

# Setup pour développement LOCAL (npm run dev)
setup:
	@echo "🔧 Setup de l'environnement de développement (mode local)..."
	@echo ""
	@echo "1️⃣  Installation des dépendances..."
	npm install
	@echo ""
	@echo "2️⃣  Copie du fichier .env..."
	@if [ ! -f .env ]; then cp .env.example .env; echo "   ✅ .env créé depuis .env.example"; else echo "   ⚠️  .env existe déjà"; fi
	@echo ""
	@echo "3️⃣  Démarrage des services Docker..."
	docker compose -f docker-compose.dev.yml up -d postgres redis minio minio-init
	@echo ""
	@echo "4️⃣  Attente que PostgreSQL soit prêt..."
	@sleep 5
	@echo ""
	@echo "5️⃣  Génération du client Prisma..."
	npx prisma generate
	@echo ""
	@echo "6️⃣  Application du schema..."
	npx prisma db push
	@echo ""
	@echo "✅ Setup terminé!"
	@echo ""
	@echo "Pour démarrer le serveur: npm run dev"
	@echo ""
	@echo "⚠️  Note: FFmpeg doit être installé localement pour le transcodage"
	@echo "   - macOS: brew install ffmpeg"
	@echo "   - Ubuntu: sudo apt install ffmpeg"

# Setup pour développement DOCKERISÉ (avec FFmpeg inclus)
setup-full:
	@echo "🔧 Setup de l'environnement de développement (mode Docker complet)..."
	@echo ""
	@echo "1️⃣  Copie du fichier .env..."
	@if [ ! -f .env ]; then cp .env.example .env; echo "   ✅ .env créé depuis .env.example"; else echo "   ⚠️  .env existe déjà"; fi
	@echo ""
	@echo "2️⃣  Build de l'image Docker..."
	docker compose -f docker-compose.dev.yml build backend
	@echo ""
	@echo "3️⃣  Démarrage de tous les services..."
	docker compose -f docker-compose.dev.yml --profile backend up -d
	@echo ""
	@echo "4️⃣  Attente que les services soient prêts..."
	@sleep 10
	@echo ""
	@echo "5️⃣  Application du schema Prisma..."
	docker compose -f docker-compose.dev.yml exec backend npx prisma db push
	@echo ""
	@echo "✅ Setup terminé!"
	@echo ""
	@echo "Backend disponible sur: http://localhost:5000"
	@echo "Swagger UI: http://localhost:5000/api-docs"
