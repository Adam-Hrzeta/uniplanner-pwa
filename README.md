# UniPlanner PWA

PWA personal para organizar tareas y eventos universitarios, consultar un resumen académico y estimar el tiempo hasta la graduación. Es un MVP local: no requiere cuenta ni servidor de datos.

## Requisitos

- Node.js 20.19 o superior y npm.
- Navegador moderno. Para instalar la PWA, usar un origen seguro: HTTPS en producción o `localhost` durante desarrollo.

## Instalar y ejecutar

Desde esta carpeta:

```bash
npm ci
npm run dev
```

Abre la dirección que muestre Vite. Para validar el paquete de producción:

```bash
npm run build
npm run preview
```

El build genera `dist/`, con el manifiesto, recursos estáticos y Service Worker. El preview local sirve la versión de producción. Haz una primera carga con internet para que se instale el Service Worker y se precarguen los recursos; después prueba el modo offline.

## Publicar para la evaluación

La aplicación es estática. Una opción sencilla es Netlify:

1. Publica el proyecto en un repositorio Git propio, sin incluir `node_modules/`, `dist/` ni credenciales.
2. En Netlify, crea un sitio desde tu repositorio y configura **Build command** `npm run build` y **Publish directory** `dist`.
3. Usa la versión de Node 20.19+ en la configuración de build si la plataforma no la detecta automáticamente.
4. Espera el deploy y abre la URL HTTPS asignada. Confirma que `/`, `/tareas`, `/eventos` y `/configuracion` cargan, incluyendo al recargar cada ruta.
5. En un navegador compatible, instala desde el menú o el botón de instalación del navegador, abre el icono instalado y registra la URL final en la entrega.

`public/_redirects` configura el fallback de rutas SPA en Netlify. No se necesita API ni variable de entorno. El despliegue requiere una cuenta/repositorio del equipo y no debe hacerse con credenciales compartidas.

**Sin conectar un repositorio:** ejecuta `npm run build`, inicia sesión en Netlify y publica la carpeta `dist/` mediante el flujo de despliegue manual de Netlify Drop. Conserva la URL HTTPS asignada para la instalación y las evidencias.

## Funcionalidades entregadas

- Dashboard: próximas cinco tareas no completadas, eventos próximos, estados de tareas, vencidas y cuenta regresiva.
- Tareas: CRUD, materia, descripción, entrega, prioridad, estado, recordatorio opcional, filtros y confirmación de borrado.
- Eventos: CRUD, tipo, fecha/hora, lugar, descripción, fuente indicada, recordatorio, próximos eventos e historial.
- Configuración: carrera, fecha de inicio y graduación, duración informativa y unidad de visualización.
- IndexedDB para tareas, eventos, recordatorios y configuración. Los datos sobreviven una recarga en el mismo navegador/origen.
- PWA instalable, indicador online/offline y apertura offline después de completar una primera carga.

## Arquitectura y modelo de datos

La UI está construida con React y TypeScript; Vite compila recursos estáticos; React Router organiza las rutas; los repositorios en `src/db/` acceden a IndexedDB mediante `idb`; `vite-plugin-pwa` y Workbox generan manifiesto, Service Worker y precaché. IndexedDB es el almacenamiento de datos personales; la caché HTTP/Workbox es para recursos de la aplicación.

| Entidad | Datos esenciales | Relación |
|---|---|---|
| Tarea | título, materia, descripción, fecha de entrega, prioridad y estado | Cero o un recordatorio local. |
| Evento | título, tipo, fecha/hora, lugar, descripción y fuente indicada | Cero o un recordatorio local. |
| Recordatorio | entidad tipo/ID, fecha/hora de aviso, canal, estado y habilitado | Se elimina junto con la tarea o evento. |
| Configuración de carrera | carrera, inicio, graduación estimada, unidad y duración informativa | Un registro independiente por instalación. |

El documento con problema, objetivos, requisitos, historias de usuario, arquitectura, reglas, límites y trazabilidad está en [DOCUMENTO-DISENO.md](./DOCUMENTO-DISENO.md).

## Notificaciones: alcance real

Esta versión no tiene backend ni servicio emisor de Web Push. Los recordatorios se guardan en IndexedDB y pueden mostrar una notificación del navegador mientras UniPlanner está abierta, si el permiso fue concedido y el entorno soporta la API. El navegador revisa avisos periódicamente; no garantiza entregarlos con la app cerrada, suspendida o el dispositivo apagado. El aviso de prueba es una notificación local y no acredita Web Push.

El permiso se solicita únicamente al tocar **Activar notificaciones locales** en Configuración. Si se niega o la API no existe, las actividades y recordatorios siguen visibles en la aplicación.

## Privacidad y limitaciones

- Datos personales solo en el navegador y origen actuales; borrar datos del sitio puede eliminarlos.
- Sin autenticación, respaldo remoto, sincronización entre dispositivos ni integración institucional.
- Los eventos locales y la fuente que el usuario les asigne no verifican que sean oficiales.
- La cuenta regresiva usa días naturales; semanas equivalen a siete días y los meses se identifican como aproximados. La duración de carrera no cambia automáticamente la fecha.
- Offline requiere una carga inicial online para almacenar los recursos esenciales.
- La fecha de graduación es estimativa y no confirma egreso.

## Checklist de aceptación y evidencias

Guarda capturas con nombres descriptivos en `evidencias/` durante la demostración; evita incluir información personal real. En Windows, puedes capturar la ventana con `Win + Shift + S`. Graba un video breve mostrando dashboard, CRUD y la prueba offline; termina el video cuando vuelvas a conectarte. Adjunta también la URL desplegada y el navegador/dispositivo usado.

| Prueba | Pasos | Resultado esperado | Evidencia |
|---|---|---|---|
| Dashboard | Revisar tareas, eventos, resumen y cuenta regresiva con registros. | Los componentes muestran registros del dispositivo y estados vacíos entendibles. | `evidencias/05-dashboard-con-datos.png` |
| Tareas CRUD | Crear una tarea con todos los campos; editarla; marcarla completada; confirmar eliminación. | Datos visibles, editables, completables y eliminados tras confirmar. | `evidencias/02-tareas.png` |
| Filtros/vencimientos | Crear tareas con materias/fechas distintas; filtrar por materia, estado y día; revisar una vencida y una próxima. | La lista respeta cada filtro; vencida y próxima se distinguen. | Capturar como `evidencias/02-filtros.png`. |
| Eventos e historial | Crear evento futuro y pasado, agregar recordatorio, editar y borrar. | Próximos ordenados por fecha; pasado disponible en Historial; borrar limpia el recordatorio. | `evidencias/03-eventos.png`; falta captura del historial. |
| Cuenta regresiva | Guardar una carrera; probar días, semanas y meses; intentar graduación anterior al inicio. | Cálculo actualizado; fecha inválida rechazada; fecha pasada explicada, nunca negativa sin contexto. | Capturar como `evidencias/04-carrera.png`. |
| Persistencia | Recargar después de crear tarea, evento y configuración. | Los registros siguen disponibles en el mismo navegador/origen. | `evidencias/05-dashboard-con-datos.png` |
| Offline lectura y escritura | Tras precargar online, desconectar; abrir la app; crear o editar tarea; recargar offline; reconectar. | La app abre, muestra Sin conexión y la escritura local permanece al reconectar. | [Captura de escritura sin conexión](./evidencias/08-escritura-sin-conexion.png); falta evidencia de recarga permaneciendo offline. |
| Permisos | Probar permiso concedido y notificación de prueba; repetir con permiso denegado. Probar navegador sin API, si está disponible. | Resultado del permiso explicado y avisos internos disponibles; no se afirma Web Push. | `evidencias/06-notificaciones.png` (permiso denegado). |
| Instalación | En dispositivo compatible y URL HTTPS, instalar y abrir desde el icono. | Se abre en modo standalone y conserva sus datos locales. | Capturar como `evidencias/09-instalacion-dispositivo.png` y adjuntar video. |

### Registro ejecutado en desarrollo

- `npm run build`: aprobado.
- `npm run lint`: aprobado.
- En navegador local: creación de tarea y evento con recordatorio, guardado de carrera, lectura de esos datos en Dashboard tras recargar, completar/filtrar/eliminar tarea y eliminación confirmada de evento: aprobado.
- En vista previa local, después de la primera carga: apertura del Dashboard sin conexión e indicador Sin conexión: aprobado.
- En navegador automatizado, con `navigator.onLine === false`: creación de tarea y almacenamiento local aprobados; sobrevivió una recarga, aunque el navegador volvió a reportar conexión durante esa recarga.
- Pendiente de evidencia concluyente: abrir/recargar y consultar los datos permaneciendo offline durante todo el flujo, instalación desde icono en dispositivo físico, historial de eventos, pruebas formales de fechas y video final.

## Archivos de la entrega

- Aplicación ejecutable: este proyecto y sus dependencias declaradas en `package.json`.
- Diseño y trazabilidad: [DOCUMENTO-DISENO.md](./DOCUMENTO-DISENO.md).
- Instrucciones técnicas, despliegue y validación: este README.
- Informe de notificaciones y limitaciones: secciones anteriores y documento de diseño.
- Capturas locales existentes y pendientes: [índice de evidencias](./evidencias/README.md). La instalación en dispositivo y el video deben registrarse durante la demostración final.
