# Types et Interfaces - Structure organisée

Ce répertoire contient tous les types et interfaces TypeScript de l'application, organisés selon le **principe de responsabilité unique (SRP)** des principes SOLID.

## Structure

```
types/
├── index.ts          # Point d'entrée unique pour tous les types
├── api.ts           # Types génériques pour les API
├── institutions.ts  # Types spécifiques aux institutions financières
└── forms.ts         # Types pour les formulaires et validations
```

## Principe SOLID appliqué

### Single Responsibility Principle (SRP)
Chaque fichier a une responsabilité unique :
- `api.ts` : Gestion des types d'API génériques
- `institutions.ts` : Types métier pour les institutions
- `forms.ts` : Types pour les formulaires et validations
- `index.ts` : Centralisation des exports

## Usage

### Import recommandé (via index.ts)
```typescript
import type { InstitutionCreatedResponse, ApiResponse } from '@/types';
```

### Import direct (si nécessaire)
```typescript
import type { InstitutionCreatedResponse } from '@/types/institutions';
import type { ApiResponse } from '@/types/api';
```

## Avantages de cette organisation

### ✅ Maintenabilité
- Séparation claire des responsabilités
- Facilite les modifications et évolutions
- Réduction des dépendances circulaires

### ✅ Réutilisabilité
- Types génériques réutilisables (`api.ts`)
- Types métier bien définis (`institutions.ts`)
- Types UI/UX centralisés (`forms.ts`)

### ✅ Lisibilité
- Structure logique et prévisible
- Documentation intégrée dans chaque fichier
- Imports centralisés via `index.ts`

### ✅ Type Safety
- Définitions strictes et cohérentes
- IntelliSense amélioré
- Détection d'erreurs à la compilation

## Bonnes pratiques

1. **Ajouter de nouveaux types** :
   - Créer dans le fichier approprié selon la responsabilité
   - Exporter via `index.ts` si usage général
   - Documenter avec des commentaires JSDoc

2. **Éviter** :
   - Types dupliqués entre fichiers
   - Types trop génériques ou trop spécifiques
   - Dépendances circulaires

3. **Nommage** :
   - Interfaces : `PascalCase` (ex: `InstitutionCreatedResponse`)
   - Types union : `PascalCase` (ex: `FormFieldStatus`)
   - Génériques : `<T>`, `<K>`, etc.

## Migration depuis l'ancienne structure

Les types ont été déplacés depuis :
- `lib/api/institutions.ts` → `types/institutions.ts`
- Types inline → `types/api.ts` et `types/forms.ts`

Tous les imports ont été mis à jour automatiquement.