# Finance4All

> Plateforme d'inclusion financière pour démocratiser l'accès aux services financiers

[![Build Status](https://github.com/simplonsolutionssenegal/Finance4All/actions/workflows/ci.yml/badge.svg)](https://github.com/simplonsolutionssenegal/Finance4All/actions)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=simplonsolutionssenegal_finance4all&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=simplonsolutionssenegal_finance4all)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=simplonsolutionssenegal_finance4all&metric=coverage)](https://sonarcloud.io/summary/new_code?id=simplonsolutionssenegal_finance4all)

## 📋 Table des matières

- [À propos](#-à-propos)
- [Fonctionnalités](#-fonctionnalités)
- [Architecture](#-architecture)
- [Prérequis](#-prérequis)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Développement](#-développement)
- [Tests](#-tests)
- [Déploiement](#-déploiement)
- [API](#-api)
- [Licence](#-licence)

## 🎯 À propos

Finance4All est une plateforme innovante d'inclusion financière conçue pour démocratiser l'accès aux services financiers. Notre mission est de fournir des outils financiers accessibles, sécurisés et adaptés aux besoins de tous.

### Objectifs principaux
- 📈 Faciliter l'accès aux services financiers
- 🔐 Garantir la sécurité des transactions
- 📱 Offrir une expérience utilisateur intuitive
- 🌍 Promouvoir l'inclusion financière

## ✨ Fonctionnalités

- **Gestion des comptes utilisateurs**
- **Simulateur**
- **Comparateur**
- **Formation**

## 🏗️ Architecture

Finance4All suit une architecture monorepo avec séparation claire entre frontend et backend :

```
Finance4All/
├── frontend/          # Application Next.js
├── backend/           # API REST Node.js/Express
├── docs/              # Documentation
└── shared/            # Utilitaires partagés
```

### Stack technique

#### Frontend
- **Next.js 15** - Framework React
- **TypeScript** - Typage statique
- **Tailwind CSS** - Framework CSS
- **Radix UI** - Composants accessibles
- **React Hook Form** - Gestion des formulaires

#### Backend
- **Node.js** - Environnement d'exécution
- **Express** - Framework web
- **TypeScript** - Typage statique
- **Prisma** - ORM et base de données
- **Clerk** - Authentification
- **Winston** - Logging

## 📋 Prérequis

- Node.js >= 18.0.0
- npm
- Base de données PostgreSQL (principalement)
- Git

## 🚀 Installation

### 1. Cloner le repository
```bash
git clone https://github.com/simplonsolutionssenegal/Finance4All.git
cd Finance4All
```

### 2. Installer les dépendances
```bash
# Installation globale
npm install

# Installation backend
cd backend
npm install

# Installation frontend
cd frontend
npm install
```

### 3. Configuration de l'environnement
```bash
# Copier les fichiers d'environnement
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

## ⚙️ Configuration

### Backend (.env)
```env
# Base de données
DATABASE_URL="postgresql://username:password@localhost:5432/finance4all"

# CLERK
CLERK_PUBLISHABLE_KEY="votre-secret-clerk"
CLERK_SECRET_KEY="7d"

# Application
PORT=3001
NODE_ENV="development"
```

### Frontend (.env.local)
```env
# API Backend
NEXT_PUBLIC_API_URL="http://localhost:3001"

# NextAuth
NEXTAUTH_SECRET="votre-secret-nextauth"
NEXTAUTH_URL="http://localhost:3000"

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=votre-public-key-clerk
CLERK_SECRET_KEY=votre-secret-key-clerk
```

## 💻 Développement

### Démarrage des serveurs de développement

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

### Scripts disponibles

#### Backend
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

#### Frontend
```bash
npm run dev          # Serveur de développement
npm run build        # Build production
npm run start        # Démarrage production
npm run test         # Tests unitaires
npm run lint         # Linting
npm run type-check   # Vérification TypeScript
```

## 🧪 Tests

### Backend
```bash
cd backend
npm run test                # Tests unitaires
npm run test:watch         # Tests en mode watch
npm run test:coverage      # Tests avec couverture
```

### Frontend
```bash
cd frontend
npm run test                # Tests unitaires
npm run test:watch         # Tests en mode watch
npm run test:coverage      # Tests avec couverture
```

### Couverture de code
Les rapports de couverture sont générés dans le dossier `coverage/` et intégrés à SonarCloud pour l'analyse qualité.

## 🚀 Déploiement

### Production locale
```bash
# Build des applications
npm run build:all

# Démarrage production
npm run start:prod
```

### Variables d'environnement production
Les variables d'environnement en production sont automatiquement mis en place 
lors du deploy en production

## 📖 API
La documentation complète de l'API est générée par **OpenAPI**.

## Standards de code & Convention
- Utiliser **Conventional Commits**
- Respecter les règles **ESLint** et **Prettier**
- Ajouter des **tests** pour les nouvelles fonctionnalités
- Maintenir la **couverture de code** > 80%

### 📦 Variables & constantes
- **camelCase** pour les variables locales et les attributs 
- **UPPER_SNAKE_CASE** pour les constantes globales

### 🔧 Fonctions & méthodes
- **camelCase**, nom verbal décrivant l'action.
- Les méthodes booléennes commencent par `is`, `has`, `can`, `should`.

### 🏛️ Classes & Interfaces
PascalCase

### 📂 Fichiers & dossiers
- **kebab-case** (surtout en JS/TS, Node, front).
- Les dossiers reflètent des domaines fonctionnels (/users, /organisations, /modules....)

### 🗃️ Base de données
**camelCase** pour les tables et colonnes.

## 🌿 Hooks Git
Le projet utilise Husky pour les hooks Git :
- **pre-commit** : Linting et formatage
- **pre-push** : Tests unitaires

### 🔗 Git & branches
**kebab-case + préfixe du type de travail** : (ex: feature/add-user-authentication, bugfix/fix-email-validation, hotfix/rollback-migration...)

### 🏷️ Préfixes principaux Git
- **feature/** → pour une nouvelle fonctionnalité
- **bugfix/** → correction d’un bug non critique
- **hotfix/** → correction urgente en production
- **release/** → préparation d’une version (tag + changelog, QA)
- **chore/** → tâches techniques ou non-fonctionnelles
- **refactor/** → restructuration du code sans ajout de feature
- **test/** → ajout ou correction de tests
- **docs/** → documentation uniquement
- **ci/** → intégration continue (pipelines, scripts, workflows)
- **perf/** → optimisation de performance
- **style/** → ajustements de style, indentation, lint, etc.

### 🌳 Convention de nommage des branches
Format général : **<prefix>/<ticket-id>-<id developpeur>-details>** (feature/FN352-MMM-add-user-authentication, style/FN352-MMM-update-dashboard-ui....)

### 😀 Convention de commit avec Gitmoji
Format général : **<emoji> <scope optional>: <description>**

## 📄 Licence

Ce projet est sous licence MIT. 

## 📞 Contact

- **Équipe** : Simplon Solutions Sénégal
- **GitHub** : [@simplonsolutionssenegal](https://github.com/simplonsolutionssenegal)

---

<p>
  Développé avec ❤️ par l'équipe Simplon Solutions Sénégal
</p>