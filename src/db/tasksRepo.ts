import { getDB, STORES, newId } from './database';
import type { Tarea } from '../types';

export async function listTasks(): Promise<Tarea[]> {
  const db = await getDB();
  return db.getAll(STORES.TASKS);
}

export async function createTask(data: Omit<Tarea, 'id' | 'creadoEn' | 'actualizadoEn'>): Promise<Tarea> {
  const db = await getDB();
  const now = new Date().toISOString();
  const task: Tarea = { ...data, id: newId(), creadoEn: now, actualizadoEn: now };
  await db.put(STORES.TASKS, task);
  return task;
}

export async function updateTask(id: string, patch: Partial<Tarea>): Promise<Tarea> {
  const db = await getDB();
  const existing = await db.get(STORES.TASKS, id);
  if (!existing) throw new Error('Tarea no encontrada');
  const updated = { ...existing, ...patch, id, actualizadoEn: new Date().toISOString() };
  await db.put(STORES.TASKS, updated);
  return updated;
}

export async function deleteTask(id: string): Promise<void> {
  const db = await getDB();
  const tx = db.transaction([STORES.TASKS, STORES.REMINDERS], 'readwrite');
  await tx.objectStore(STORES.TASKS).delete(id);
  const rems = await tx.objectStore(STORES.REMINDERS).index('entidadId').getAll(id);
  for (const r of rems) {
    if (r.entidadTipo === 'tarea') await tx.objectStore(STORES.REMINDERS).delete(r.id);
  }
  await tx.done;
}