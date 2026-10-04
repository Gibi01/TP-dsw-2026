import { test, expect } from '@playwright/test';

test('un usuario inicia sesión y recupera su perfil al recargar', async ({ page }) => {
  let autenticado = false;
  const user = { id: 'cuenta-test', name: 'Ana', email: 'ana@test.com', role: 'paciente' };
  const session = { id: 'sesion-test', userId: user.id, expiresAt: new Date(Date.now() + 86400000).toISOString() };
  await page.route('**/api/auth/get-session', (route) => route.fulfill({
    json: autenticado ? { user, session } : null,
  }));
  await page.route('**/api/auth/sign-in/email', async (route) => {
    autenticado = true;
    await route.fulfill({ json: { user, token: 'gestionado-por-better-auth', redirect: false } });
  });
  await page.route('**/api/usuarios/me', (route) => route.fulfill({
    json: { message: 'tu perfil', data: { id: 1, nombre: 'Ana', apellido: 'Test', email: user.email, rol: 'paciente' } },
  }));
  await page.goto('/login');
  await page.getByLabel('Email').fill(user.email);
  await page.getByLabel('Contraseña', { exact: true }).fill('secreta123');
  await page.getByRole('button', { name: 'Ingresar' }).click();
  await expect(page).toHaveURL('http://localhost:5173/');
  await expect(page.getByRole('img', { name: 'Ana Test' })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('img', { name: 'Ana Test' })).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem('token'))).toBeNull();
});

test('muestra un error de validación si el email no tiene formato válido', async ({ page }) => {
  await page.route('**/api/auth/get-session', (route) => route.fulfill({ json: null }));
  await page.goto('/login');
  await page.getByLabel('Email').fill('no-es-un-email');
  await page.getByLabel('Contraseña', { exact: true }).fill('secreta123');
  await page.getByRole('button', { name: 'Ingresar' }).click();
  await expect(page.getByText('Ingresá un email válido.')).toBeVisible();
});
