export const TASK_DUE_NOTIFICATION_THRESHOLDS = [10, 5, 1] as const;

export function getTaskDueNotificationThreshold(
  dueAt: string | number,
  now = Date.now(),
  sentThresholds: readonly number[] = []
): number | null {
  const dueTime = typeof dueAt === 'string' ? new Date(dueAt).getTime() : Number(dueAt);
  if (!Number.isFinite(dueTime)) return null;

  const remainingMs = dueTime - now;
  if (remainingMs <= 0 || remainingMs > 10 * 60 * 1000) return null;

  const eligibleThresholds = TASK_DUE_NOTIFICATION_THRESHOLDS.filter(
    threshold => remainingMs <= threshold * 60 * 1000 && !sentThresholds.includes(threshold)
  );

  return eligibleThresholds.length > 0 ? Math.max(...eligibleThresholds) : null;
}

export function getTaskDueNotificationMessage(taskTitle: string, thresholdMinutes: number): string {
  const label = thresholdMinutes === 1 ? 'minuto' : 'minutos';
  return `La tarea “${taskTitle}” vence en ${thresholdMinutes} ${label}.`;
}

export async function requestNotificationPermission(): Promise<NotificationPermission | 'unsupported'> {
  if (typeof Notification === 'undefined') return 'unsupported';
  if (Notification.permission === 'granted') return 'granted';
  if (Notification.permission === 'denied') return 'denied';
  return await Notification.requestPermission();
}

export function showTestNotification() {
  if (typeof Notification === 'undefined') throw new Error('Notificaciones no compatibles');
  if (Notification.permission !== 'granted') throw new Error('El permiso de notificaciones no está concedido');
  new Notification('UniPlanner — Prueba', {
    body: 'Las notificaciones locales están activas.',
    icon: '/icon-192.png'
  });
}