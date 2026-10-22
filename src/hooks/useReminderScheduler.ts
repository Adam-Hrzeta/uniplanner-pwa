import { useEffect, useState } from 'react';
import { getDB, STORES } from '../db/database';
import type { Recordatorio } from '../types';

export function useReminderScheduler() {
  const [error, setError] = useState('');

  useEffect(() => {
    let stopped = false;
    let checking = false;

    const check = async () => {
      if (stopped || checking || typeof Notification === 'undefined' || Notification.permission !== 'granted') return;
      checking = true;
      try {
        const db = await getDB();
        const reminders = await db.getAllFromIndex(STORES.REMINDERS, 'estado', 'pendiente') as Recordatorio[];
        const now = Date.now();
        for (const reminder of reminders) {
          if (stopped) return;
          if (!reminder.habilitado || new Date(reminder.fechaHoraAviso).getTime() > now) continue;
          const attempt = new Date().toISOString();
          try {
            new Notification('UniPlanner — Recordatorio', {
              body: reminder.titulo || 'Tienes un recordatorio pendiente',
              icon: '/icon-192.png',
              tag: reminder.id
            });
            await db.put(STORES.REMINDERS, {
              ...reminder, estado: 'procesado', ultimoIntento: attempt
            });
          } catch {
            await db.put(STORES.REMINDERS, {
              ...reminder, estado: 'error', ultimoIntento: attempt
            });
            setError(`No se pudo mostrar el recordatorio “${reminder.titulo}”. Revisa el permiso del navegador.`);
          }
        }
      } catch {
        setError('No se pudieron revisar los recordatorios guardados en este dispositivo.');
      } finally {
        checking = false;
      }
    };

    void check();
    const timer = window.setInterval(() => { void check(); }, 30000);
    return () => { stopped = true; window.clearInterval(timer); };
  }, []);

  return error;
}
