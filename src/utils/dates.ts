const pad = (n: number) => String(n).padStart(2, '0');

function parseLocalDate(value: string): Date {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split('-').map(Number);
    return new Date(year, month - 1, day);
  }
  return new Date(value);
}

export function toLocalInputValue(iso?: string): string {
  if (!iso) return '';
  const d = parseLocalDate(iso);
  if (Number.isNaN(d.getTime())) return '';
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function toLocalDateInputValue(iso?: string): string {
  if (!iso) return '';
  const d = parseLocalDate(iso);
  if (Number.isNaN(d.getTime())) return '';
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function fromLocalInputValue(str: string): string {
  if (!str) return '';
  const date = new Date(str);
  return Number.isNaN(date.getTime()) ? '' : date.toISOString();
}

export function formatDateTime(iso?: string): string {
  if (!iso) return '';
  const date = parseLocalDate(iso);
  if (Number.isNaN(date.getTime())) return 'Fecha no válida';
  return date.toLocaleString('es-MX', { dateStyle: 'medium', ...(iso.length > 10 ? { timeStyle: 'short' as const } : {}) });
}

export function formatDate(iso?: string): string {
  if (!iso) return '';
  const date = parseLocalDate(iso);
  return Number.isNaN(date.getTime()) ? 'Fecha no válida' : date.toLocaleDateString('es-MX', { dateStyle: 'medium' });
}

export function daysBetweenToday(dateIso: string): number {
  const today = new Date();
  const target = parseLocalDate(dateIso);
  if (Number.isNaN(target.getTime())) return Number.NaN;
  const todayUtc = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  const targetUtc = Date.UTC(target.getFullYear(), target.getMonth(), target.getDate());
  return Math.round((targetUtc - todayUtc) / 86400000);
}

export function taskStatusClass(task: { estado: string; fechaEntrega: string }): string {
  if (task.estado === 'completada') return 'completed';
  const days = daysBetweenToday(task.fechaEntrega);
  if (Number.isNaN(days)) return '';
  if (days < 0) return 'overdue';
  if (days <= 2) return 'soon';
  return '';
}

export function computeCountdown(fechaGraduacion?: string, unit: string = 'dias') {
  if (!fechaGraduacion) return null;
  const days = daysBetweenToday(fechaGraduacion);
  if (Number.isNaN(days)) return null;
  if (days < 0) {
    return { past: true, days, display: `La fecha estimada ya pasó hace ${Math.abs(days)} días` };
  }
  if (unit === 'dias') return { past: false, days, display: `${days} días` };
  if (unit === 'semanas') {
    const w = Math.floor(days / 7);
    const r = days % 7;
    return { past: false, days, display: `${w} semanas y ${r} días` };
  }
  const months = Math.floor(days / 30.4375);
  const rest = days - Math.round(months * 30.4375);
  return { past: false, days, display: `≈ ${months} meses y ${rest} días`, approx: true };
}