import { getDB, STORES, newId } from './database';
import type { Evento } from '../types';

export async function listEvents(): Promise<Evento[]> {
  const db = await getDB();
  return db.getAll(STORES.EVENTS);
}

export async function createEvent(data: Omit<Evento, 'id' | 'creadoEn' | 'actualizadoEn'>): Promise<Evento> {
  const db = await getDB();
  const now = new Date().toISOString();
  const ev: Evento = { ...data, id: newId(), creadoEn: now, actualizadoEn: now };
  await db.put(STORES.EVENTS, ev);
  return ev;
}

export async function updateEvent(id: string, patch: Partial<Evento>): Promise<Evento> {
  const db = await getDB();
  const existing = await db.get(STORES.EVENTS, id);
  if (!existing) throw new Error('Evento no encontrado');
  const updated = { ...existing, ...patch, id, actualizadoEn: new Date().toISOString() };
  await db.put(STORES.EVENTS, updated);
  return updated;
}

export async function deleteEvent(id: string): Promise<void> {
  const db = await getDB();
  const tx = db.transaction([STORES.EVENTS, STORES.REMINDERS], 'readwrite');
  await tx.objectStore(STORES.EVENTS).delete(id);
  const rems = await tx.objectStore(STORES.REMINDERS).index('entidadId').getAll(id);
  for (const r of rems) {
    if (r.entidadTipo === 'evento') await tx.objectStore(STORES.REMINDERS).delete(r.id);
  }
  await tx.done;
}