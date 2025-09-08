# 🏗️ Architecture

Finance4All suit une architecture monorepo avec séparation claire entre frontend et backend :

```
Finance4All/
├── frontend/          # Application Next.js
├── backend/           # API REST Node.js/Express
├── docs/              # Documentation
└── shared/            # Utilitaires partagés
```

## Stack technique

### Frontend
- **Next.js 15** - Framework React
- **TypeScript** - Typage statique
- **Tailwind CSS** - Framework CSS
- **Radix UI** - Composants accessibles
- **React Hook Form** - Gestion des formulaires

### Backend
- **Node.js** - Environnement d'exécution
- **Express** - Framework web
- **TypeScript** - Typage statique
- **Prisma** - ORM et base de données
- **Clerk** - Authentification
- **Winston** - Logging