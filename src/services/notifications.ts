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