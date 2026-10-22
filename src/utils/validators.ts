import type { ConfiguracionCarrera, Evento, Tarea } from '../types';

export function validateTask(form: Pick<Tarea, 'titulo' | 'materia' | 'fechaEntrega'>) {
  const errors: Record<string, string> = {};
  if (!form.titulo.trim()) errors.titulo = 'El título es obligatorio';
  if (!form.materia.trim()) errors.materia = 'La materia es obligatoria';
  if (!form.fechaEntrega || Number.isNaN(new Date(form.fechaEntrega).getTime())) errors.fechaEntrega = 'Ingresa una fecha de entrega válida';
  return errors;
}

export function validateEvent(form: Pick<Evento, 'titulo' | 'tipo' | 'fechaHoraInicio' | 'lugar'>) {
  const errors: Record<string, string> = {};
  if (!form.titulo.trim()) errors.titulo = 'El título es obligatorio';
  if (!form.tipo) errors.tipo = 'El tipo es obligatorio';
  if (!form.fechaHoraInicio || Number.isNaN(new Date(form.fechaHoraInicio).getTime())) errors.fechaHoraInicio = 'Ingresa una fecha válida';
  if (!form.lugar.trim()) errors.lugar = 'El lugar es obligatorio';
  return errors;
}

export function validateCareer(form: Pick<ConfiguracionCarrera, 'nombreCarrera' | 'fechaInicio' | 'fechaGraduacionEstimada'>) {
  const errors: Record<string, string> = {};
  if (!form.nombreCarrera.trim()) errors.nombreCarrera = 'El nombre es obligatorio';
  if (!form.fechaInicio || Number.isNaN(new Date(`${form.fechaInicio}T00:00:00`).getTime())) errors.fechaInicio = 'Ingresa una fecha válida';
  if (!form.fechaGraduacionEstimada || Number.isNaN(new Date(`${form.fechaGraduacionEstimada}T00:00:00`).getTime())) errors.fechaGraduacionEstimada = 'Ingresa una fecha estimada válida';
  if (form.fechaInicio && form.fechaGraduacionEstimada) {
    if (new Date(`${form.fechaGraduacionEstimada}T00:00:00`) <= new Date(`${form.fechaInicio}T00:00:00`)) {
      errors.fechaGraduacionEstimada = 'Debe ser posterior al inicio';
    }
  }
  return errors;
}