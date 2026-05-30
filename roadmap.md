# Roadmap - Polla Mundialista 2026

Este roadmap organiza la evolucion del proyecto desde el prototipo actual hacia una app lista para operar una polla real del Mundial FIFA 2026. La prioridad es asegurar datos confiables, reglas claras, experiencia simple para participantes y herramientas solidas para administradores.

## Estado actual

- App React + Vite con servidor Express en `server.ts`.
- Persistencia local en `db_store.json`.
- Registro, login, recuperacion simple de password y perfil de usuario.
- Roles `admin` y `standard`.
- Calendario de partidos, pronosticos por marcador y ranking.
- Pronosticos especiales de torneo: lideres de grupo, clasificados por fase, finalistas, subcampeon y campeon.
- Panel admin para usuarios, partidos, resultados, comunicados, configuracion y reinicio de datos demo.
- Notificaciones internas para recordatorios, resultados, ranking y comunicados.
- Multilenguaje parcial y tema claro/oscuro.

## Fase 1 - Preparacion para uso real

Objetivo: dejar la app lista para recibir participantes reales sin datos de demostracion ni riesgos obvios de operacion.

- Limpiar datos demo y separar claramente `seed` de datos reales.
- Corregir textos con problemas de codificacion para nombres, reglas, paises y mensajes.
- Validar el fixture oficial que se usara en la polla.
- Revisar reglas de puntuacion y unificar textos con la logica del backend.
- Confirmar fecha y hora de cierre de pronosticos de partidos y favoritos.
- Agregar controles para impedir ediciones fuera de plazo desde frontend y backend.
- Documentar usuarios iniciales, credenciales admin y pasos de puesta en marcha.

Criterio de cierre:

- Una instalacion nueva puede arrancar en modo real, con usuarios en cero, partidos pendientes y reglas coherentes.

## Fase 2 - Seguridad y cuentas

Objetivo: reemplazar la autenticacion de prototipo por una base minima segura.

- Guardar passwords con hash, no en texto plano.
- Mover secretos y configuraciones sensibles a variables de entorno.
- Reforzar validaciones de registro, login y cambios de perfil.
- Agregar expiracion o rotacion de tokens simples.
- Limitar acciones admin en backend, no solo en la interfaz.
- Definir politica para suspender, reactivar y eliminar usuarios.
- Mejorar recuperacion de password con flujo seguro o token temporal.

Criterio de cierre:

- Un usuario estandar no puede ejecutar endpoints admin y las credenciales no quedan expuestas en datos persistidos.

## Fase 3 - Persistencia y datos

Objetivo: reemplazar el archivo JSON como fuente principal cuando la app crezca.

- Elegir base de datos para produccion: SQLite, PostgreSQL o servicio administrado.
- Crear modelo de datos para usuarios, partidos, predicciones, rankings, notificaciones y configuracion.
- Implementar migraciones.
- Agregar backups exportables del torneo.
- Mantener importacion/exportacion JSON para administracion o recuperacion.
- Registrar auditoria basica de cambios admin: resultados, usuarios, reglas y reinicios.

Criterio de cierre:

- La app puede reiniciarse, desplegarse y respaldarse sin depender de editar manualmente `db_store.json`.

## Fase 4 - Motor de puntuacion

Objetivo: hacer que el calculo de puntos sea confiable, trazable y facil de auditar.

- Extraer la logica de puntuacion a un modulo probado.
- Cubrir casos: marcador exacto, empate exacto, resultado acertado, participacion y partido sin resultado.
- Separar puntos por fase de grupos, eliminatorias y bonus de campeon.
- Recalcular ranking de forma idempotente al actualizar resultados.
- Mostrar desglose de puntos por partido y por prediccion especial.
- Definir desempates del ranking: exactos, resultados acertados, cantidad de predicciones, fecha de registro u otro criterio.

Criterio de cierre:

- Cualquier cambio de marcador o resultado oficial recalcula el ranking de manera repetible y explicable.

## Fase 5 - Experiencia del participante

Objetivo: que predecir sea rapido, claro y usable desde celular.

- Mejorar vista de calendario con filtros por fecha, grupo, fase, equipo y estado.
- Destacar partidos pendientes de pronostico y proximos cierres.
- Agregar validaciones visuales antes de guardar marcadores.
- Mostrar confirmacion clara de pronosticos guardados.
- Permitir descargar o compartir resumen de predicciones.
- Optimizar layout mobile para listas largas de partidos y selecciones.
- Pulir reglas y premios dentro de la app con textos finales.

Criterio de cierre:

- Un participante puede registrarse, entender reglas, hacer sus pronosticos y revisar su posicion sin ayuda externa.

## Fase 6 - Administracion del torneo

Objetivo: dar al admin herramientas completas para operar la polla durante todo el Mundial.

- Dashboard admin con salud del torneo: participantes, predicciones faltantes, partidos cerrados y resultados pendientes.
- Busqueda y filtros avanzados de usuarios.
- Edicion masiva o importacion de partidos.
- Flujo seguro para publicar resultados oficiales.
- Vista previa del impacto en ranking antes de confirmar un resultado.
- Historial de comunicados y programacion real de publicaciones.
- Accion de cierre manual de predicciones ante casos especiales.

Criterio de cierre:

- El admin puede operar una jornada completa sin tocar archivos ni reiniciar manualmente la app.

## Fase 7 - Notificaciones

Objetivo: convertir las notificaciones internas en un sistema util para recordar y enganchar a los participantes.

- Programar recordatorios automaticos 24h y 1h antes del cierre.
- Enviar alertas cuando se publiquen resultados.
- Notificar cambios relevantes de ranking.
- Integrar correo real para usuarios suscritos.
- Preparar plantillas de email en espanol e ingles.
- Evitar notificaciones duplicadas con llaves de envio.
- Agregar preferencias por usuario para tipos de alertas.

Criterio de cierre:

- Los usuarios reciben recordatorios utiles y el sistema evita spam o duplicados.

## Fase 8 - Calidad, pruebas y mantenimiento

Objetivo: reducir regresiones antes de abrir la app a mas participantes.

- Agregar pruebas unitarias para el motor de puntuacion.
- Agregar pruebas de endpoints criticos: auth, predicciones, resultados y ranking.
- Ejecutar `npm run lint` en cada cambio.
- Revisar accesibilidad basica: foco, contraste, labels y navegacion por teclado.
- Medir rendimiento en listas grandes de partidos y rankings.
- Crear checklist manual para probar una jornada completa.
- Documentar decisiones tecnicas importantes.

Criterio de cierre:

- Los flujos centrales estan cubiertos por pruebas y existe una rutina clara de verificacion antes de desplegar.

## Fase 9 - Despliegue

Objetivo: publicar la app de forma estable para participantes reales.

- Definir plataforma de hosting para frontend y backend.
- Configurar variables de entorno por ambiente.
- Agregar build reproducible con `npm run build`.
- Configurar logs de servidor y errores.
- Definir dominio, HTTPS y politica basica de backups.
- Preparar ambiente de staging para probar cambios antes de produccion.
- Documentar rollback y restauracion de datos.

Criterio de cierre:

- La app esta disponible en una URL estable, con datos respaldados y un camino claro para recuperar el servicio.

## Fase 10 - Mejoras posteriores

Ideas para despues de tener la operacion principal estable:

- Ligas privadas o grupos familiares dentro de la misma polla.
- Invitaciones por enlace.
- Exportacion de ranking a CSV o Excel.
- Tabla historica por jornada.
- Insignias por aciertos, rachas y lideratos.
- Modo solo lectura publico para compartir ranking.
- Integracion con API externa de resultados deportivos.
- Panel de analitica: equipos mas elegidos, marcadores populares y predicciones de campeon.

## Prioridades sugeridas

1. Fase 1: preparacion real y limpieza de datos.
2. Fase 4: motor de puntuacion confiable.
3. Fase 2: seguridad minima de cuentas.
4. Fase 6: herramientas admin para operar sin tocar archivos.
5. Fase 9: despliegue estable.

## Riesgos a vigilar

- Diferencias entre reglas visibles y puntos calculados.
- Datos demo mezclados con datos reales.
- Passwords en texto plano durante uso real.
- Dependencia de `db_store.json` para una competencia con muchos usuarios.
- Cierres de prediccion implementados solo en frontend.
- Problemas de codificacion en textos y nombres de selecciones.

