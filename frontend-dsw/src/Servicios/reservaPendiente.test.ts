// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest';
import { borrarReservaPendiente, destinoTrasAutenticacion, guardarReservaPendiente, leerReservaPendiente } from './reservaPendiente';

const reserva = { ruta: '/doctores/1', fecha: '2026-10-13', doctorId: 1, horario: '2026-10-13T13:00:00Z', obraSocialId: 2 };
afterEach(() => { sessionStorage.clear(); vi.useRealTimers(); });

it('recupera las selecciones solamente en la ruta correspondiente', () => {
  guardarReservaPendiente(reserva);
  expect(leerReservaPendiente('/especialidades/2/turnos')).toBeNull();
  expect(leerReservaPendiente('/doctores/1')).toMatchObject(reserva);
  expect(destinoTrasAutenticacion()).toBe(reserva.ruta);
});

it('descarta el borrador después de 30 minutos', () => {
  vi.useFakeTimers();
  guardarReservaPendiente(reserva);
  vi.advanceTimersByTime(30 * 60 * 1000);
  expect(leerReservaPendiente()).toBeNull();
  expect(destinoTrasAutenticacion()).toBe('/');
});

it('descarta datos corruptos y permite borrar explícitamente la selección', () => {
  sessionStorage.setItem('reserva-pendiente', '{');
  expect(leerReservaPendiente()).toBeNull();
  guardarReservaPendiente(reserva);
  borrarReservaPendiente();
  expect(leerReservaPendiente()).toBeNull();
});

it.each(['https://otro.com', '//otro.com', '/\\otro.com', '/login', '/registro'])('rechaza el destino %s', destino => {
  expect(destinoTrasAutenticacion(destino)).toBe('/');
});

it('respeta una ruta privada de regreso', () => {
  expect(destinoTrasAutenticacion('/mis-turnos')).toBe('/mis-turnos');
});
