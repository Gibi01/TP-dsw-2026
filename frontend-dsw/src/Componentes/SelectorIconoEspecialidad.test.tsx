import { useState } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { expect, it } from 'vitest';
import SelectorIconoEspecialidad from './SelectorIconoEspecialidad';
import IconoEspecialidad from './IconoEspecialidad';

it('permite elegir un icono y actualizar la vista previa', () => {
  function Formulario() {
    const [valor, setValor] = useState('medicina');
    return <SelectorIconoEspecialidad valor={valor} onChange={setValor} nombre="Cardiología" />;
  }
  render(<Formulario />);
  expect(screen.getByRole('radio', { name: 'Medicina general' })).toBeChecked();
  fireEvent.change(screen.getByLabelText('Buscar icono por especialidad'), { target: { value: 'cardiologia' } });
  fireEvent.click(screen.getByRole('radio', { name: 'Cardiología' }));
  expect(screen.getByRole('radio', { name: 'Cardiología' })).toBeChecked();
  fireEvent.change(screen.getByLabelText('Buscar icono por especialidad'), { target: { value: 'xxxx' } });
  expect(screen.getByText(/No hay coincidencias/)).toBeVisible();
  expect(screen.getByText('Cardiología')).toBeVisible();
});

it('muestra el icono general para datos antiguos o identificadores desconocidos', () => {
  const { rerender, container } = render(<IconoEspecialidad />);
  expect(container.querySelector('[data-icono="medicina"]')).toBeInTheDocument();
  rerender(<IconoEspecialidad icono="desconocido" />);
  expect(container.querySelector('[data-icono="medicina"]')).toBeInTheDocument();
});
