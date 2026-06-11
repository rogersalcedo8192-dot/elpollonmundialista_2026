# Roadmap - Polla Mundialista 2026

Este roadmap resume el estado real del proyecto y organiza lo que falta para operar la polla en produccion con usuarios pagos, datos confiables y una experiencia clara para participantes y administradores.

## Estado Actual

- App React + Vite con servidor Express en `server.ts`.
- Despliegue preparado para Railway.
- Persistencia principal con Prisma + PostgreSQL.
- Importacion inicial desde JSON hacia Postgres disponible en `scripts/import-db-to-postgres.ts`.
- Archivos subidos con metadata en Postgres y almacenamiento en Cloudinary.
- Registro, login, recuperacion simple de password y perfil de usuario.
- Roles `superadmin/admin`, `company_admin` y `standard`.
- Campo de pais por usuario, con bandera en registro, perfil, admin y ranking.
- Normalizacion de paises/codigos, por ejemplo `CO` -> `Colombia`.
- Multilenguaje parcial con mejoras en autenticacion, calendario, pronosticos y ranking.
- Calendario de fase de grupos sincronizado con API externa.
- Fixture de eliminacion directa separado de los partidos reales de API.
- Pronosticos por marcador con guardar, actualizar y limpiar.
- Cuenta regresiva dinámica por evento hasta el cierre de pronósticos.
- Bloqueo backend/frontend para impedir pronosticos de usuarios sin pago confirmado.
- Pronosticos especiales de torneo: lideres de grupo, clasificados por fase, finalistas, subcampeon y campeon.
- El guardado de favoritos del torneo se bloquea una hora antes del primer partido: 11 de junio de 2026, 18:00 UTC (1:00 p. m. en Bogota).
- Ranking en tiempo real con exportacion CSV.
- Panel admin para usuarios, partidos, resultados, comunicados, assets, banners y configuracion.
- Gestión de usuarios responsive con tarjetas móviles y clasificación por tipo de acceso y rol.
- Banners dinamicos con rotacion y enlace.
- Notificaciones internas para recordatorios, resultados, ranking y comunicados.
- Comunicados por correo con negrillas y saltos de línea.
- Navegación responsive de favoritos con acceso visible a finalistas y campeón para todos los roles.
- Integracion de pagos configurable: Wompi Web Checkout como proveedor principal y Stripe Checkout como respaldo (`PAYMENT_PROVIDER`).
- Calculo de bolsa de premios:
  - Inscripcion: USD 5.
  - 0% para administracion.
  - 0% para comision bancaria/pasarela.
  - 100% de lo recaudado por usuarios pagos para premios.
  - 80% del premio para primer puesto.
  - 15% para segundo puesto.
  - 5% para tercer puesto.
- Dashboard de usuario con premio acumulado visible.
- Dashboard admin con desglose de participantes pagos, premio y ganancia estimada.
- En los paneles de premios se tachan solo los porcentajes anteriores de administracion (-10%) y comision bancaria (-3.5%); sus valores actuales de $0 se muestran sin tachar.
- Navegacion mobile integrada en el header con menu desplegable compacto.
- Header mobile compacto con avatar, etiqueta de usuario, posicion en ranking y puntaje visible sin desbordar la tarjeta.
- Resumen mobile above the fold con puntos, posicion, CTA de pronosticos/ranking y proximo partido.
- Filtros mobile de partidos corregidos con controles full-width, busqueda tolerante a tildes, boton para limpiar filtros y selector de fase/fecha futbolera.
- Mejoras de accesibilidad tactil en pronosticos: inputs numericos de marcador, botones de accion y filtros con areas tactiles mas comodas.
- Skeleton loaders basicos en dashboard durante carga inicial y carga de datos del usuario.
- Base multitenant incremental: empresas, invitaciones, ranking empresarial y `APP_MODE` FREE/PAID sin eliminar la pasarela.
- Cambio incremental de Stripe a Wompi: se conserva Stripe, pero el proveedor activo se controla con `PAYMENT_PROVIDER=wompi|stripe`.
- Popup administrable desde configuracion global y reinicio de polla con saldos de premio acumulado en cero.
- Popup administrable con imagen seleccionable desde biblioteca de assets.
- Popup administrable se muestra en la visita publica inicial antes de login/registro y se oculta en la experiencia autenticada.
- Empresas muestran premios como texto informativo desde su propio Libro de Premiaciones.
- Reglas y Premiaciones separa politicas de premios en dinero y politicas de premios de empresa:
  - Usuarios FREE invitados por superadmin pueden ver las politicas de premios en dinero.
  - Usuarios invitados de empresa ven las politicas de premios de su empresa.
  - Usuarios de empresa que tambien pagan la Polla REAL pueden ver ambas politicas.
  - Admin empresa ve la politica de su empresa y, si participa pagando, tambien la politica de la bolsa en dinero.
- Inicio predeterminado de usuarios autenticados en Mis Pronosticos para que el flujo de participacion y pago sea evidente.
- Perfil de usuario reorganizado como menu de configuracion: datos de perfil, avatar/imagen, idioma, tema, sonido, cambio de contrasena, ultima vez de inicio de sesion y cierre de sesion.
- Cierre de sesion movido a configuracion de usuario, fuera del menu hamburguesa y del boton directo del header.
- Invitaciones de empresa reutilizables: un enlace sirve para registrar multiples jugadores hasta completar el cupo maximo de la empresa, actualmente limitado a 50.
- Panel de invitaciones de empresa muestra cupos usados/disponibles, instrucciones para el admin empresa y boton para copiar enlaces recientes.
- Creacion autogestionada de Polla Grupal para familias, empresas, amigos y comunidades, sin aprobacion manual del superadmin.
- Las solicitudes de Polla Grupal se activan automaticamente despues de 5 minutos; el solicitante pasa a `company_admin` y recibe acceso gratuito al panel Administrador Grupal.
- Tarjetas de pronosticos mejoradas: toque para expandir, controles +/-, y marcador 1X2 resaltado.
- Textos publicos del footer, FAQ y modal informativo corregidos en espanol con tildes y signos de apertura de pregunta.

## Fase 1 - Estabilizacion Inmediata

Objetivo: dejar estable lo ya construido antes de seguir agregando capas grandes.

- Confirmar que Railway tiene `DATABASE_URL`, Cloudinary, Football Data API, Wompi, Stripe opcional y `PUBLIC_APP_URL`.
- Ejecutar `npm run db:push` cuando haya cambios de Prisma.
- Probar registro, login, pago, retorno de Wompi y bloqueo de pronosticos sin pago.
- Verificar que paises antiguos como `CO` se muestren como `Colombia`.
- Revisar que ranking, CSV y dashboard muestren paises/banderas correctamente.
- Revisar en celular la pantalla de registro y el selector de idioma.
- Confirmar que los usuarios demo no se mezclen con usuarios reales antes de abrir inscripciones.

Criterio de cierre:

- Un usuario nuevo puede registrarse, pagar, entrar a pronosticos, guardar/limpiar marcadores y aparecer correctamente en ranking.

## Fase 2 - Pagos Profesionales

Objetivo: hacer que la participacion paga sea confiable incluso si el usuario cierra la pestana.

- Implementar webhook de Wompi para confirmar pagos desde Wompi, no solo al volver a la app.
- Mantener webhook Stripe solo si `PAYMENT_PROVIDER=stripe` se usa como respaldo.
- Guardar evento de pago recibido y evitar procesar dos veces la misma sesion.
- Agregar panel admin para ver estado de pago: pendiente, pagado, fallido.
- Permitir al admin marcar pago manual solo en casos excepcionales.
- Mostrar historial basico de pago del usuario.
- Definir politica de reembolso o anulacion si aplica.

Criterio de cierre:

- Todo pago confirmado por Wompi queda registrado aunque el usuario no vuelva manualmente desde Checkout.

## Fase 3 - Seguridad y Cuentas

Objetivo: reemplazar autenticacion de prototipo por una base segura.

- MUY IMPORTANTE - PENDIENTE: rehacer el flujo de "Olvido su contrasena" antes de abrir usuarios/pagos reales.
  - No mostrar ni enviar la contrasena actual del usuario.
  - Crear token temporal de recuperacion con expiracion.
  - Enviar enlace real por correo usando proveedor como Resend, SendGrid, Brevo o SMTP.
  - Crear pantalla para definir nueva contrasena.
  - Guardar contrasenas con hash usando `bcrypt` o equivalente.
  - El admin no debe ver contrasenas; solo puede iniciar un reset manual controlado.
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
- COMPLETADO: filtros por grupo/etapa, fase/fecha, equipo/estadio/texto y estado en vista mobile.
- COMPLETADO: filtro fase/fecha usa la logica futbolera del torneo: Fecha 1, Fecha 2 y Fecha 3 para grupos, luego 16avos, octavos, cuartos, semifinales, tercer puesto y final.
- Pendiente: convertir ranking mobile a tarjetas para evitar lectura tipo tabla en pantallas pequenas.
- Mostrar resumen de pronosticos guardados.
- Permitir descargar o compartir resumen de predicciones.
- Mejorar mensajes cuando el usuario no ha pagado.
- COMPLETADO: destacar con claridad que los premios en dinero aplican a usuarios pagos de Polla REAL, especialmente para usuarios de empresa o modalidad gratuita.
- COMPLETADO: inicio predeterminado en Reglas y Premiaciones para que cada usuario vea primero la informacion de premios que le corresponde.
- COMPLETADO: perfil convertido en menu de configuracion con secciones claras para avatar, imagen, idioma, tema, sonido, contrasena, sesion y cierre de sesion.
- COMPLETADO: pulido inicial de textos publicos del footer, preguntas frecuentes y modal "Que es El Pollon Mundialista" con tildes y signos `¿...?`.
- Pulir textos finales de reglas y premios una vez queden definidas las premiaciones reales y empresariales.

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
- COMPLETADO: invitaciones de empresa reutilizables hasta el cupo maximo de la empresa, con mensajes emergentes e instrucciones mas claras para admin empresa.
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
- Esperar y verificar cada envio automatico por partido; reintentar fallos del proveedor sin duplicar la alerta interna.
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

1. Webhook Wompi para confirmar pagos de forma robusta.
2. MUY IMPORTANTE - PENDIENTE: recuperar contrasena de forma segura con hash, token temporal y envio real por correo.
3. Limpieza definitiva de datos demo antes de abrir inscripciones reales.
4. Pruebas del motor de puntuacion.
5. Pulido mobile pendiente: ranking en cards y pronostico rapido de proximos partidos.
6. Auditoria admin y exportes de operacion.

## Riesgos a Vigilar

- Usuarios sin pago intentando pronosticar por endpoints directos.
- Diferencias entre reglas visibles y puntos calculados.
- Datos demo mezclados con usuarios reales.
- Passwords en texto plano durante uso real.
- Flujo de "Olvido su contrasena" exponiendo credenciales o funcionando solo como simulacion.
- Pagos confirmados solo por retorno del navegador, sin webhook.
- Cambios de API externa que alteren nombres de equipos o ids.
- Problemas de codificacion en textos, paises y nombres de selecciones.
- Falta de backups antes de cambios grandes en Postgres.
- Empresas sin Libro de Premiaciones definido mostrando mensajes genericos; revisar contenido antes de activar empresas reales.

## Ultima Actualizacion

- 2026-06-11: agregado ticker publico de lectura antes del footer con resultados recientes, partidos en curso y proximos encuentros, alimentado por `/api/matches` sin escrituras en base de datos.
- 2026-06-11: automatizada la sincronizacion de calendario, estados y resultados con football-data.org al iniciar el servidor y cada 5 minutos; el control manual queda como respaldo.
- 2026-06-11: corregido el envio de publicaciones del superadmin para usar exactamente el titulo escrito como asunto y encabezado visible del correo.
- 2026-06-03: corregidos textos publicos en espanol del footer, FAQ y modal informativo: tildes, signos de apertura `¿...?`, preguntas de confirmacion administrativas y verificacion con `npm run build`.
- 2026-06-02: actualizado header mobile con etiqueta de usuario, posicion y `Puntaje: X`; agregado filtro fase/fecha por logica futbolera; separadas politicas de premios en dinero y premios de empresa segun rol, empresa y pago.
- 2026-06-01: agregado primer bloque multitenant incremental con empresas, invitaciones, administradores de empresa, ranking empresarial, migracion Prisma y modo `APP_MODE=FREE|PAID`.
- 2026-06-01: agregado `PAYMENT_PROVIDER` para migrar de Stripe a Wompi sin eliminar Stripe; Wompi queda como proveedor principal configurable.
- 2026-06-01: agregado popup administrable, reinicio de polla con pagos/premios en cero y premios empresariales informativos por Libro de Premiaciones.
- 2026-06-01: popup ahora permite imagen desde assets y las tarjetas de partidos tienen controles tactiles +/-, expansion por toque e indicador 1X2.
- 2026-06-01: actualizado tras integrar menu mobile en header, resumen mobile above the fold, filtros mobile de partidos corregidos, busqueda sin tildes, boton limpiar filtros, mejoras tactiles en pronosticos y skeleton loaders basicos.
- 2026-06-10: actualizado esquema de premios: 100% de lo recaudado por usuarios pagos se destina a premios, sin descuento bancario ni de administracion; ambas filas permanecen visibles, tachadas y en $0.
- 2026-05-31: marcado como MUY IMPORTANTE - PENDIENTE rehacer recuperacion de contrasena con token temporal, correo real y passwords con hash antes de usuarios/pagos reales.
- 2026-05-30: actualizado tras integrar Railway/Postgres, Cloudinary, Stripe Checkout, premio acumulado, bloqueo por pago, paises con banderas, API de partidos, eliminacion directa separada y banners dinamicos.
