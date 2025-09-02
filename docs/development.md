# 💻 Développement

## Démarrage des serveurs de développement

```bash
# Lancement global
npm run dev

# Terminal 1 - Backend
npm run dev:backend
## ou
cd backend
npm run dev

# Terminal 2 - Frontend
npm run dev:frontend
## ou
cd frontend
npm run dev
```

## Scripts disponibles

### Backend
```bash
npm run dev          # Serveur de développement
npm run build        # Build production
npm run start        # Démarrage production
npm run test         # Tests unitaires
npm run test:watch   # Tests en mode watch
npm run lint         # Linting
npm run db:migrate   # Migrations DB
npm run db:generate  # Génération Prisma
```

### Frontend
```bash
npm run dev          # Serveur de développement
npm run build        # Build production
npm run start        # Démarrage production
npm run test         # Tests unitaires
npm run lint         # Linting
npm run type-check   # Vérification TypeScript
```