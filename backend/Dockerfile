FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
ENV TYPEORM_SYNC=false
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=build /app/dist ./dist
COPY openapi.yaml /app/openapi.yaml
EXPOSE 4000
# Con TYPEORM_SYNC=true (docker-compose dev) el esquema lo crea Nest; evitar migraciones que asumen tablas ya existentes.
# Sin TYPEORM_SYNC, ejecutar migraciones antes del servidor (imagen producción).
CMD ["sh", "-c", "if [ \"$TYPEORM_SYNC\" = \"true\" ]; then exec node dist/main.js; else node ./node_modules/typeorm/cli.js migration:run -d ./dist/infrastructure/persistence/data-source.js && exec node dist/main.js; fi"]
