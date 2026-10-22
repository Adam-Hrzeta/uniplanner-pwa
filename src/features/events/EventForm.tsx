import { useState } from 'react';
import type { Evento, TipoEvento } from '../../types';
import { fromLocalInputValue, toLocalInputValue } from '../../utils/dates';
import { validateEvent } from '../../utils/validators';

export interface EventFormData {
  titulo: string;
  tipo: TipoEvento;
  fechaHoraInicio: string;
  lugar: string;
  descripcion: string;
  fuente: Evento['fuente'];
  recordatorio: string;
}

export default function EventForm({ initial, initialReminder, onSubmit, onCancel }: {
  initial?: Evento;
  initialReminder?: string;
  onSubmit: (data: EventFormData) => Promise<void>;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<EventFormData>({
    titulo: initial?.titulo || '',
    tipo: initial?.tipo || 'academico',
    fechaHoraInicio: toLocalInputValue(initial?.fechaHoraInicio),
    lugar: initial?.lugar || '',
    descripcion: initial?.descripcion || '',
    fuente: initial?.fuente || 'personal',
    recordatorio: toLocalInputValue(initialReminder)
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saveError, setSaveError] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validationErrors = validateEvent(form);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;
    setSaving(true);
    setSaveError('');
    try {
      await onSubmit({
        ...form,
        titulo: form.titulo.trim(),
        lugar: form.lugar.trim(),
        descripcion: form.descripcion.trim(),
        fechaHoraInicio: fromLocalInputValue(form.fechaHoraInicio),
        recordatorio: fromLocalInputValue(form.recordatorio)
      });
    } catch {
      setSaveError('No se pudo guardar el evento. Intenta de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="form-grid" onSubmit={submit}>
      <label>Título *
        <input required maxLength={120} value={form.titulo} onChange={event => setForm(current => ({ ...current, titulo: event.target.value }))} />
        {errors.titulo && <small className="field-error">{errors.titulo}</small>}
      </label>
      <div className="form-row">
        <label>Tipo *
          <select value={form.tipo} onChange={event => setForm(current => ({ ...current, tipo: event.target.value as TipoEvento }))}>
            <option value="academico">Académico</option><option value="cultural">Cultural</option>
            <option value="deportivo">Deportivo</option><option value="administrativo">Administrativo</option>
            <option value="otro">Otro</option>
          </select>
        </label>
        <label>Fuente del registro
          <select value={form.fuente} onChange={event => setForm(current => ({ ...current, fuente: event.target.value as Evento['fuente'] }))}>
            <option value="personal">Personal</option><option value="institucional">Institucional</option>
          </select>
          <small>La fuente institucional solo identifica el origen que indiques; no verifica información oficial.</small>
        </label>
      </div>
      <label>Fecha y hora *
        <input required type="datetime-local" value={form.fechaHoraInicio} onChange={event => setForm(current => ({ ...current, fechaHoraInicio: event.target.value }))} />
        {errors.fechaHoraInicio && <small className="field-error">{errors.fechaHoraInicio}</small>}
      </label>
      <label>Lugar *
        <input required maxLength={160} value={form.lugar} onChange={event => setForm(current => ({ ...current, lugar: event.target.value }))} />
        {errors.lugar && <small className="field-error">{errors.lugar}</small>}
      </label>
      <label>Descripción
        <textarea rows={3} maxLength={1000} value={form.descripcion} onChange={event => setForm(current => ({ ...current, descripcion: event.target.value }))} />
      </label>
      <label>Recordatorio local (opcional)
        <input type="datetime-local" value={form.recordatorio} onChange={event => setForm(current => ({ ...current, recordatorio: event.target.value }))} />
        <small>Solo se intentará mostrar mientras UniPlanner esté abierto y el navegador lo permita.</small>
      </label>
      {saveError && <p className="notice error" role="alert">{saveError}</p>}
      <div className="form-actions">
        <button type="submit" className="btn" disabled={saving}>{saving ? 'Guardando...' : 'Guardar evento'}</button>
        <button type="button" className="btn ghost" onClick={onCancel}>Cancelar</button>
      </div>
    </form>
  );
}
