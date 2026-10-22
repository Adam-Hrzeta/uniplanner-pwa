import { getDB, STORES, newId } from './database';
import type { Recordatorio } from '../types';

export async function listReminders(): Promise<Recordatorio[]> {
  const db = await getDB();
  return db.getAll(STORES.REMINDERS);
}

export async function saveReminder(data: Pick<Recordatorio, 'entidadTipo' | 'entidadId' | 'titulo' | 'fechaHoraAviso' | 'habilitado'>): Promise<Recordatorio> {
  const db = await getDB();
  const all = await db.getAll(STORES.REMINDERS);
  const existing = all.find(r => r.entidadTipo === data.entidadTipo && r.entidadId === data.entidadId);
  
  const reminder: Recordatorio = {
    id: existing?.id || newId(),
    entidadTipo: data.entidadTipo,
    entidadId: data.entidadId,
    titulo: data.titulo,
    fechaHoraAviso: data.fechaHoraAviso,
    canal: 'local',
    estado: data.habilitado ? 'pendiente' : 'cancelado',
    habilitado: !!data.habilitado,
    ultimoIntento: null
  };
  await db.put(STORES.REMINDERS, reminder);
  return reminder;
}

export async function deleteReminder(entidadTipo: Recordatorio['entidadTipo'], entidadId: string): Promise<void> {
  const db = await getDB();
  const all = await db.getAll(STORES.REMINDERS);
  const reminder = all.find(item => item.entidadTipo === entidadTipo && item.entidadId === entidadId);
  if (reminder) await db.delete(STORES.REMINDERS, reminder.id);
}