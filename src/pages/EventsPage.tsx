import { useEffect, useMemo, useState } from 'react';
import ConfirmDialog from '../components/ConfirmDialog';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';
import { deleteEvent, createEvent, listEvents, updateEvent } from '../db/eventsRepo';
import { deleteReminder, listReminders, saveReminder } from '../db/remindersRepo';
import EventForm, { type EventFormData } from '../features/events/EventForm';
import type { Evento, Recordatorio } from '../types';
import { formatDateTime } from '../utils/dates';

type EventView = 'upcoming' | 'history';

export default function EventsPage() {
  const [events, setEvents] = useState<Evento[]>([]);
  const [reminders, setReminders] = useState<Recordatorio[]>([]);
  const [view, setView] = useState<EventView>('upcoming');
  const [editing, setEditing] = useState<Evento>();
  const [toDelete, setToDelete] = useState<Evento>();
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const [now, setNow] = useState(0);

  useEffect(() => {
    let active = true;
    Promise.all([listEvents(), listReminders()])
      .then(([eventList, reminderList]) => {
        if (!active) return;
        eventList.sort((a, b) => a.fechaHoraInicio.localeCompare(b.fechaHoraInicio));
        setEvents(eventList);
        setReminders(reminderList.filter(reminder => reminder.entidadTipo === 'evento'));
        setNow(Date.now());
        setError('');
      })
      .catch(() => { if (active) setError('No se pudieron cargar tus eventos desde el almacenamiento local.'); });
    return () => { active = false; };
  }, [reloadKey]);

  const filtered = useMemo(() => events
    .filter(event => view === 'upcoming'
      ? new Date(event.fechaHoraInicio).getTime() >= now
      : new Date(event.fechaHoraInicio).getTime() < now)
    .sort((a, b) => view === 'upcoming'
      ? a.fechaHoraInicio.localeCompare(b.fechaHoraInicio)
      : b.fechaHoraInicio.localeCompare(a.fechaHoraInicio)), [events, now, view]);

  const getReminder = (eventId: string) => reminders.find(reminder => reminder.entidadId === eventId && reminder.habilitado)?.fechaHoraAviso;

  const handleSave = async (data: EventFormData) => {
    const { recordatorio, ...eventData } = data;
    const event = editing ? await updateEvent(editing.id, eventData) : await createEvent(eventData);
    if (recordatorio) {
      await saveReminder({
        entidadTipo: 'evento', entidadId: event.id, titulo: event.titulo,
        fechaHoraAviso: recordatorio, habilitado: true
      });
    } else {
      await deleteReminder('evento', event.id);
    }
    setIsOpen(false);
    setEditing(undefined);
    setReloadKey(key => key + 1);
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    try {
      await deleteEvent(toDelete.id);
      setToDelete(undefined);
      setReloadKey(key => key + 1);
    } catch {
      setError('No se pudo eliminar el evento. Intenta de nuevo.');
    }
  };

  return (
    <section className="page-stack">
      <div className="page-heading">
        <div><p className="eyebrow">VIDA UNIVERSITARIA</p><h1>Eventos</h1><p>Organiza actividades académicas y de tu comunidad.</p></div>
        <button className="btn" onClick={() => { setEditing(undefined); setIsOpen(true); }}>+ Nuevo evento</button>
      </div>
      {error && <p className="notice error" role="alert">{error}</p>}
      <section className="card">
        <div className="section-heading">
          <div><h2>{view === 'upcoming' ? 'Próximos eventos' : 'Historial de eventos'}</h2><p>{filtered.length} eventos registrados</p></div>
          <div className="segmented-control" aria-label="Vista de eventos">
            <button className={view === 'upcoming' ? 'selected' : ''} onClick={() => setView('upcoming')}>Próximos</button>
            <button className={view === 'history' ? 'selected' : ''} onClick={() => setView('history')}>Historial</button>
          </div>
        </div>
        {filtered.length === 0
          ? <EmptyState title={view === 'upcoming' ? 'No hay eventos próximos' : 'El historial está vacío'} description="Los eventos que registres aquí son personales; no representan publicaciones oficiales verificadas." />
          : filtered.map(event => (
            <article key={event.id} className="item event-item">
              <div className="event-date"><strong>{new Date(event.fechaHoraInicio).toLocaleDateString('es-MX', { day: '2-digit' })}</strong><span>{new Date(event.fechaHoraInicio).toLocaleDateString('es-MX', { month: 'short' })}</span></div>
              <div className="event-content">
                <div className="item-header">
                  <div><span className="item-title">{event.titulo}</span><p className="item-meta">{formatDateTime(event.fechaHoraInicio)} · {event.lugar}</p></div>
                  <div className="badge-group"><span className="badge event-type">{event.tipo}</span><span className="badge source-badge">{event.fuente === 'personal' ? 'Personal' : 'Fuente indicada como institucional'}</span></div>
                </div>
                {event.descripcion && <p className="item-description">{event.descripcion}</p>}
                {getReminder(event.id) && <p className="item-meta">Recordatorio: {formatDateTime(getReminder(event.id))} · Local mientras la app esté abierta</p>}
                <div className="item-actions">
                  <button className="btn small ghost" onClick={() => { setEditing(event); setIsOpen(true); }}>Editar</button>
                  <button className="btn small danger" onClick={() => setToDelete(event)}>Eliminar</button>
                </div>
              </div>
            </article>
          ))}
      </section>
      <Modal open={isOpen} title={editing ? 'Editar evento' : 'Nuevo evento'} onClose={() => setIsOpen(false)}>
        <EventForm key={editing?.id || 'new-event'} initial={editing} initialReminder={editing ? getReminder(editing.id) : undefined} onSubmit={handleSave} onCancel={() => setIsOpen(false)} />
      </Modal>
      <ConfirmDialog open={!!toDelete} title="Eliminar evento" message={`¿Quieres eliminar “${toDelete?.titulo ?? ''}”? Esta acción también elimina su recordatorio.`} onConfirm={() => void handleDelete()} onCancel={() => setToDelete(undefined)} />
    </section>
  );
}
