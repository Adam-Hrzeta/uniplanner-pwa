import { getDB, STORES } from './database';
import type { ConfiguracionCarrera } from '../types';

const SINGLE_ID = 'career-config';

export async function getCareerConfig(): Promise<ConfiguracionCarrera | undefined> {
  const db = await getDB();
  return db.get(STORES.CAREER, SINGLE_ID);
}

export async function saveCareerConfig(data: Omit<ConfiguracionCarrera, 'id' | 'actualizadoEn'>): Promise<ConfiguracionCarrera> {
  const db = await getDB();
  const cfg: ConfiguracionCarrera = { ...data, id: SINGLE_ID, actualizadoEn: new Date().toISOString() };
  await db.put(STORES.CAREER, cfg);
  return cfg;
}