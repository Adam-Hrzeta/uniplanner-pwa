import { useEffect, useState } from 'react';
import { getDB, STORES } from '../db/database';
import type { Recordatorio, Tarea } from '../types';
import {
  getTaskDueNotificationMessage,
  getTaskDueNotificationThreshold
} from '../services/notifications';

export function useReminderScheduler() {
  const [error, setError] = useState('');

  useEffect(() => {
    let stopped = false;
    let checking = false;
    const sentDueTaskThresholds = new Set<string>();

    const check = async () => {
      if (stopped || checking || typeof Notification === 'undefined' || Notification.permission !== 'granted') return;
      checking = true;
      try {
        const db = await getDB();
        const reminders = await db.getAllFromIndex(STORES.REMINDERS, 'estado', 'pendiente') as Recordatorio[];
        const tasks = await db.getAll(STORES.TASKS) as Tarea[];
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

        for (const task of tasks) {
          if (stopped || task.estado === 'completada') continue;

          const threshold = getTaskDueNotificationThreshold(
            task.fechaEntrega,
            now,
            Array.from(sentDueTaskThresholds)
              .filter(key => key.startsWith(`${task.id}:`))
              .map(key => Number(key.split(':').at(-1)))
              .filter((value): value is number => Number.isFinite(value))
          );

          if (threshold === null) continue;

          const notificationKey = `${task.id}:${threshold}`;
          if (sentDueTaskThresholds.has(notificationKey)) continue;

          new Notification('UniPlanner — Tarea por vencer', {
            body: getTaskDueNotificationMessage(task.titulo, threshold),
            icon: '/icon-192.png',
            tag: notificationKey,
            requireInteraction: true
          });

          sentDueTaskThresholds.add(notificationKey);
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
