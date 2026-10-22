export async function requestNotificationPermission() {
  if (!('Notification' in window)) return 'unsupported';
  if (Notification.permission === 'granted') return 'granted';
  if (Notification.permission === 'denied') return 'denied';
  return await Notification.requestPermission();
}

export function showTestNotification() {
  if (Notification.permission === 'granted') {
    new Notification('UniPlanner — Prueba', {
      body: 'Las notificaciones locales están activas.',
      icon: '/icons/icon-192.png'
    });
  }
}