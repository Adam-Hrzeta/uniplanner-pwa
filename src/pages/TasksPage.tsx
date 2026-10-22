import { useEffect, useMemo, useState } from 'react';
import ConfirmDialog from '../components/ConfirmDialog';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';
import TaskForm, { type TaskFormData } from '../features/tasks/TaskForm';
import { deleteReminder, listReminders, saveReminder } from '../db/remindersRepo';
import { createTask, deleteTask, listTasks, updateTask } from '../db/tasksRepo';
import type { EstadoTarea, Recordatorio, Tarea } from '../types';
import { daysBetweenToday, formatDateTime, taskStatusClass } from '../utils/dates';

export default function TasksPage() {
  const [tasks, setTasks] = useState<Tarea[]>([]);
  const [reminders, setReminders] = useState<Recordatorio[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState<Tarea>();
  const [toDelete, setToDelete] = useState<Tarea>();
  const [subject, setSubject] = useState('');
  const [status, setStatus] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    Promise.all([listTasks(), listReminders()])
      .then(([taskList, reminderList]) => {
        if (!active) return;
        taskList.sort((a, b) => a.fechaEntrega.localeCompare(b.fechaEntrega));
        setTasks(taskList);
        setReminders(reminderList.filter(reminder => reminder.entidadTipo === 'tarea'));
        setError('');
      })
      .catch(() => { if (active) setError('No se pudieron cargar tus tareas desde el almacenamiento local.'); });
    return () => { active = false; };
  }, [reloadKey]);

  const subjects = useMemo(() => [...new Set(tasks.map(task => task.materia))].sort((a, b) => a.localeCompare(b, 'es')), [tasks]);
  const filteredTasks = useMemo(() => tasks.filter(task => {
    const matchesSubject = !subject || task.materia === subject;
    const isOverdue = task.estado !== 'completada' && daysBetweenToday(task.fechaEntrega) < 0;
    const matchesStatus = !status || (status === 'vencida' ? isOverdue : task.estado === status);
    const matchesDate = !dueDate || task.fechaEntrega.slice(0, 10) === dueDate;
    return matchesSubject && matchesStatus && matchesDate;
  }), [dueDate, status, subject, tasks]);

  const handleSave = async (data: TaskFormData) => {
    const { recordatorio, ...taskData } = data;
    const task = editing
      ? await updateTask(editing.id, taskData)
      : await createTask(taskData);
    if (recordatorio) {
      await saveReminder({
        entidadTipo: 'tarea', entidadId: task.id, titulo: task.titulo,
        fechaHoraAviso: recordatorio, habilitado: true
      });
    } else {
      await deleteReminder('tarea', task.id);
    }
    setIsOpen(false);
    setEditing(undefined);
    setReloadKey(key => key + 1);
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    try {
      await deleteTask(toDelete.id);
      setToDelete(undefined);
      setReloadKey(key => key + 1);
    } catch {
      setError('No se pudo eliminar la tarea. Intenta de nuevo.');
    }
  };

  const changeStatus = async (task: Tarea) => {
    const nextStatus: EstadoTarea = task.estado === 'completada' ? 'pendiente' : 'completada';
    try {
      await updateTask(task.id, { estado: nextStatus });
      setReloadKey(key => key + 1);
    } catch {
      setError('No se pudo actualizar el estado de la tarea.');
    }
  };

  const openNew = () => { setEditing(undefined); setIsOpen(true); };
  const getReminder = (taskId: string) => reminders.find(reminder => reminder.entidadId === taskId && reminder.habilitado)?.fechaHoraAviso;

  return (
    <section className="page-stack">
      <div className="page-heading">
        <div><p className="eyebrow">ORGANIZACIÓN ACADÉMICA</p><h1>Mis tareas</h1><p>Revisa entregas, prioridades y avances de tus materias.</p></div>
        <button className="btn" onClick={openNew}>+ Nueva tarea</button>
      </div>
      {error && <p className="notice error" role="alert">{error}</p>}
      <section className="card">
        <div className="section-heading"><div><h2>Lista de tareas</h2><p>{filteredTasks.length} de {tasks.length} actividades</p></div></div>
        <div className="filters" aria-label="Filtros de tareas">
          <label>Materia
            <select value={subject} onChange={event => setSubject(event.target.value)}>
              <option value="">Todas las materias</option>
              {subjects.map(item => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>
          <label>Estado
            <select value={status} onChange={event => setStatus(event.target.value)}>
              <option value="">Todos los estados</option><option value="pendiente">Pendiente</option>
              <option value="en proceso">En proceso</option><option value="completada">Completada</option>
              <option value="vencida">Vencida</option>
            </select>
          </label>
          <label>Fecha de entrega
            <input type="date" value={dueDate} onChange={event => setDueDate(event.target.value)} />
          </label>
          {(subject || status || dueDate) && <button className="btn ghost small" onClick={() => { setSubject(''); setStatus(''); setDueDate(''); }}>Limpiar filtros</button>}
        </div>
        {filteredTasks.length === 0
          ? <EmptyState title={tasks.length ? 'No hay resultados' : 'Aún no tienes tareas'} description={tasks.length ? 'Prueba con otros filtros.' : 'Agrega tu primera entrega para empezar a organizarte.'} />
          : filteredTasks.map(task => {
            const days = daysBetweenToday(task.fechaEntrega);
            const overdue = task.estado !== 'completada' && days < 0;
            return (
              <article key={task.id} className={`item task-item ${taskStatusClass(task)}`}>
                <div className="item-header">
                  <div><span className="item-title">{task.titulo}</span><p className="item-meta">{task.materia} · Entrega: {formatDateTime(task.fechaEntrega)}</p></div>
                  <div className="badge-group">
                    {overdue && <span className="badge estado-vencida">Vencida</span>}
                    <span className={`badge ${task.prioridad}`}>{task.prioridad}</span>
                    <span className={`badge estado-${task.estado.replace(' ', '-')}`}>{task.estado}</span>
                  </div>
                </div>
                {task.descripcion && <p className="item-description">{task.descripcion}</p>}
                {getReminder(task.id) && <p className="item-meta">Recordatorio: {formatDateTime(getReminder(task.id))} · Local mientras la app esté abierta</p>}
                <div className="item-actions">
                  <button className="btn small ghost" onClick={() => { setEditing(task); setIsOpen(true); }}>Editar</button>
                  <button className="btn small ghost" onClick={() => void changeStatus(task)}>{task.estado === 'completada' ? 'Reabrir' : 'Marcar completada'}</button>
                  <button className="btn small danger" onClick={() => setToDelete(task)}>Eliminar</button>
                </div>
              </article>
            );
          })}
      </section>
      <Modal open={isOpen} title={editing ? 'Editar tarea' : 'Nueva tarea'} onClose={() => setIsOpen(false)}>
        <TaskForm key={editing?.id || 'new-task'} initial={editing} initialReminder={editing ? getReminder(editing.id) : undefined} onSubmit={handleSave} onCancel={() => setIsOpen(false)} />
      </Modal>
      <ConfirmDialog open={!!toDelete} title="Eliminar tarea" message={`¿Quieres eliminar “${toDelete?.titulo ?? ''}”? Esta acción también elimina su recordatorio.`} onConfirm={() => void handleDelete()} onCancel={() => setToDelete(undefined)} />
    </section>
  );
}
