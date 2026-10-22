import { useState } from 'react';
import { validateTask } from '../../utils/validators';
import { fromLocalInputValue, toLocalInputValue } from '../../utils/dates';
import type { EstadoTarea, Prioridad, Tarea } from '../../types';

export interface TaskFormData {
  titulo: string;
  materia: string;
  descripcion: string;
  fechaEntrega: string;
  prioridad: Prioridad;
  estado: EstadoTarea;
  recordatorio: string;
}

export default function TaskForm({ initial, initialReminder, onSubmit, onCancel }: {
  initial?: Tarea;
  initialReminder?: string;
  onSubmit: (data: TaskFormData) => Promise<void>;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<TaskFormData>({
    titulo: initial?.titulo || '',
    materia: initial?.materia || '',
    descripcion: initial?.descripcion || '',
    fechaEntrega: toLocalInputValue(initial?.fechaEntrega),
    prioridad: initial?.prioridad || 'media',
    estado: initial?.estado || 'pendiente',
    recordatorio: toLocalInputValue(initialReminder)
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const setField = <K extends keyof TaskFormData>(key: K, value: TaskFormData[K]) => {
    setForm(current => ({ ...current, [key]: value }));
  };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validationErrors = validateTask(form);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;
    setSaving(true);
    setSaveError('');
    try {
      await onSubmit({
        ...form,
        titulo: form.titulo.trim(),
        materia: form.materia.trim(),
        descripcion: form.descripcion.trim(),
        fechaEntrega: fromLocalInputValue(form.fechaEntrega),
        recordatorio: fromLocalInputValue(form.recordatorio)
      });
    } catch {
      setSaveError('No se pudo guardar la tarea. Intenta de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="form-grid" onSubmit={submit}>
      <label>Título *
        <input required maxLength={120} value={form.titulo} onChange={event => setField('titulo', event.target.value)} />
        {errors.titulo && <small className="field-error">{errors.titulo}</small>}
      </label>
      <label>Materia *
        <input required maxLength={100} value={form.materia} onChange={event => setField('materia', event.target.value)} />
        {errors.materia && <small className="field-error">{errors.materia}</small>}
      </label>
      <label>Fecha de entrega *
        <input required type="datetime-local" value={form.fechaEntrega} onChange={event => setField('fechaEntrega', event.target.value)} />
        {errors.fechaEntrega && <small className="field-error">{errors.fechaEntrega}</small>}
      </label>
      <div className="form-row">
        <label>Prioridad
          <select value={form.prioridad} onChange={event => setField('prioridad', event.target.value as Prioridad)}>
            <option value="baja">Baja</option><option value="media">Media</option><option value="alta">Alta</option>
          </select>
        </label>
        <label>Estado
          <select value={form.estado} onChange={event => setField('estado', event.target.value as EstadoTarea)}>
            <option value="pendiente">Pendiente</option><option value="en proceso">En proceso</option><option value="completada">Completada</option>
          </select>
        </label>
      </div>
      <label>Descripción
        <textarea rows={3} maxLength={1000} value={form.descripcion} onChange={event => setField('descripcion', event.target.value)} />
      </label>
      <label>Recordatorio local (opcional)
        <input type="datetime-local" value={form.recordatorio} onChange={event => setField('recordatorio', event.target.value)} />
        <small>Solo se intentará mostrar mientras UniPlanner esté abierto y el navegador lo permita.</small>
      </label>
      {saveError && <p className="notice error" role="alert">{saveError}</p>}
      <div className="form-actions">
        <button type="submit" className="btn" disabled={saving}>{saving ? 'Guardando...' : 'Guardar tarea'}</button>
        <button type="button" className="btn ghost" onClick={onCancel}>Cancelar</button>
      </div>
    </form>
  );
}
