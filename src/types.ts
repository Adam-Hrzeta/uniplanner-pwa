export type Prioridad = 'baja' | 'media' | 'alta';
export type EstadoTarea = 'pendiente' | 'en proceso' | 'completada';

export interface Tarea {
  id: string;
  titulo: string;
  materia: string;
  descripcion?: string;
  fechaEntrega: string; // ISO 8601
  prioridad: Prioridad;
  estado: EstadoTarea;
  creadoEn: string;
  actualizadoEn: string;
}

export type TipoEvento = 'academico' | 'cultural' | 'deportivo' | 'administrativo' | 'otro';

export interface Evento {
  id: string;
  titulo: string;
  tipo: TipoEvento;
  fechaHoraInicio: string;
  lugar: string;
  descripcion?: string;
  fuente: 'personal' | 'institucional';
  creadoEn: string;
  actualizadoEn: string;
}

export interface Recordatorio {
  id: string;
  entidadTipo: 'tarea' | 'evento';
  entidadId: string;
  titulo: string;
  fechaHoraAviso: string;
  canal: 'local';
  estado: 'pendiente' | 'procesado' | 'cancelado' | 'error';
  habilitado: boolean;
  ultimoIntento: string | null;
}

export type UnidadVisualizacion = 'dias' | 'semanas' | 'meses';

export interface ConfiguracionCarrera {
  id: string;
  nombreCarrera: string;
  fechaInicio: string;
  fechaGraduacionEstimada: string;
  unidadVisualizacion: UnidadVisualizacion;
  duracionEstimada?: number;
  unidadDuracion?: 'cuatrimestres' | 'semestres' | 'años';
  actualizadoEn: string;
}