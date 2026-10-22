# Documento de diseño — UniPlanner PWA

**Proyecto:** aplicación progresiva de organización académica personal  
**Versión:** MVP local, sin backend  
**Fecha:** 21 de octubre de 2026

## 1. Resumen del problema

La información de entregas, actividades universitarias y metas de graduación suele estar repartida entre varias herramientas. UniPlanner reúne esos datos en una aplicación instalable y adaptable que permite al estudiante consultarlos y administrarlos desde un dispositivo, incluso sin conexión después de una primera carga exitosa.

El producto está dirigido principalmente a un estudiante de primer cuatrimestre y funciona como herramienta personal de una sola instalación. No se conecta a sistemas institucionales y no presenta los datos creados localmente como publicaciones oficiales.

## 2. Objetivo y alcance

### Objetivo general

Construir una PWA responsive para organizar tareas y eventos universitarios, conservar la información localmente, mostrar un resumen académico y estimar el tiempo hasta una fecha de graduación elegida por el estudiante.

### Incluido en el MVP

- CRUD de tareas con materia, descripción, entrega, prioridad, estado y recordatorio opcional.
- Filtros de tareas por materia, estado, vencimiento y fecha de entrega.
- CRUD de eventos con tipo, fecha y hora, lugar, descripción, fuente indicada y recordatorio opcional.
- Vista cronológica de próximos eventos e historial.
- Dashboard con próximas cinco tareas pendientes, próximos eventos, conteo de estados y cuenta regresiva.
- Configuración local de carrera, fechas, unidad de cuenta regresiva y duración informativa.
- IndexedDB para tareas, eventos, recordatorios y configuración.
- Manifiesto instalable, iconos y Service Worker para recursos esenciales y navegación offline después de la carga inicial.
- Avisos locales limitados al tiempo en que la aplicación está abierta y el entorno lo permite.

### Fuera del alcance

- Autenticación, cuentas, múltiples usuarios o sincronización entre dispositivos.
- Publicación automática de eventos oficiales o conexión con una API universitaria.
- Web Push real, planificación del lado del servidor y garantía de avisos con la aplicación cerrada.
- Cálculo automático de graduación a partir de la duración declarada.
- Respaldo remoto o resolución de conflictos entre dispositivos.

## 3. Usuarios y supuestos

| Usuario | Responsabilidad | Alcance en este MVP |
|---|---|---|
| Estudiante | Registrar y consultar sus actividades, configurar fechas y recordatorios. | Usuario principal; datos personales en el dispositivo. |
| Administrador institucional | Publicar información compartida. | No implementado. |
| Docente | Proporcionar entregas o actividades mediante una plataforma. | No implementado. |

Supuestos: no existe API institucional disponible; una instalación mantiene una sola configuración académica; la fecha de graduación la introduce el estudiante y es estimativa; la primera visita offline no está garantizada.

## 4. Requisitos y trazabilidad

| ID | Requisito | Implementación / validación |
|---|---|---|
| RF-01 | Crear, consultar, modificar y eliminar tareas; pedir confirmación al eliminar. | Pantalla Tareas y diálogo de confirmación. |
| RF-02 | Validar título, materia y fecha; distinguir estado, prioridad, vencimiento y tareas completadas. | Formulario tipado, validadores y distintivos visuales. |
| RF-03 | Filtrar tareas por materia, estado y fecha. | Filtros de la lista de tareas. |
| RF-04 | Crear, modificar y eliminar eventos y sus recordatorios. | Pantalla Eventos; el borrado del registro también borra su recordatorio. |
| RF-05 | Ordenar próximos eventos y conservar un historial. | Vistas Próximos e Historial en la agenda. |
| RF-06 | Mostrar actividades, resumen de estados y cuenta regresiva. | Dashboard; estados vacíos si faltan registros o configuración. |
| RF-07 | Configurar carrera y fechas; graduación posterior al inicio. | Configuración guardada en IndexedDB con validación. |
| RF-08 | Expresar el tiempo en días, semanas o meses aproximados. | Días naturales; semanas de siete días; meses aproximados. |
| RF-09 | Configurar avisos, pedir permiso explícitamente y comunicar límites. | Recordatorios vinculados a cada registro y aviso de prueba local. |
| RNF-01 | Persistencia local y consulta/escritura offline tras la primera carga. | IndexedDB y recursos precargados por Workbox. |
| RNF-02 | Instalación y modo standalone en navegador compatible y origen seguro. | Manifiesto PWA con nombre, colores, alcance e iconos. |
| RNF-03 | Diseño responsive, estado de conexión y errores comprensibles. | Interfaz adaptable e indicador online/offline. |
| RNF-04 | No exponer secretos ni afirmar que hay Web Push real. | Sin credenciales ni servicio push; limitación documentada en UI y README. |

## 5. Historias de usuario

| ID | Historia | Criterio de aceptación |
|---|---|---|
| HU-01 | Como estudiante, quiero registrar una tarea para controlar una entrega. | Los campos obligatorios se validan y la tarea aparece en la lista. |
| HU-02 | Quiero modificar, completar o borrar una tarea. | Los cambios se reflejan y sobreviven a una recarga; borrar requiere confirmación. |
| HU-03 | Quiero filtrar tareas por materia, estado y fecha. | Solo aparecen registros que cumplen los filtros activos. |
| HU-04 | Quiero registrar eventos y consultar los próximos. | Aparecen en orden cronológico con lugar y tipo. |
| HU-05 | Quiero editar o borrar eventos. | Los cambios persisten y el recordatorio relacionado se conserva o elimina correctamente. |
| HU-06 | Quiero ver mis actividades en un resumen. | Dashboard muestra tareas, eventos y conteos con estados vacíos claros. |
| HU-07 | Quiero configurar carrera y fecha estimada de graduación. | Se guarda la configuración y no se acepta graduación anterior al inicio. |
| HU-08 | Quiero cambiar la unidad de la cuenta regresiva. | Se muestran días, semanas o meses aproximados. |
| HU-09 | Quiero configurar un aviso para una actividad. | El recordatorio queda relacionado al registro y se explica el alcance local. |
| HU-10 | Quiero instalar la aplicación. | Un navegador compatible ofrece la instalación desde un origen seguro. |
| HU-11 | Quiero consultar mis datos sin conexión. | Tras la precarga, la aplicación abre y lee los registros locales offline. |
| HU-12 | Quiero modificar datos offline. | Los cambios de IndexedDB permanecen al recargar y reconectar. |

## 6. Arquitectura

```text
Estudiante
    │
    ▼
React + TypeScript + React Router
    ├── Páginas: Dashboard, Tareas, Eventos, Configuración
    ├── Validaciones, presentación de fechas y lógica de cuenta regresiva
    ├── Repositorios de datos (capa de acceso)
    │       └── IndexedDB mediante idb
    └── vite-plugin-pwa / Workbox
            ├── Manifiesto e iconos instalables
            ├── Service Worker y precaché de recursos estáticos
            └── Fallback de navegación a index.html
```

No hay servidor de aplicación ni sincronización. IndexedDB es la fuente de verdad para los datos personales; la caché del Service Worker almacena recursos de la aplicación, no sustituye la base local.

### Tecnologías

- React y TypeScript para UI y tipos del dominio.
- Vite para desarrollo y compilación.
- React Router para navegación.
- `idb` como API tipada de IndexedDB.
- `vite-plugin-pwa` / Workbox para manifiesto, precarga y fallback offline.

## 7. Modelo de datos

| Entidad | Campos principales | Reglas / relación |
|---|---|---|
| Tarea | `id`, `titulo`, `materia`, `descripcion`, `fechaEntrega`, `prioridad`, `estado`, `creadoEn`, `actualizadoEn` | Título, materia y fecha obligatorios. Un recordatorio opcional. |
| Evento | `id`, `titulo`, `tipo`, `fechaHoraInicio`, `lugar`, `descripcion`, `fuente`, `creadoEn`, `actualizadoEn` | Título, tipo, fecha y lugar obligatorios. Fuente local indicada como personal o institucional, sin verificación. |
| Recordatorio | `id`, `entidadTipo`, `entidadId`, `titulo`, `fechaHoraAviso`, `canal`, `estado`, `habilitado`, `ultimoIntento` | Cero o uno por tarea/evento en el MVP. Se elimina junto con su entidad. |
| Configuración de carrera | `id`, `nombreCarrera`, `fechaInicio`, `fechaGraduacionEstimada`, `unidadVisualizacion`, duración opcional, `actualizadoEn` | Un solo registro por instalación; independiente de tareas y eventos. |

Las fechas con hora se almacenan en ISO 8601 y se convierten desde/hacia la hora local del dispositivo para los formularios. Las fechas de carrera son fechas de calendario. No se almacena el número restante de días; se calcula al consultar.

## 8. Fechas, cuenta regresiva y recordatorios

- La diferencia de graduación usa días naturales entre la fecha local actual y la fecha local configurada; una fecha pasada produce un mensaje explicativo.
- Las semanas son una aproximación de siete días. Los meses se muestran como aproximados, no como meses de calendario exactos.
- La duración académica es informativa y nunca modifica automáticamente la fecha elegida.
- Los avisos se guardan en IndexedDB, se consultan al abrir la app y periódicamente mientras está abierta. Requieren permiso concedido y soporte del navegador para presentar una notificación local.
- JavaScript y el Service Worker no funcionan como un reloj persistente. No se garantiza entregar avisos cuando el navegador está cerrado, suspendido o el equipo apagado.
- Web Push real requeriría suscripción Push, claves VAPID protegidas y un servicio backend emisor; no forma parte de esta versión.

## 9. Seguridad, privacidad y limitaciones

- Los datos académicos permanecen en el almacenamiento del navegador y origen actual; borrar los datos del sitio puede eliminarlos.
- No existe autenticación, cifrado adicional de IndexedDB, sincronización ni copia de seguridad remota.
- No se incluyen claves privadas, tokens ni credenciales de terceros.
- Los eventos son datos introducidos localmente; la etiqueta de fuente no valida su oficialidad.
- Los avisos del navegador dependen de permiso, soporte, políticas del sistema operativo y estado de ejecución.
- La primera carga necesita conexión. El modo offline se verifica después de que el Service Worker haya instalado y precargado los recursos.

## 10. Plan y resultados de pruebas

| Caso | Estado actual | Evidencia / pendiente |
|---|---|---|
| Compilación TypeScript y paquete de producción | Aprobado | `npm run build`. |
| Lint del proyecto | Aprobado | `npm run lint`. |
| Crear tarea, guardar recordatorio y mostrarla | Aprobado | Smoke test funcional en navegador local. |
| Crear evento con recordatorio | Aprobado | Smoke test funcional en navegador local. |
| Guardar configuración y leerla en Dashboard tras recargar | Aprobado | Verificado en navegador local. |
| Completar y borrar tarea con filtros y confirmación | Aprobado | Smoke test funcional en navegador local. |
| Borrar evento con confirmación | Aprobado | Smoke test funcional en navegador local. |
| Abrir app offline después de precarga | Aprobado | Verificado en vista previa local con indicador Sin conexión. |
| Crear una entidad mientras `navigator.onLine` es `false` | Aprobado en navegador automatizado | Se creó una tarea y quedó almacenada; captura en `evidencias/08-escritura-sin-conexion.png`. |
| Recargar y comprobar la entidad sin volver a conectar | Parcial | La tarea persistió tras recargar, pero el navegador de pruebas informó En línea durante esa recarga; falta demostrar la recarga offline sostenida. |
| Instalar desde icono en dispositivo físico y modo standalone | Pendiente | Requiere dispositivo y origen HTTPS publicado. |
| Permiso denegado/no compatible y campos inválidos/pasados | Pendiente de evidencia formal | Seguir el checklist del README y guardar capturas. |

## 11. Entregables

1. Aplicación: código de este directorio; compilar con `npm run build`.
2. README técnico: instalación, ejecución, publicación y validación en `README.md`.
3. Documento de diseño: este archivo.
4. Evidencias: capturas de dashboard, CRUD, instalación, offline y permisos; video breve para recopilar siguiendo el guion del README.
5. Informe de notificaciones: sección 8 de este documento y sección Recordatorios del README.

Las capturas de instalación en dispositivo y el video no se simulan en el repositorio: deben registrarse durante la demostración en un dispositivo real.
