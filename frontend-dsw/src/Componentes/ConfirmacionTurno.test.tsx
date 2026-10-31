import { afterEach, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import ConfirmacionTurno from './ConfirmacionTurno';

const navegar = vi.fn();
vi.mock('react-router-dom', () => ({ useNavigate: () => navegar }));
const props = {
  doctor: { matricula: 1, nombre: 'Ana', apellido: 'Test', especialidades: [{ idEspecialidad: 1, descripcionEsp: 'Clínica médica' }] },
  horario: '2026-10-13T13:00:00Z', obrasSociales: [{ id: 2, nombre: 'OSDE' }], obraSocialId: 2,
  cargandoObrasSociales: false, reservando: false, confirmado: false, error: null,
  onObraSocial: vi.fn(), onConfirmar: vi.fn(), onCancelar: vi.fn(),
};
afterEach(() => { vi.useRealTimers(); vi.clearAllMocks(); });

it('elige cobertura en el mismo diálogo y bloquea controles mientras reserva', () => {
  const { rerender } = render(<ConfirmacionTurno {...props} />);
  expect(screen.getAllByRole('dialog')).toHaveLength(1);
  expect(screen.getByRole('combobox')).toHaveTextContent('OSDE');
  fireEvent.click(screen.getByRole('button', { name: 'Confirmar' }));
  expect(props.onConfirmar).toHaveBeenCalledTimes(1);
  rerender(<ConfirmacionTurno {...props} reservando />);
  expect(screen.getByRole('combobox')).toHaveAttribute('aria-disabled', 'true');
  expect(screen.getByRole('button', { name: 'Reservando…' })).toBeDisabled();
  expect(screen.getByRole('button', { name: 'Cancelar' })).toBeDisabled();
  expect(screen.queryByText('¡Tu turno está confirmado!')).not.toBeInTheDocument();
  fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape', code: 'Escape' });
  expect(props.onCancelar).not.toHaveBeenCalled();
});

it('conserva la cobertura y permite reintentar si falla la reserva', () => {
  render(<ConfirmacionTurno {...props} error="No se pudo reservar el turno." />);
  expect(screen.getByRole('alert')).toHaveTextContent('No se pudo reservar el turno.');
  expect(screen.getByRole('combobox')).toHaveTextContent('OSDE');
  expect(screen.getByRole('button', { name: 'Confirmar' })).toBeEnabled();
  expect(navegar).not.toHaveBeenCalled();
});

it('muestra el éxito y la cobertura antes de redirigir a los dos segundos', () => {
  vi.useFakeTimers();
  render(<ConfirmacionTurno {...props} confirmado />);
  expect(screen.getByRole('heading')).toHaveTextContent('¡Tu turno está confirmado!');
  expect(screen.getByText('OSDE')).toBeVisible();
  expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
  act(() => { vi.advanceTimersByTime(1999); });
  expect(navegar).not.toHaveBeenCalled();
  act(() => { vi.advanceTimersByTime(1); });
  expect(navegar).toHaveBeenCalledWith('/mis-turnos');
});

it('permite avanzar inmediatamente y limpia el temporizador al salir', () => {
  vi.useFakeTimers();
  const { unmount } = render(<ConfirmacionTurno {...props} confirmado />);
  fireEvent.click(screen.getByRole('button', { name: 'Ver mis turnos' }));
  expect(navegar).toHaveBeenCalledTimes(1);
  unmount();
  act(() => { vi.advanceTimersByTime(2000); });
  expect(navegar).toHaveBeenCalledTimes(1);
});
