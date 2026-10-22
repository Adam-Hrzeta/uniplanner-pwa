import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { listEvents } from '../db/eventsRepo';
import { getCareerConfig } from '../db/careerRepo';
import { listReminders } from '../db/remindersRepo';
import { listTasks } from '../db/tasksRepo';
import EmptyState from '../components/EmptyState';
import heroImage from '../assets/hero.png';
import type { ConfiguracionCarrera, Evento, Recordatorio, Tarea } from '../types';
import { computeCountdown, daysBetweenToday, formatDateTime, taskStatusClass } from '../utils/dates';

export default function DashboardPage() {
  const [tasks, setTasks] = useState<Tarea[]>([]);
  const [events, setEvents] = useState<Evento[]>([]);
  const [reminders, setReminders] = useState<Recordatorio[]>([]);
  const [config, setConfig] = useState<ConfiguracionCarrera>();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);
  const [now, setNow] = useState(0);

  useEffect(() => {
    let active = true;
    Promise.all([listTasks(), listEvents(), listReminders(), getCareerConfig()])
      .then(([taskList, eventList, reminderList, career]) => {
        if (!active) return;
        setTasks(taskList);
        setEvents(eventList);
        setReminders(reminderList);
        setConfig(career);
        setNow(Date.now());
        setError('');
      })
      .catch(() => {
        if (active) setError('No se pudieron leer tus datos locales. Revisa el almacenamiento de este navegador.');
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [reloadKey]);

  const nextTasks = useMemo(() => tasks
    .filter(task => task.estado !== 'completada')
    .sort((a, b) => a.fechaEntrega.localeCompare(b.fechaEntrega))
    .slice(0, 5), [tasks]);
  const upcomingEvents = useMemo(() => events
    .filter(event => new Date(event.fechaHoraInicio).getTime() >= now)
    .sort((a, b) => a.fechaHoraInicio.localeCompare(b.fechaHoraInicio))
    .slice(0, 5), [events, now]);
  const activeReminders = useMemo(() => reminders
    .filter(reminder => reminder.habilitado && reminder.estado === 'pendiente')
    .sort((a, b) => a.fechaHoraAviso.localeCompare(b.fechaHoraAviso))
    .slice(0, 4), [reminders]);

  const overdue = tasks.filter(task => task.estado !== 'completada' && daysBetweenToday(task.fechaEntrega) < 0).length;
  const pending = tasks.filter(task => task.estado === 'pendiente' && daysBetweenToday(task.fechaEntrega) >= 0).length;
  const inProgress = tasks.filter(task => task.estado === 'en proceso').length;
  const completed = tasks.filter(task => task.estado === 'completada').length;
  const countdown = computeCountdown(config?.fechaGraduacionEstimada, config?.unidadVisualizacion);
  const greeting = new Date().getHours() < 12 ? 'Buenos días' : new Date().getHours() < 19 ? 'Buenas tardes' : 'Buenas noches';

  return (
    <section className="page-stack">
      <div className="dashboard-hero">
        <div><p className="eyebrow">TU ESPACIO ACADÉMICO</p><h1>{greeting}, estudiante</h1><p>Un paso a la vez. Aquí tienes lo importante para hoy.</p></div>
        <img className="hero-art" src={heroImage} alt="" aria-hidden="true" />
        <div className="hero-date"><span>HOY</span><strong>{new Date().toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })}</strong></div>
      </div>
      {error && <p className="notice error" role="alert">{error}<button className="text-button" onClick={() => { setLoading(true); setReloadKey(key => key + 1); }}>Reintentar</button></p>}
      {loading ? <p className="muted">Cargando tu espacio académico...</p> : (
        <>
          <div className="summary-grid">
            <SummaryCard label="Pendientes" value={pending} tone="blue" icon="○" />
            <SummaryCard label="En proceso" value={inProgress} tone="violet" icon="↻" />
            <SummaryCard label="Completadas" value={completed} tone="green" icon="✓" />
            <SummaryCard label="Vencidas" value={overdue} tone="red" icon="!" />
          </div>
          <div className="dashboard-grid">
            <section className="card dashboard-card">
              <div className="section-heading"><div><p className="eyebrow">ENFOQUE</p><h2>Próximas tareas</h2></div><Link to="/tareas">Ver todas</Link></div>
              {nextTasks.length === 0
                ? <EmptyState title="Todo al día" description="No tienes tareas pendientes por ahora." />
                : nextTasks.map(task => {
                  const days = daysBetweenToday(task.fechaEntrega);
                  const dueLabel = days < 0 ? `Venció hace ${Math.abs(days)} días` : days === 0 ? 'Vence hoy' : `Faltan ${days} días`;
                  return (
                    <article className={`item compact-item ${taskStatusClass(task)}`} key={task.id}>
                      <div className="item-header"><div><strong>{task.titulo}</strong><p className="item-meta">{task.materia}</p></div><span className={`badge ${task.prioridad}`}>{task.prioridad}</span></div>
                      <div className="item-footer"><span className={`due-label ${days < 0 ? 'danger-text' : days < 3 ? 'warning-text' : ''}`}>{dueLabel}</span><span className="item-meta">{formatDateTime(task.fechaEntrega)}</span></div>
                    </article>
                  );
                })}
            </section>
            <section className="card dashboard-card">
              <div className="section-heading"><div><p className="eyebrow">AGENDA</p><h2>Eventos próximos</h2></div><Link to="/eventos">Ver agenda</Link></div>
              {upcomingEvents.length === 0
                ? <EmptyState title="Sin eventos próximos" description="Agrega actividades para tenerlas a la mano." />
                : upcomingEvents.map(event => (
                  <article className="event-row" key={event.id}>
                    <div className="event-date"><strong>{new Date(event.fechaHoraInicio).toLocaleDateString('es-MX', { day: '2-digit' })}</strong><span>{new Date(event.fechaHoraInicio).toLocaleDateString('es-MX', { month: 'short' })}</span></div>
                    <div><strong>{event.titulo}</strong><p className="item-meta">{formatDateTime(event.fechaHoraInicio)} · {event.lugar}</p></div>
                  </article>
                ))}
            </section>
            <section className={`card countdown-card ${countdown?.past ? 'past' : ''}`}>
              <div className="section-heading"><div><p className="eyebrow">TU META</p><h2>Cuenta regresiva</h2></div><Link to="/configuracion">Configurar</Link></div>
              {config && countdown
                ? <div className="countdown"><div className="big">{countdown.display}</div><p>{config.nombreCarrera}</p><p className="muted">Graduación estimada: {new Date(`${config.fechaGraduacionEstimada}T00:00:00`).toLocaleDateString('es-MX', { dateStyle: 'long' })}</p><small>Estimación informativa; puede cambiar según tu trayectoria académica.</small></div>
                : <EmptyState title="Define tu fecha meta" description="Configura tu carrera para ver cuánto falta para tu graduación estimada." />}
            </section>
            <section className="card dashboard-card">
              <div className="section-heading"><div><p className="eyebrow">AVISOS</p><h2>Recordatorios locales</h2></div><Link to="/configuracion">Ver ajustes</Link></div>
              <p className="notice info">Los avisos se revisan mientras UniPlanner está abierto. No son notificaciones push y no se garantizan con la app cerrada.</p>
              {activeReminders.length === 0
                ? <EmptyState title="Sin recordatorios activos" description="Puedes agregar uno al crear o editar una tarea o evento." />
                : activeReminders.map(reminder => <div className="reminder-row" key={reminder.id}><span className="reminder-dot" /><div><strong>{reminder.titulo}</strong><p className="item-meta">{reminder.entidadTipo === 'tarea' ? 'Tarea' : 'Evento'} · {formatDateTime(reminder.fechaHoraAviso)}</p></div></div>)}
            </section>
          </div>
        </>
      )}
    </section>
  );
}

function SummaryCard({ label, value, tone, icon }: { label: string; value: number; tone: string; icon: string }) {
  return <div className={`summary-item ${tone}`}><span className="summary-icon" aria-hidden="true">{icon}</span><div><strong className="value">{value}</strong><span className="label">{label}</span></div></div>;
}
