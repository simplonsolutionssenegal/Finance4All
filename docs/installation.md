# 🚀 Installation

## 📋 Prérequis

- Node.js >= 18.0.0
- npm
- Base de données PostgreSQL (principalement)
- Git

## Installation

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