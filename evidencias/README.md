# Evidencias de UniPlanner

Capturas tomadas de una vista previa local del build de producción. Los registros visibles son datos ficticios de demostración, no información oficial.

| Archivo | Qué muestra | Alcance |
|---|---|---|
| [01-dashboard.png](./01-dashboard.png) | Dashboard y estados vacíos iniciales. | Captura local de interfaz. |
| [02-tareas.png](./02-tareas.png) | Tarea de demostración con prioridad, descripción y recordatorio. | Registro y lectura en navegador local. |
| [03-eventos.png](./03-eventos.png) | Evento futuro con tipo, lugar y recordatorio. | Registro y lectura en navegador local. |
| [04-configuracion.png](./04-configuracion.png) | Carrera, fechas y unidad de visualización configurables. | Captura local; el permiso aparece denegado en este navegador de prueba. |
| [05-dashboard-con-datos.png](./05-dashboard-con-datos.png) | Dashboard con tarea, evento y cuenta regresiva. | Datos conservados al navegar en el mismo origen. |
| [06-notificaciones.png](./06-notificaciones.png) | Configuración con permiso del navegador denegado y limitaciones visibles. | Captura local; no representa todos los navegadores. |
| [07-registro-de-prueba.png](./07-registro-de-prueba.png) | Lista con una tarea ficticia para la prueba funcional. | Captura del navegador local; no es prueba de modo offline. |
| [08-escritura-sin-conexion.png](./08-escritura-sin-conexion.png) | Tarea creada cuando el navegador reportaba `navigator.onLine === false`; estado Sin conexión visible. | La tarea se guardó. La automatización volvió a estado En línea durante la recarga de comprobación; falta repetir la recarga permaneciendo offline. |

## Aún debe capturarse para la entrega

- Instalar desde el icono en un dispositivo físico y tomar captura de la app abierta en modo independiente (`09-instalacion-dispositivo.png`).
- Grabar un video corto de la instalación, CRUD, prueba offline y reconexión en el dispositivo/origen final (`10-demostracion.mp4`).
- Repetir la escritura offline con el indicador Sin conexión visible; recargar sin red, reconectar y verificar que el nuevo registro siga ahí. Guardar la evidencia final como `11-offline-confirmado.png`.
- Si el permiso se puede conceder en el navegador de demostración, capturar la notificación local de prueba. No presentarla como Web Push.

No se inventan capturas de instalación física, video ni resultados de dispositivos que no se probaron.
