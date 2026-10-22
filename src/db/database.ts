import { openDB } from 'idb';
import type { IDBPDatabase } from 'idb';

const DB_NAME = 'uniplanner-db';
const DB_VERSION = 1;

export const STORES = {
  TASKS: 'tasks',
  EVENTS: 'events',
  REMINDERS: 'reminders',
  CAREER: 'career'
};

let dbPromise: Promise<IDBPDatabase> | null = null;

export function getDB() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORES.TASKS)) {
          const s = db.createObjectStore(STORES.TASKS, { keyPath: 'id' });
          s.createIndex('fechaEntrega', 'fechaEntrega');
          s.createIndex('estado', 'estado');
          s.createIndex('materia', 'materia');
        }
        if (!db.objectStoreNames.contains(STORES.EVENTS)) {
          const s = db.createObjectStore(STORES.EVENTS, { keyPath: 'id' });
          s.createIndex('fechaHoraInicio', 'fechaHoraInicio');
          s.createIndex('tipo', 'tipo');
        }
        if (!db.objectStoreNames.contains(STORES.REMINDERS)) {
          const s = db.createObjectStore(STORES.REMINDERS, { keyPath: 'id' });
          s.createIndex('entidadId', 'entidadId');
          s.createIndex('fechaHoraAviso', 'fechaHoraAviso');
          s.createIndex('estado', 'estado');
        }
        if (!db.objectStoreNames.contains(STORES.CAREER)) {
          db.createObjectStore(STORES.CAREER, { keyPath: 'id' });
        }
      }
    });
  }
  return dbPromise;
}

export const newId = () => crypto.randomUUID();