# Roadmap - Polla Mundialista 2026

Este roadmap resume el estado real del proyecto y organiza lo que falta para operar la polla en produccion con usuarios pagos, datos confiables y una experiencia clara para participantes y administradores.

## Estado Actual

- App React + Vite con servidor Express en `server.ts`.
- Despliegue preparado para Railway.
- Persistencia principal con Prisma + PostgreSQL.
- Importacion inicial desde JSON hacia Postgres disponible en `scripts/import-db-to-postgres.ts`.
- Archivos subidos con metadata en Postgres y almacenamiento en Cloudinary.
- Registro, login, recuperacion simple de password y perfil de usuario.
- Roles `admin` y `standard`.
- Campo de pais por usuario, con bandera en registro, perfil, admin y ranking.
- Normalizacion de paises/codigos, por ejemplo `CO` -> `Colombia`.
- Multilenguaje parcial con mejoras en autenticacion, calendario, pronosticos y ranking.
- Calendario de fase de grupos sincronizado con API externa.
- Fixture de eliminacion directa separado de los partidos reales de API.
- Pronosticos por marcador con guardar, actualizar y limpiar.
- Bloqueo backend/frontend para impedir pronosticos de usuarios sin pago confirmado.
- Pronosticos especiales de torneo: lideres de grupo, clasificados por fase, finalistas, subcampeon y campeon.
- Ranking en tiempo real con exportacion CSV.
- Panel admin para usuarios, partidos, resultados, comunicados, assets, banners y configuracion.
- Banners dinamicos con rotacion y enlace.
- Notificaciones internas para recordatorios, resultados, ranking y comunicados.
- Integracion con Stripe Checkout para cobrar inscripcion.
- Calculo de bolsa de premios:
  - Inscripcion: USD 25.
  - 70% para premios.
  - 80% del premio para primer puesto.
  - 15% para segundo puesto.
  - 5% para tercer puesto.
  - Comision bancaria fija 3.5% descontada de la ganancia admin.
- Dashboard de usuario con premio acumulado visible.
- Dashboard admin con desglose de participantes pagos, premio y ganancia estimada.

## Fase 1 - Estabilizacion Inmediata

Objetivo: dejar estable lo ya construido antes de seguir agregando capas grandes.

- Confirmar que Railway tiene `DATABASE_URL`, Cloudinary, Football Data API, Stripe y `PUBLIC_APP_URL`.
- Ejecutar `npm run db:push` cuando haya cambios de Prisma.
- Probar registro, login, pago, retorno de Stripe y bloqueo de pronosticos sin pago.
- Verificar que paises antiguos como `CO` se muestren como `Colombia`.
- Revisar que ranking, CSV y dashboard muestren paises/banderas correctamente.
- Revisar en celular la pantalla de registro y el selector de idioma.
- Confirmar que los usuarios demo no se mezclen con usuarios reales antes de abrir inscripciones.

Criterio de cierre:

- Un usuario nuevo puede registrarse, pagar, entrar a pronosticos, guardar/limpiar marcadores y aparecer correctamente en ranking.

## Fase 2 - Pagos Profesionales

Objetivo: hacer que la participacion paga sea confiable incluso si el usuario cierra la pestana.

- Implementar Stripe Webhook para confirmar pagos desde Stripe, no solo al volver a la app.
- Guardar evento de pago recibido y evitar procesar dos veces la misma sesion.
- Agregar panel admin para ver estado de pago: pendiente, pagado, fallido.
- Permitir al admin marcar pago manual solo en casos excepcionales.
- Mostrar historial basico de pago del usuario.
- Definir politica de reembolso o anulacion si aplica.

Criterio de cierre:

- Todo pago confirmado por Stripe queda registrado aunque el usuario no vuelva manualmente desde Checkout.

## Fase 3 - Seguridad y Cuentas

Objetivo: reemplazar autenticacion de prototipo por una base segura.

- Guardar passwords con hash, no en texto plano.
- Migrar sesiones simples a tokens firmados o mecanismo equivalente.
- Reforzar validaciones de registro, login y cambios de perfil.
- Mejorar recuperacion de password con token temporal.
- Limitar acciones admin en backend con validaciones consistentes.
- Revisar que datos sensibles no viajen al frontend innecesariamente.
- Ocultar passwords en respuestas admin y crear flujo real de reset.

Criterio de cierre:

- Un usuario estandar no puede ejecutar endpoints admin y las credenciales no quedan expuestas.

## Fase 4 - Datos de Partidos

Objetivo: operar el Mundial con datos consistentes y actualizables.

- Mantener fase de grupos desde API externa como fuente principal.
- Confirmar proveedor definitivo de API para resultados en vivo/oficiales.
- Agregar proceso seguro de actualizacion de resultados oficiales.
- Evitar duplicados al sincronizar.
- Registrar auditoria de sincronizaciones API.
- Mantener eliminacion directa como fixture separado hasta que los cruces esten definidos.
- Cuando avance el torneo, transformar los cruces de eliminacion directa en partidos reales pronosticables.

Criterio de cierre:

- El calendario no duplica partidos y los resultados oficiales pueden actualizarse sin romper predicciones existentes.

## Fase 5 - Motor de Puntuacion

Objetivo: que el calculo de puntos sea confiable, trazable y facil de auditar.

- Extraer la logica de puntuacion a un modulo probado.
- Cubrir casos: marcador exacto, empate exacto, resultado acertado, participacion y partido sin resultado.
- Separar puntos por fase de grupos, eliminatorias y bonus de campeon.
- Definir desempates del ranking: exactos, resultados acertados, cantidad de predicciones, fecha de pago o fecha de registro.
- Mostrar desglose de puntos por partido y por prediccion especial.
- Agregar recalculo idempotente con pruebas.

Criterio de cierre:

- Cualquier cambio de marcador o resultado oficial recalcula el ranking de manera repetible y explicable.

## Fase 6 - Experiencia del Participante

Objetivo: que participar sea rapido, claro y usable desde celular.

- Pulir pantalla de registro en todos los idiomas principales.
- Mejorar selector de pais con busqueda si la lista crece.
- Destacar partidos pendientes de pronostico y proximos cierres.
- Agregar filtros por fecha, grupo, equipo y estado en vista mobile.
- Mostrar resumen de pronosticos guardados.
- Permitir descargar o compartir resumen de predicciones.
- Mejorar mensajes cuando el usuario no ha pagado.
- Pulir reglas y premios con textos finales.

Criterio de cierre:

- Un participante entiende que debe pagar, paga, pronostica y revisa su posicion sin ayuda externa.

## Fase 7 - Administracion del Torneo

Objetivo: que el admin pueda operar todo sin tocar archivos.

- Mejorar busqueda y filtros de usuarios por pais, pago, rol y estado.
- Vista de usuarios pagos vs pendientes.
- Exportacion de usuarios y pagos a CSV.
- Vista previa del impacto en ranking antes de confirmar resultado.
- Historial de acciones admin: resultados, usuarios, banners, reglas y reinicios.
- Confirmacion reforzada para acciones destructivas.
- Programacion real de comunicados.
- Panel de salud del torneo: predicciones faltantes, partidos cerrados y resultados pendientes.

Criterio de cierre:

- El admin puede operar una jornada completa desde la app, sin editar archivos ni reiniciar manualmente.

## Fase 8 - Assets, Banners y Contenido

Objetivo: convertir la app en una plataforma presentable para patrocinadores y reglas.

- Mantener Cloudinary como almacenamiento de imagenes, PDFs y videos.
- Agregar previsualizacion de assets por tipo.
- Asociar assets a reglas, banners o comunicados desde la app.
- Mejorar gestion de banners por ubicacion, fechas y rotacion.
- Medir clics en banners.
- Agregar orden/prioridad para banners activos.
- Validar tamanos recomendados y formatos admitidos.

Criterio de cierre:

- El admin puede subir contenido, publicarlo y rotarlo sin tocar carpetas del proyecto.

## Fase 9 - Notificaciones

Objetivo: convertir las notificaciones internas en recordatorios utiles.

- Programar recordatorios automaticos 24h y 1h antes del cierre.
- Enviar alertas cuando se publiquen resultados.
- Notificar cambios relevantes de ranking.
- Integrar correo real para usuarios suscritos.
- Evaluar WhatsApp solo si hay presupuesto/API adecuada.
- Preparar plantillas de email en espanol e ingles.
- Evitar notificaciones duplicadas con llaves de envio.
- Agregar preferencias por usuario.

Criterio de cierre:

- Los usuarios reciben recordatorios utiles y el sistema evita spam o duplicados.

## Fase 10 - Calidad y Mantenimiento

Objetivo: reducir regresiones antes de abrir la app a mas participantes.

- Agregar pruebas unitarias para el motor de puntuacion.
- Agregar pruebas de endpoints criticos: auth, pagos, predicciones, resultados y ranking.
- Ejecutar `npm run lint` y `npm run build` en cada cambio importante.
- Revisar accesibilidad basica: foco, contraste, labels y navegacion por teclado.
- Medir rendimiento en listas grandes de partidos y rankings.
- Crear checklist manual para probar una jornada completa.
- Documentar decisiones tecnicas importantes.

Criterio de cierre:

- Los flujos centrales estan cubiertos por pruebas y existe una rutina clara de verificacion antes de desplegar.

## Fase 11 - Despliegue y Operacion

Objetivo: operar la app de forma estable durante el torneo.

- Mantener Railway como plataforma inicial.
- Configurar dominio propio si aplica.
- Definir backups de Postgres.
- Configurar logs y alertas de errores.
- Crear ambiente de staging para probar cambios antes de produccion.
- Documentar rollback y restauracion de datos.
- Confirmar plan de escalamiento si aumenta el numero de usuarios.

Criterio de cierre:

- La app esta disponible en URL estable, con datos respaldados y camino claro de recuperacion.

## Prioridades Sugeridas

1. Stripe Webhook para confirmar pagos de forma robusta.
2. Hash de passwords y mejora de recuperacion de cuenta.
3. Limpieza definitiva de datos demo antes de abrir inscripciones reales.
4. Pruebas del motor de puntuacion.
5. Auditoria admin y exportes de operacion.
6. Pulido mobile de registro, pronosticos y ranking.

## Riesgos a Vigilar

- Usuarios sin pago intentando pronosticar por endpoints directos.
- Diferencias entre reglas visibles y puntos calculados.
- Datos demo mezclados con usuarios reales.
- Passwords en texto plano durante uso real.
- Pagos confirmados solo por retorno del navegador, sin webhook.
- Cambios de API externa que alteren nombres de equipos o ids.
- Problemas de codificacion en textos, paises y nombres de selecciones.
- Falta de backups antes de cambios grandes en Postgres.

## Ultima Actualizacion

- 2026-05-30: actualizado tras integrar Railway/Postgres, Cloudinary, Stripe Checkout, premio acumulado, bloqueo por pago, paises con banderas, API de partidos, eliminacion directa separada y banners dinamicos.
