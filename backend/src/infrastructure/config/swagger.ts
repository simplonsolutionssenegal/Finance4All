import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import type { Express } from 'express';
import { logger } from '@/utils/logger';

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Finance4All API',
      version: process.env.API_VERSION ?? '1.0.0',
      description: 'API de documentation pour le projet Finance4All',
      license: {
        name: 'MIT',
      },
      contact: {
        name: 'Équipe Finance4All',
        url: 'https://finance4all.example.com',
        email: 'contact@finance4all.example.com',
      },
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT ?? 5000}/api/${process.env.API_VERSION ?? 'v1'}`,
        description: 'Serveur de développement',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
    tags: [
      {
        name: 'Users',
        description: 'Endpoints pour la gestion des utilisateurs',
      },
      {
        name: 'Institutions',
        description: 'Endpoints pour la gestion des institutions financières',
      },
    ],
  },
  // Chemins vers les fichiers contenant les annotations Swagger JSDoc
  apis: [
    './src/infrastructure/web/routes/*.swagger.js',
    './src/infrastructure/web/routes/*.routes.ts',
  ],
};

const swaggerSpec = swaggerJSDoc(options);

export const setupSwagger = (app: Express): void => {
  // Route pour la documentation Swagger UI
  app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      explorer: true,
      customCss: '.swagger-ui .topbar { display: none }',
    }),
  );

  // Route pour le fichier JSON Swagger
  app.get('/swagger.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  logger.info(`🔖 Documentation Swagger disponible à: /api-docs`);
};
