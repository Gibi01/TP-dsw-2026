import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.route('**/api/auth/get-session', (route) => route.fulfill({ json: null }));
});

test('el registro exitoso inicia sesión sin pedir otro login', async ({ page }) => {
  let autenticado = false;
  const perfil = { id: 1, nombre: 'Ana', apellido: 'Test', email: 'ana@test.com', rol: 'paciente' };
  await page.route('**/api/auth/get-session', route => route.fulfill({ json: autenticado ? {
    user: { id: 'ana', name: 'Ana', email: perfil.email },
    session: { id: 'sesion', userId: 'ana', expiresAt: new Date(Date.now() + 86400000).toISOString() },
  } : null }));
  await page.route('**/api/usuarios/me', route => route.fulfill({ json: { data: perfil } }));
  await page.route('**/api/usuarios', (route) => {
    autenticado = true;
    return route.fulfill({ json: { data: perfil } });
  });
  await page.goto('/registro');
  await page.getByLabel('Nombre', { exact: true }).fill('Ana');
  await page.getByLabel('Apellido', { exact: true }).fill('Test');
  await page.getByLabel('DNI', { exact: true }).fill('12345678');
  await page.getByLabel('Email', { exact: true }).fill('ana@test.com');
  await page.getByLabel('Contraseña', { exact: true }).fill('12345678');
  await page.getByLabel('Confirmar contraseña', { exact: true }).fill('12345678');
  await page.getByRole('button', { name: 'Registrarme', exact: true }).click();
  await expect(page).toHaveURL('http://localhost:5173/');
  await expect(page.getByRole('img', { name: 'Ana Test' })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('img', { name: 'Ana Test' })).toBeVisible();
});

test('busca especialidades sin distinguir mayúsculas ni tildes y permite elegir un resultado', async ({ page }) => {
  await page.route('**/api/especialidades{,?conMedicosActivos=true}', (route) => route.fulfill({ json: { data: [
    { idEspecialidad: 1, descripcionEsp: 'Clínica médica' },
    { idEspecialidad: 2, descripcionEsp: 'Traumatología' },
    { idEspecialidad: 3, descripcionEsp: 'Cardiología' },
  ] } }));
  const solicitud = page.waitForRequest(req => req.url().includes('/api/especialidades?conMedicosActivos=true'));
  await page.goto('/reserva');
  await solicitud;
  const busqueda = page.getByRole('textbox', { name: 'Buscar especialidad por nombre' });
  await busqueda.fill('  CLINICA  ');
  await expect(page.getByRole('button', { name: 'Clínica médica', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Traumatología', exact: true })).toHaveCount(0);
  await busqueda.fill('sin coincidencias');
  await expect(page.getByText('No se encontraron especialidades con ese nombre.')).toBeVisible();
  await busqueda.fill('');
  await expect(page.getByRole('button', { name: 'Traumatología', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Cardiología', exact: true }).click();
  await expect(page).toHaveURL(/\/especialidades\/3\/turnos$/);
});
