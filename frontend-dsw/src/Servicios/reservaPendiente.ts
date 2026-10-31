const CLAVE = 'reserva-pendiente';
const DURACION = 30 * 60 * 1000;

export interface ReservaPendiente {
  ruta: string;
  fecha: string;
  doctorId: number;
  horario: string;
  obraSocialId: number | 'sin-obra-social' | '';
}

export function borrarReservaPendiente(): void {
  try { sessionStorage.removeItem(CLAVE); } catch { /* El navegador puede bloquear el almacenamiento. */ }
}

export function guardarReservaPendiente(reserva: ReservaPendiente): void {
  try {
    sessionStorage.setItem(CLAVE, JSON.stringify({ ...reserva, venceEn: Date.now() + DURACION }));
  } catch { /* La reserva actual puede continuar aunque no se pueda persistir. */ }
}

export function leerReservaPendiente(ruta?: string): ReservaPendiente | null {
  try {
    const valor = JSON.parse(sessionStorage.getItem(CLAVE) ?? 'null');
    if (!valor) return null;
    if (!Number.isFinite(valor.venceEn) || valor.venceEn <= Date.now()
      || typeof valor.ruta !== 'string' || !/^\/(doctores\/\d+|especialidades\/\d+\/turnos)$/.test(valor.ruta)
      || typeof valor.fecha !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(valor.fecha)
      || !Number.isInteger(valor.doctorId) || valor.doctorId <= 0
      || typeof valor.horario !== 'string' || !Number.isFinite(Date.parse(valor.horario))
      || !(valor.obraSocialId === '' || valor.obraSocialId === 'sin-obra-social'
        || (Number.isInteger(valor.obraSocialId) && valor.obraSocialId > 0))) {
      borrarReservaPendiente();
      return null;
    }
    return ruta && valor.ruta !== ruta ? null : valor;
  } catch {
    borrarReservaPendiente();
    return null;
  }
}

export function destinoTrasAutenticacion(from?: string): string {
  // Aceptar únicamente rutas locales, nunca URLs externas ni las pantallas de autenticación.
  if (from && /^\/(?!\/)[\w/-]*(?:\?[^\\#]*)?(?:#[^\\]*)?$/.test(from)
    && !/^\/(login|registro)(?:[/?#]|$)/.test(from)) return from;
  return leerReservaPendiente()?.ruta ?? '/';
}
