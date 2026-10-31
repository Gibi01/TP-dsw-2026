import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  const user = { id: 'cuenta-test', name: 'Ana', email: 'ana@test.com', role: 'paciente' };
  await page.route('**/api/auth/get-session', (route) => route.fulfill({ json: {
    user, session: { id: 'sesion-test', userId: user.id, expiresAt: new Date(Date.now() + 86400000).toISOString() },
  } }));
  await page.route('**/api/usuarios/me', (route) => route.fulfill({ json: { data: {
    id: 1, nombre: 'Ana', apellido: 'Test', email: user.email, rol: 'paciente',
  } } }));
  await page.route('**/api/motivos-cancelacion', (route) => route.fulfill({ json: { data: [] } }));
  await page.route('**/api/turnos/mios', (route) => route.fulfill({ json: { data: [
    { id: 1, doctor: { nombre: 'Ana', apellido: 'Martínez' }, estado: 'asistido', fechaHoraTurno: '2026-09-01T12:00:00Z', obraSocial: null },
    { id: 2, doctor: { nombre: 'Pablo', apellido: 'López' }, estado: 'pendiente', fechaHoraTurno: '2027-10-12T12:00:00Z', obraSocial: null },
    { id: 3, doctor: { nombre: 'Lucía', apellido: 'Fernández' }, estado: 'cancelado', fechaHoraTurno: '2026-10-01T12:00:00Z', obraSocial: null, motivoCancelacion: 'Cambio de planes' },
  ] } }));
});

test('filtra estados, ordena fechas y conserva la cancelación del turno seleccionado', async ({ page }) => {
  await page.goto('/mis-turnos');
  const filas = page.getByRole('list', { name: 'Listado de turnos' }).getByRole('listitem');
  await expect(filas).toHaveCount(3);
  await expect(filas.nth(0)).toContainText('Pablo López');
  await expect(filas.nth(2)).toContainText('Ana Martínez');
  await page.getByRole('combobox', { name: 'Ordenar por' }).click();
  await page.getByRole('option', { name: 'Antiguos a más recientes' }).click();
  await expect(filas.nth(0)).toContainText('Ana Martínez');
  await expect(filas.nth(2)).toContainText('Pablo López');
  for (const [estado, nombre] of [['Cancelados', 'Lucía Fernández'], ['Asistidos', 'Ana Martínez'], ['Pendientes', 'Pablo López']]) {
    await page.getByRole('button', { name: estado, exact: true }).click();
    await expect(filas).toHaveCount(1);
    await expect(filas).toContainText(nombre);
  }
  let idCancelado = '';
  await page.route('**/api/turnos/2/cancelar', (route) => {
    idCancelado = route.request().url();
    return route.fulfill({ json: { data: {} } });
  });
  await page.getByRole('button', { name: 'Cancelar turno', exact: true }).click();
  await page.getByRole('button', { name: 'Confirmar cancelación' }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  expect(idCancelado).toContain('/turnos/2/cancelar');
});

test('mantiene el filtro desde Inicio y la navbar visible al desplazarse en móvil', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 600 });
  await page.goto('/mis-turnos?pendientes=1');
  await expect(page.getByRole('combobox', { name: 'Estado', exact: true })).toHaveText('Pendientes');
  await expect(page.getByRole('listitem')).toHaveCount(1);
  await page.getByRole('combobox', { name: 'Estado', exact: true }).click();
  await page.getByRole('option', { name: 'Todos', exact: true }).click();
  await expect(page.getByRole('listitem')).toHaveCount(3);
  await expect(page.getByRole('listbox')).toHaveCount(0);
  await page.screenshot({ path: testInfo.outputPath('mis-turnos-mobile.png'), fullPage: true, animations: 'disabled' });
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await expect(page.getByRole('banner')).toBeInViewport();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});
