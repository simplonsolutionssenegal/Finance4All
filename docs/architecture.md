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

## Modèle de Domaine

### InstitutionFinanciere & ContactPerson

Le domaine introduit maintenant une entité/objet valeur `ContactPerson` (fichier: `backend/src/domain/entities/ContactPerson.ts`) pour représenter la personne de contact d'une institution financière. L'entité `InstitutionFinanciere` référence cette personne via la propriété optionnelle `contact`.

#### État transitoire de persistance

Dans la base actuelle, les colonnes restent à plat : `contactNom`, `contactEmail`, `contactTelephone`. Le repository Prisma (`PrismaInstitutionFinanciereRepository`) mappe ces champs vers l'objet imbriqué `contact` à la remontée, et fait l'opération inverse lors des écritures. Ceci permet :

1. D'améliorer la clarté du domaine et le respect du SRP.
2. De ne pas casser le schéma existant ni les migrations passées.
3. De préparer une future normalisation si nécessaire.

#### Étapes futures possibles (normalisation relationnelle)

1. Créer un modèle `ContactPerson` dédié dans Prisma avec relation 1:1 (clé étrangère dans `InstitutionFinanciere` ou inverse selon préférence d'ownership).
2. Générer une migration et script de backfill transférant les données des colonnes à plat vers la nouvelle table.
3. Supprimer les colonnes à plat après validation et mettre à jour le repository pour utiliser `include` sur la relation.
4. Ajouter des tests d'intégration couvrant chargement relationnel, suppression et cas d'incohérence.

#### Considérations

- La mise en place d'une table séparée n'apporte une vraie valeur que si la personne de contact devient réutilisable, versionnée ou auditée séparément.
- Tant que le besoin n'est pas avéré, le mapping en mémoire minimise la complexité tout en gardant une porte ouverte.

#### Validation & Tests

Les tests unitaires et d'intégration ont été ajustés pour vérifier que `contact` est bien un objet imbriqué et que la transformation repository <-> domaine fonctionne (voir `prismaInstitutionFinanciereRepository.test.ts`).