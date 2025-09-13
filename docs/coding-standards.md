# Standards de code & Convention

- Utiliser **Conventional Commits**
- Respecter les règles **ESLint** et **Prettier**
- Ajouter des **tests** pour les nouvelles fonctionnalités
- Maintenir la **couverture de code** > 80%

## 📦 Variables & constantes

- **camelCase** pour les variables locales et les attributs
- **UPPER_SNAKE_CASE** pour les constantes globales

## 🔧 Fonctions & méthodes

- **camelCase**, nom verbal décrivant l'action.
- Les méthodes booléennes commencent par `is`, `has`, `can`, `should`.

## 🏛️ Classes & Interfaces

PascalCase

## 📂 Fichiers & dossiers

- **kebab-case** (surtout en JS/TS, Node, front).
- Les dossiers reflètent des domaines fonctionnels (/users, /organisations, /modules....)

## 🗃️ Base de données

**camelCase** pour les tables et colonnes.

## 🌿 Hooks Git

Le projet utilise Husky pour les hooks Git :

- **pre-commit** : Linting et formatage
- **pre-push** : Tests unitaires

## 🔗 Git & branches

**kebab-case + préfixe du type de travail** : (ex: feature/add-user-authentication, bugfix/fix-email-validation, hotfix/rollback-migration...)

## 🏷️ Préfixes principaux Git

- **feature/** → pour une nouvelle fonctionnalité
- **bugfix/** → correction d'un bug non critique
- **hotfix/** → correction urgente en production
- **release/** → préparation d'une version (tag + changelog, QA)
- **chore/** → tâches techniques ou non-fonctionnelles
- **refactor/** → restructuration du code sans ajout de feature
- **test/** → ajout ou correction de tests
- **docs/** → documentation uniquement
- **ci/** → intégration continue (pipelines, scripts, workflows)
- **perf/** → optimisation de performance
- **style/** → ajustements de style, indentation, lint, etc.

## 🌳 Convention de nommage des branches

Format général : **<prefix>/<ticket-id>-<id developpeur>-details>** (feature/FN352-MMM-add-user-authentication, style/FN352-MMM-update-dashboard-ui....)

## 😀 Convention de commit avec Gitmoji

Format général : **`<emoji> <scope optional>: <description>`**
