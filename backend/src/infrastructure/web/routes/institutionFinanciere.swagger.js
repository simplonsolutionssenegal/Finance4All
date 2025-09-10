/**
 * @swagger
 * tags:
 *   name: Institutions
 *   description: API pour gérer les institutions financières
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     InstitutionFinanciere:
 *       type: object
 *       required:
 *         - nom
 *         - type
 *         - description
 *         - siteWeb
 *         - regionsDesservies
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: ID unique de l'institution (généré automatiquement)
 *         nom:
 *           type: string
 *           description: Nom de l'institution financière
 *         type:
 *           type: string
 *           description: Type d'institution (BANQUE, ASSURANCE, etc.)
 *         description:
 *           type: string
 *           description: Description détaillée de l'institution
 *         siteWeb:
 *           type: string
 *           format: uri
 *           description: URL du site web de l'institution
 *         logo:
 *           type: string
 *           nullable: true
 *           description: URL du logo de l'institution
 *         contactNom:
 *           type: string
 *           nullable: true
 *           description: Nom de la personne de contact
 *         contactEmail:
 *           type: string
 *           format: email
 *           nullable: true
 *           description: Email de contact
 *         contactTelephone:
 *           type: string
 *           nullable: true
 *           description: Numéro de téléphone de contact
 *         regionsDesservies:
 *           type: array
 *           items:
 *             type: string
 *           description: Régions desservies par l'institution
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Date de création (générée automatiquement)
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Date de dernière mise à jour (générée automatiquement)
 *       example:
 *         id: "3fa85f64-5717-4562-b3fc-2c963f66afa6"
 *         nom: "Banque Exemple"
 *         type: "BANQUE"
 *         description: "Une banque pour tous vos besoins financiers"
 *         siteWeb: "https://www.banque-exemple.fr"
 *         logo: "https://www.banque-exemple.fr/logo.png"
 *         contactNom: "Jean Dupont"
 *         contactEmail: "contact@banque-exemple.fr"
 *         contactTelephone: "+33123456789"
 *         regionsDesservies: ["Île-de-France", "Bretagne"]
 *         createdAt: "2023-01-01T12:00:00Z"
 *         updatedAt: "2023-01-01T12:00:00Z"
 *
 *     CreateInstitutionRequest:
 *       type: object
 *       required:
 *         - nom
 *         - type
 *         - description
 *         - siteWeb
 *         - regionsDesservies
 *       properties:
 *         nom:
 *           type: string
 *           description: Nom de l'institution financière
 *         type:
 *           type: string
 *           description: Type d'institution (BANQUE, ASSURANCE, etc.)
 *         description:
 *           type: string
 *           description: Description détaillée de l'institution
 *         siteWeb:
 *           type: string
 *           format: uri
 *           description: URL du site web de l'institution
 *         logo:
 *           type: string
 *           nullable: true
 *           description: URL du logo de l'institution
 *         contactNom:
 *           type: string
 *           nullable: true
 *           description: Nom de la personne de contact
 *         contactEmail:
 *           type: string
 *           format: email
 *           nullable: true
 *           description: Email de contact
 *         contactTelephone:
 *           type: string
 *           nullable: true
 *           description: Numéro de téléphone de contact
 *         regionsDesservies:
 *           type: array
 *           items:
 *             type: string
 *           description: Régions desservies par l'institution
 *
 *     ApiResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           description: Indique si la requête a réussi
 *         message:
 *           type: string
 *           description: Message de réponse
 *         data:
 *           type: object
 *           description: Données de réponse
 *         count:
 *           type: integer
 *           description: Nombre d'éléments dans data (pour les collections)
 *       example:
 *         success: true
 *         message: "Opération réussie"
 *         data: {}
 *         count: 0
 */

/**
 * @swagger
 * /api/v1/institutions:
 *   get:
 *     summary: Récupérer toutes les institutions financières
 *     tags: [Institutions]
 *     responses:
 *       200:
 *         description: Liste des institutions financières
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/InstitutionFinanciere'
 *                     count:
 *                       type: integer
 *                       description: Nombre d'institutions financières
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     success:
 *                       example: false
 *                     message:
 *                       example: "Erreur lors de la récupération des institutions financières"
 *
 * /api/v1/institutions/{id}:
 *   get:
 *     summary: Récupérer une institution financière par son identifiant
 *     tags: [Institutions]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Identifiant unique de l'institution financière
 *     responses:
 *       200:
 *         description: Institution financière trouvée
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/InstitutionFinanciere'
 *       404:
 *         description: Institution financière non trouvée
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     success:
 *                       example: false
 *                     message:
 *                       example: "Institution financière non trouvée"
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     success:
 *                       example: false
 *                     message:
 *                       example: "Erreur lors de la récupération de l'institution financière"
 *
 *   post:
 *     summary: Créer une nouvelle institution financière
 *     tags: [Institutions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateInstitutionRequest'
 *     responses:
 *       201:
 *         description: Institution financière créée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/InstitutionFinanciere'
 *       400:
 *         description: Requête invalide
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     success:
 *                       example: false
 *                     message:
 *                       example: "Données d'entrée invalides"
 *       401:
 *         description: Non autorisé
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     success:
 *                       example: false
 *                     message:
 *                       example: "Authentification requise"
 *       403:
 *         description: Accès interdit
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     success:
 *                       example: false
 *                     message:
 *                       example: "Vous n'avez pas les autorisations nécessaires"
 */
