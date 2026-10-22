import { useEffect, useState } from 'react';
import { getCareerConfig, saveCareerConfig } from '../db/careerRepo';
import { requestNotificationPermission, showTestNotification } from '../services/notifications';
import type { ConfiguracionCarrera, UnidadVisualizacion } from '../types';
import { toLocalDateInputValue } from '../utils/dates';
import { validateCareer } from '../utils/validators';

type CareerForm = {
  nombreCarrera: string;
  fechaInicio: string;
  fechaGraduacionEstimada: string;
  unidadVisualizacion: UnidadVisualizacion;
  duracionEstimada: string;
  unidadDuracion: NonNullable<ConfiguracionCarrera['unidadDuracion']>;
};

const emptyForm: CareerForm = {
  nombreCarrera: '', fechaInicio: '', fechaGraduacionEstimada: '',
  unidadVisualizacion: 'dias', duracionEstimada: '', unidadDuracion: 'cuatrimestres'
};

function currentPermission(): NotificationPermission | 'unsupported' {
  return typeof Notification === 'undefined' ? 'unsupported' : Notification.permission;
}

export default function SettingsPage() {
  const [form, setForm] = useState<CareerForm>(emptyForm);
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>(currentPermission);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    getCareerConfig().then(config => {
      if (!active || !config) return;
      setForm({
        nombreCarrera: config.nombreCarrera,
        fechaInicio: toLocalDateInputValue(config.fechaInicio),
        fechaGraduacionEstimada: toLocalDateInputValue(config.fechaGraduacionEstimada),
        unidadVisualizacion: config.unidadVisualizacion,
        duracionEstimada: config.duracionEstimada ? String(config.duracionEstimada) : '',
        unidadDuracion: config.unidadDuracion || 'cuatrimestres'
      });
    }).catch(() => {
      if (active) setError('No se pudo leer la configuración guardada.');
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, []);

  const save = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validationErrors = validateCareer(form);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length) return;
    const duration = form.duracionEstimada ? Number(form.duracionEstimada) : undefined;
    if (duration !== undefined && (!Number.isInteger(duration) || duration < 1 || duration > 100)) {
      setErrors({ duracionEstimada: 'Ingresa una duración entera entre 1 y 100.' });
      return;
    }
    setSaving(true);
    setError('');
    setNotice('');
    try {
      await saveCareerConfig({
        nombreCarrera: form.nombreCarrera.trim(),
        fechaInicio: form.fechaInicio,
        fechaGraduacionEstimada: form.fechaGraduacionEstimada,
        unidadVisualizacion: form.unidadVisualizacion,
        duracionEstimada: duration,
        unidadDuracion: duration ? form.unidadDuracion : undefined
      });
      setNotice('Tu configuración académica quedó guardada en este dispositivo.');
    } catch {
      setError('No se pudo guardar la configuración. Revisa el almacenamiento del navegador e inténtalo de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  const askPermission = async () => {
    setError('');
    try {
      const result = await requestNotificationPermission();
      setPermission(result);
      setNotice(result === 'granted' ? 'Permiso concedido. Los recordatorios locales solo se intentan mientras la aplicación está abierta.' : result === 'denied' ? 'El permiso fue denegado. Puedes seguir consultando tus avisos dentro de la aplicación.' : 'Este navegador no admite notificaciones.');
    } catch {
      setError('El navegador no pudo solicitar el permiso de notificaciones.');
    }
  };

  const testNotification = () => {
    try {
      showTestNotification();
      setNotice('Se envió una notificación local de prueba.');
      setError('');
    } catch {
      setError('No se pudo mostrar la notificación. Verifica el permiso y la compatibilidad del navegador.');
    }
  };

  return (
    <section className="page-stack">
      <div className="page-heading">
        <div><p className="eyebrow">PERSONALIZA TU EXPERIENCIA</p><h1>Configuración</h1><p>Administra tu información académica y los avisos locales.</p></div>
      </div>
      {(error || notice) && <p className={`notice ${error ? 'error' : 'success'}`} role={error ? 'alert' : 'status'}>{error || notice}</p>}
      <div className="settings-grid">
        <section className="card">
          <div className="section-heading"><div><h2>Mi carrera</h2><p>La fecha de egreso es una estimación personal, no una confirmación oficial.</p></div></div>
          {loading ? <p className="muted">Cargando configuración...</p> : (
            <form className="form-grid" onSubmit={save}>
              <label>Nombre de la carrera *
                <input required maxLength={120} value={form.nombreCarrera} onChange={event => setForm(current => ({ ...current, nombreCarrera: event.target.value }))} />
                {errors.nombreCarrera && <small className="field-error">{errors.nombreCarrera}</small>}
              </label>
              <div className="form-row">
                <label>Fecha de inicio *
                  <input required type="date" value={form.fechaInicio} onChange={event => setForm(current => ({ ...current, fechaInicio: event.target.value }))} />
                  {errors.fechaInicio && <small className="field-error">{errors.fechaInicio}</small>}
                </label>
                <label>Graduación estimada *
                  <input required type="date" value={form.fechaGraduacionEstimada} onChange={event => setForm(current => ({ ...current, fechaGraduacionEstimada: event.target.value }))} />
                  {errors.fechaGraduacionEstimada && <small className="field-error">{errors.fechaGraduacionEstimada}</small>}
                </label>
              </div>
              <div className="form-row">
                <label>Duración estimada (opcional)
                  <input type="number" min="1" max="100" step="1" value={form.duracionEstimada} onChange={event => setForm(current => ({ ...current, duracionEstimada: event.target.value }))} />
                  {errors.duracionEstimada && <small className="field-error">{errors.duracionEstimada}</small>}
                </label>
                <label>Unidad
                  <select value={form.unidadDuracion} onChange={event => setForm(current => ({ ...current, unidadDuracion: event.target.value as CareerForm['unidadDuracion'] }))}>
                    <option value="cuatrimestres">Cuatrimestres</option><option value="semestres">Semestres</option><option value="años">Años</option>
                  </select>
                </label>
              </div>
              <label>Mostrar cuenta regresiva en
                <select value={form.unidadVisualizacion} onChange={event => setForm(current => ({ ...current, unidadVisualizacion: event.target.value as UnidadVisualizacion }))}>
                  <option value="dias">Días naturales</option><option value="semanas">Semanas</option><option value="meses">Meses aproximados</option>
                </select>
              </label>
              <div className="form-actions"><button className="btn" type="submit" disabled={saving}>{saving ? 'Guardando...' : 'Guardar configuración'}</button></div>
            </form>
          )}
        </section>
        <section className="card">
          <div className="section-heading"><div><h2>Notificaciones</h2><p>UniPlanner no cuenta con un servidor de Web Push.</p></div></div>
          <div className="permission-row"><span>Permiso del navegador</span><strong className={`permission ${permission}`}>{permission}</strong></div>
          {permission === 'default' && <button className="btn" onClick={() => void askPermission()}>Activar notificaciones locales</button>}
          {permission === 'granted' && <button className="btn ghost" onClick={testNotification}>Enviar notificación de prueba</button>}
          {permission === 'denied' && <p className="notice warning">El permiso está bloqueado en el navegador. Actívalo desde la configuración del sitio si quieres probarlo.</p>}
          {permission === 'unsupported' && <p className="notice warning">Este navegador no ofrece la API de notificaciones. Tus avisos siguen disponibles en el dashboard.</p>}
          <p className="muted">Los recordatorios se guardan localmente y solo se revisan mientras la app está abierta. No se garantiza un aviso con la app cerrada, y esto no es una notificación push real.</p>
        </section>
      </div>
    </section>
  );
}
