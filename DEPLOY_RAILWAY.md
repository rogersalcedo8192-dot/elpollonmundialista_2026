# Deploy en Railway + PostgreSQL

Esta app ya queda preparada para funcionar con Postgres cuando existe `DATABASE_URL`. Si no existe, sigue usando `db_store.json` para desarrollo local.

## Lo que haces en Railway

1. Crea un proyecto en Railway.
2. Agrega un servicio PostgreSQL.
3. Agrega este repo como servicio web.
4. En variables del servicio web, configura:

```env
DATABASE_URL=${{Postgres.DATABASE_URL}}
NODE_ENV=production
```

Railway configura `PORT` automaticamente.

## Primer despliegue

Railway ejecutara:

```bash
npm install
npm run build
npm run start
```

El `build` ejecuta `prisma generate`, compila Vite y empaqueta `server.ts`.

## Crear tablas

Antes de usar la app con Postgres por primera vez, ejecuta en Railway o local con `DATABASE_URL` configurada:

```bash
npm run db:push
```

## Importar datos actuales

Para pasar lo que tienes en `db_store.json` a Postgres:

```bash
npm run db:import
```

Esto importa usuarios, partidos, predicciones, rankings, comunicados, notificaciones, resultados del torneo y metadata de assets.

## Admin

El admin actual se conserva:

```text
Correo: rasalcedo76@gmail.com
Password: admin
```

Cambia esa clave al entrar en produccion.

## Assets

La metadata de assets queda en Postgres.

Para produccion, configura Cloudinary en Railway:

```env
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

Con esas variables, las nuevas cargas desde la Biblioteca de Assets se guardan en Cloudinary. Los assets viejos que ya apunten a `/uploads/...` seguiran funcionando como archivos locales si existen en el deploy, pero los nuevos ya no dependeran del filesystem de Railway.
