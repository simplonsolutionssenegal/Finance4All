import swaggerUi from 'swagger-ui-express';
import { parse } from 'yaml';
import { readFileSync } from 'fs';
import { join } from 'path';
import type { Express } from 'express';

export function setupSwagger(app: Express): void {
  // Read and parse the OpenAPI specification
  const openApiPath = join(__dirname, 'openapi.yaml');
  const openApiContent = readFileSync(openApiPath, 'utf-8');
  const swaggerDocument = parse(openApiContent);

  // Swagger UI options
  const swaggerUiOptions: swaggerUi.SwaggerUiOptions = {
    explorer: true,
    customCss: `
      .swagger-ui .topbar { display: none }
      .swagger-ui .info .title { font-size: 2em; }
    `,
    customSiteTitle: 'Finance4All API Documentation',
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      docExpansion: 'list',
      filter: true,
      showExtensions: true,
      showCommonExtensions: true,
      tryItOutEnabled: true,
    },
  };

  // Serve the raw OpenAPI spec as JSON (MUST be before swaggerUi.serve)
  app.get('/openapi.json', (_req, res) => {
    res.json(swaggerDocument);
  });

  // Serve the raw OpenAPI spec as YAML (MUST be before swaggerUi.serve)
  app.get('/openapi.yaml', (_req, res) => {
    res.setHeader('Content-Type', 'text/yaml');
    res.send(openApiContent);
  });

  // Setup Swagger UI
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, swaggerUiOptions));
}
