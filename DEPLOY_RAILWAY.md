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

## Dominio y HTTPS

Para que el navegador no muestre "No seguro", configura los dos dominios en Railway y espera a que ambos certificados aparezcan como activos:

```text
www.elpollonmundialista.com
elpollonmundialista.com
```

En el DNS del dominio, el `www` debe apuntar al dominio publico de Railway:

```text
Tipo: CNAME
Nombre: www
Valor: xbwyqlcd.up.railway.app
```

El dominio raiz `elpollonmundialista.com` no puede usar CNAME en todos los proveedores. En Hostinger, usa el registro que Railway indique para el dominio raiz, normalmente `ALIAS`/`ANAME` si esta disponible, o los registros A que Railway muestre en la pantalla de dominio personalizado. No dejes el dominio raiz solo con parking DNS.

Despues de cambiar DNS, en Railway abre el servicio web, entra a `Settings` -> `Networking` -> `Custom Domain`, y verifica que el estado de SSL/TLS este activo para `www` y para el dominio raiz. La app fuerza redireccion a:

```text
https://www.elpollonmundialista.com
```

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

## Correos transaccionales

Para que recuperacion de contrasena, bienvenida y notificaciones lleguen al correo de cada usuario, configura Resend con un dominio verificado. Si usas `onboarding@resend.dev` o un dominio no verificado, Resend solo permite correos de prueba al correo propietario de la cuenta, por ejemplo `admin@elpollonmundialista.com`.

Variables recomendadas en Railway:

```env
RESEND_API_KEY=re_xxx
EMAIL_FROM=El Pollon Mundialista <notificaciones@elpollonmundialista.com>
EMAIL_REPLY_TO=admin@elpollonmundialista.com
APP_URL=https://tu-dominio.up.railway.app
```

En Resend, verifica `elpollonmundialista.com` y agrega los registros DNS que Resend indique para SPF/DKIM. Despues prueba desde el panel admin con `/api/admin/email-test` enviando a un correo distinto al admin.

## API dinamica de partidos

La app puede sincronizar calendario y resultados desde football-data.org. Crea una cuenta, genera tu token y agrega estas variables al servicio web en Railway:

```env
FOOTBALL_DATA_API_TOKEN=tu_token
FOOTBALL_DATA_COMPETITION=WC
FOOTBALL_DATA_SEASON=2026
```

Luego entra como admin a `Gestion de Partidos` y usa `Sincronizar API`.

Notas:

- La app no borra partidos ni predicciones existentes.
- Los partidos sincronizados quedan marcados con origen `API`.
- Si un partido llega como finalizado con marcador, se recalcula el ranking automaticamente.
- Si agregas `externalSource` y `externalSourceId` al modelo `Match`, ejecuta de nuevo `npm run db:push` en Railway para actualizar Postgres.

## Pagos

La seccion `Participar en Polla` cobra una inscripcion de 20.000 COP. La bolsa de premios se calcula en pesos colombianos sobre los pagos confirmados.

Configura estas variables en Railway:

```env
PAYMENT_PROVIDER=wompi
WOMPI_ENV=production
WOMPI_PUBLIC_KEY=pub_prod_...
WOMPI_PRIVATE_KEY=prv_prod_...
WOMPI_INTEGRITY_SECRET=...
WOMPI_CURRENCY=COP
WOMPI_AMOUNT_IN_CENTS=2000000
PUBLIC_APP_URL=https://tu-dominio.up.railway.app
```

Luego ejecuta:

```bash
npm run db:push
```

Notas:

- La bolsa de premios cuenta solo usuarios con `paymentStatus=paid`.
- El retorno exitoso de Stripe confirma la sesion y marca el usuario como pagado.
- Para produccion completa, el siguiente paso recomendado es agregar webhook de Stripe para confirmar pagos aunque el usuario cierre el navegador antes de volver a la app.
