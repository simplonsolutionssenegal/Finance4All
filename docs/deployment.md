# 🚀 Déploiement

## Production locale
```bash
# Build des applications
npm run build:all

# Démarrage production
npm run start:prod
```

## Variables d'environnement production
Les variables d'environnement en production sont automatiquement mis en place lors du deploy en production

# 🚀 Pipeline CI/CD

Ce document décrit l'utilisation du CI/CD via Github Actions (GHA) avec plusieurs workflows déclenchés de différentes manières et utilisant divers fichiers de workflow, qui sont expliqués en détail ci-dessous.

### Contexte
Pour rationaliser notre processus de développement, améliorer l'efficacité du déploiement et maintenir des logiciels de haute qualité, nous avons décidé d'utiliser GitHub Actions pour notre pipeline CI/CD. Cette configuration nous permet d'automatiser les processus de build, d'exécuter les tests et de déployer les applications dans des environnements spécifiques. Nous utilisons différents workflows pour gérer les déploiements à travers diverses étapes, et ce document détaille les workflows clés de notre projet : le workflow cd-previews, le workflow cd-integration, le workflow clean, le workflow ci, le workflow release, et le workflow deploy.

### Workflow CD-Previews
Le workflow cd-previews est l'un des workflows principaux que nous utilisons dans notre pipeline CI/CD. Il sert de mécanisme pour déployer des versions de prévisualisation de l'application, permettant aux développeurs et aux reviewers de valider les changements avant qu'ils ne soient fusionnés dans la base de code principale.

**Déclencheur du Workflow**
- **Méthode de déclenchement** : Ce workflow est déclenché par un commentaire sur une pull request.
- **Commande de déclenchement** : Le commentaire doit contenir la phrase : `/preview`

**Configuration du Workflow**
- **Fichier du workflow** : Le workflow est défini dans `github/workflows/cd-previews.yml` et appelle le fichier de release Helm `cd/previews.yaml`, qui est responsable du déploiement de l'application sur Kind (cluster local dev/k8s-dev/dev).
- **Actions effectuées** : Le workflow effectue les actions suivantes :
  - Build de l'application : Le workflow compile le code source du projet et s'assure qu'aucun problème de compilation n'est présent.
  - Exécution des tests : Il exécute la suite complète de tests automatisés pour vérifier l'intégrité des modifications du code.
  - Déploiement vers l'environnement de prévisualisation : Après le build et les tests, le workflow déploie l'application vers un environnement de prévisualisation dans un cluster Kind (dev/k8s-dev/dev).

**Sortie du Workflow**
- **Lien de déploiement** : Après un déploiement réussi, un lien vers l'application de prévisualisation nouvellement déployée est fourni dans les commentaires de la pull request. Cela permet aux développeurs et aux reviewers d'accéder facilement à la version en cours d'exécution pour révision.
- **Informations supplémentaires** : Les commentaires de la pull request incluent également des liens vers les tableaux de bord Actuator et Grafana, fournissant des informations supplémentaires sur la santé et les métriques de l'application déployée.
- **Gestion des ressources** : Le déploiement d'environnements de prévisualisation peut consommer des ressources supplémentaires dans le cluster Kind, particulièrement lorsque plusieurs pull requests sont ouvertes simultanément.

### Workflow CD-Integration
Le workflow cd-integration est responsable de s'assurer que la dernière version de l'application est continuellement intégrée et déployée vers l'environnement d'intégration, permettant à l'équipe de valider les changements sur une configuration stable.

**Déclencheur du Workflow**
- **Méthode de déclenchement** : Ce workflow est déclenché par un événement de push vers la branche main.

**Configuration du Workflow**
- **Fichier du workflow** : Le workflow est défini dans `github/workflows/cd-integration.yml` et appelle le fichier de release Helm `cd/integration.yaml`, qui est responsable du déploiement de l'application sur Kind (cluster local dev/k8s-dev/dev).
- **Actions effectuées** : Le workflow effectue les actions suivantes :
  - Build de l'application : Le workflow compile le code source du projet et s'assure qu'aucun problème de compilation n'est présent.
  - Exécution des tests : Il exécute la suite complète de tests automatisés pour s'assurer que les modifications du code sont stables.
  - Déploiement vers l'environnement d'intégration : Déploie l'application vers l'environnement d'intégration, qui est un cluster Kind (dev/k8s-dev/dev), et les pods sont nommés afisoft-integration.

**Sortie du Workflow**
- **Lien de déploiement** : Après un déploiement réussi, un lien vers l'application nouvellement déployée est disponible, fournissant à l'équipe un moyen de vérifier les changements dans l'environnement d'intégration.
- **Informations supplémentaires** : Le workflow fournit également des liens vers les tableaux de bord Actuator et Grafana dans les commentaires de déploiement, offrant des informations sur la santé et les métriques de l'application en cours d'exécution.

### Workflow Clean
Le workflow clean est responsable du nettoyage des environnements de prévisualisation après qu'ils ne soient plus nécessaires.

**Déclencheur du Workflow**
- **Méthode de déclenchement** : Ce workflow est déclenché par la fermeture d'une pull request.

**Configuration du Workflow**
- **Fichier du workflow** : Le workflow est défini dans `.github/workflows/clean.yml`.
- **Actions effectuées** : Le workflow effectue les actions suivantes :
  - Suppression du fichier de configuration : Supprime le fichier de configuration du repository k8s-preview.
  - Suppression du namespace Kubernetes : Supprime le namespace correspondant du cluster Kind pour libérer les ressources.

**Sortie du Workflow**
- **Nettoyage de l'environnement** : S'assure que l'environnement de prévisualisation et les ressources associées sont correctement nettoyés, libérant les ressources du cluster Kind.

### Workflow CI
Le workflow ci est responsable du build de l'application et de l'exécution des tests pour assurer la stabilité de la base de code.

**Déclencheur du Workflow**
- **Méthode de déclenchement** : Ce workflow est déclenché par un événement de pull request (soit l'ouverture d'une pull request soit sa modification) ou par un push vers la branche main.

**Configuration du Workflow**
- **Fichier du workflow** : Le workflow est défini dans `.github/workflows/ci.yml`.
- **Actions effectuées** : Le workflow effectue les actions suivantes :
  - Build de l'application : Compile le code source du projet pour s'assurer que tout est à jour et qu'aucun problème de compilation n'est présent.
  - Exécution des tests : Exécute la suite complète de tests automatisés pour s'assurer que les modifications du code sont stables et respectent les standards de qualité.

**Sortie du Workflow**
- **Retour de validation** : Fournit un retour sur les résultats du build et des tests directement dans la pull request ou le statut du commit, aidant les développeurs à résoudre tout problème avant que le code ne soit fusionné.

### Workflow Release
Le workflow release est responsable de la création d'une nouvelle release de l'application, s'assurant que les processus de versioning et de déploiement sont suivis correctement.

**Déclencheur du Workflow**
- **Méthode de déclenchement** : Ce workflow est déclenché manuellement depuis l'interface GitHub Actions dans l'onglet Actions.

**Configuration du Workflow**
- **Fichier du workflow** : Le workflow est défini dans `.github/workflows/release.yml`.
- **Actions effectuées** : Le workflow effectue les actions suivantes :
  - Création d'une release : Publie une nouvelle version de l'application.
  - Création de tag : Crée un tag dans le repository pour la nouvelle version.
  - Publication des artefacts vers Nexus : Publie les images Docker du projet vers le registre Nexus hébergé sur notre serveur.
  - Création d'une pull request : Crée une pull request pour augmenter la version du projet dans le repository.

**Sortie du Workflow**
- **Tag de release** : Un nouveau tag de release est créé dans le repository, représentant la nouvelle version de l'application.
- **Artefacts publiés** : Les artefacts sont publiés vers le registre Nexus
- **PR de mise à jour de version** : Une pull request est créée pour mettre à jour la version du projet, assurant la cohérence des versions.

### Workflow Deploy
Le workflow deploy est responsable du déploiement de l'application vers les environnements UAT, prep, ou production.

**Déclencheur du Workflow**
- **Méthode de déclenchement** : Ce workflow est déclenché manuellement depuis l'interface GitHub Actions dans l'onglet Actions.

**Configuration du Workflow**
- **Fichier du workflow** : Le workflow est défini dans `.github/workflows/deploy.yml`.
- **Actions effectuées** : Le workflow effectue les actions suivantes :
  - Sélection de l'environnement : L'utilisateur sélectionne l'environnement cible (UAT, prep, ou prod) depuis un menu déroulant dans l'interface GitHub Actions.
  - Sélection de la version : L'utilisateur sélectionne la version de l'application à déployer en choisissant le tag d'image approprié depuis un menu déroulant.
  - Déploiement de l'application : Déploie la version sélectionnée de l'application vers l'environnement choisi.

**Sortie du Workflow**
- **Statut de déploiement** : Fournit des mises à jour de statut et des notifications concernant le succès ou l'échec du processus de déploiement.