import { Controller, Get, Res } from '@nestjs/common';
import type { Response } from 'express';
import { readFileSync } from 'fs';
import { join } from 'path';

/** Sirve la especificación OpenAPI y Swagger UI para visualización en navegador. */
@Controller()
export class OpenApiDocsController {
  private readonly specPath = join(process.cwd(), 'openapi.yaml');

  @Get('openapi.yaml')
  yaml(@Res() res: Response): void {
    const body = readFileSync(this.specPath, 'utf8');
    res.setHeader('Content-Type', 'application/yaml; charset=utf-8');
    res.send(body);
  }

  @Get('api-docs')
  docs(@Res() res: Response): void {
    const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>OpenAPI — Pokémon favoritos</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" crossorigin/>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js" crossorigin></script>
  <script>
    window.onload = () => {
      window.ui = SwaggerUIBundle({
        url: window.location.origin + '/openapi.yaml',
        dom_id: '#swagger-ui',
        deepLinking: true,
      });
    };
  </script>
</body>
</html>`;
    res.type('text/html; charset=utf-8');
    res.send(html);
  }
}
