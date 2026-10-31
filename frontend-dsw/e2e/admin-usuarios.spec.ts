import { test, expect } from '@playwright/test';

const usuarios = [
  { id: 1, nombre: 'Álvaro', apellido: 'Pérez', email: 'alvaro@example.com', rol: 'doctor', activo: false, fechaAlta: '2024-01-01T12:00:00Z' },
  { id: 2, nombre: 'Ana', apellido: 'García', email: 'ana@example.com', rol: 'paciente', activo: true, fechaAlta: '2025-02-01T12:00:00Z' },
  { id: 3, nombre: 'Zoe', apellido: 'López', email: 'zoe@example.com', rol: 'admin', activo: true, fechaAlta: '2026-02-01T12:00:00Z' },
];

test.beforeEach(async ({ page }) => {
  await page.route('**/api/auth/get-session', route => route.fulfill({ json: { user: { id: 'admin', role: 'admin' }, session: { id: 'session', userId: 'admin', expiresAt: '2030-01-01' } } }));
  await page.route('**/api/usuarios/me', route => route.fulfill({ json: { data: { id: 9, nombre: 'Admin', apellido: 'Test', rol: 'admin' } } }));
  await page.route('**/api/usuarios/listado', route => route.fulfill({ json: { data: usuarios } }));
});

test('navega desde el menú y combina búsqueda, rol, estado y orden', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await page.getByRole('link', { name: 'Ver usuarios' }).click();
  await expect(page.getByRole('heading', { name: 'Ver usuarios' })).toBeVisible();
  const filas = page.getByRole('table').getByRole('row');
  await expect(filas.nth(1)).toContainText('Zoe');
  await page.getByRole('combobox', { name: 'Ordenar por' }).click();
  await page.getByRole('option', { name: 'Nombre (A–Z)' }).click();
  await expect(filas.nth(1)).toContainText('Álvaro');
  await page.getByRole('textbox', { name: 'Buscar por nombre o apellido' }).fill('  PEREZ  ');
  await page.getByRole('combobox', { name: 'Rol', exact: true }).click();
  await page.getByRole('option', { name: 'Médico' }).click();
  await page.getByRole('combobox', { name: 'Estado', exact: true }).click();
  await page.getByRole('option', { name: 'Dado de baja' }).click();
  await expect(filas).toHaveCount(2);
  await expect(filas.nth(1)).toContainText('Álvaro');
  await page.getByRole('textbox').fill('inexistente');
  await expect(page.getByText('No se encontraron usuarios con estos filtros.')).toBeVisible();
  await page.getByRole('button', { name: 'Limpiar filtros' }).click();
  await expect(filas).toHaveCount(4);
});

test('en móvil pagina sin desbordar y reinicia la página al filtrar', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.route('**/api/usuarios/listado', route => route.fulfill({ json: { data: Array.from({ length: 12 }, (_, i) => ({ ...usuarios[i % 3], id: i + 1 })) } }));
  await page.goto('/admin/usuarios');
  await expect(page.getByRole('article')).toHaveCount(10);
  await page.getByRole('button', { name: 'Página siguiente' }).click();
  await expect(page.getByRole('article')).toHaveCount(2);
  await page.getByRole('textbox').fill('alvaro');
  await expect(page.getByRole('article')).toHaveCount(4);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: testInfo.outputPath('usuarios-mobile.png'), fullPage: true });
});

test('muestra el error y permite reintentar', async ({ page }) => {
  let falla = true;
  await page.route('**/api/usuarios/listado', route => falla
    ? route.fulfill({ status: 500, json: { message: 'Error' } })
    : route.fulfill({ json: { data: usuarios } }));
  await page.goto('/admin/usuarios');
  await expect(page.getByRole('alert')).toContainText('No se pudieron cargar');
  falla = false;
  await page.getByRole('button', { name: 'Reintentar' }).click();
  await expect(page.getByText('3 de 3 usuarios')).toBeVisible();
});

test('un paciente no tiene enlace ni acceso directo', async ({ page }) => {
  await page.route('**/api/usuarios/me', route => route.fulfill({ json: { data: { id: 9, nombre: 'Paciente', apellido: 'Test', rol: 'paciente' } } }));
  await page.goto('/admin/usuarios');
  await expect(page).toHaveURL('http://localhost:5173/');
  await expect(page.getByRole('link', { name: 'Ver usuarios' })).toHaveCount(0);
});
