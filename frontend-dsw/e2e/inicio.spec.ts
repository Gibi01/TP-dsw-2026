import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.route('**/api/auth/get-session', route => route.fulfill({ json: null }));
  await page.route('**/api/especialidades?conMedicosActivos=true', route => route.fulfill({ json: { data:
    Array.from({ length: 7 }, (_, i) => ({ idEspecialidad: i + 1, descripcionEsp: `Especialidad ${i + 1}`, icono: 'corazon' }))
  } }));
});

for (const width of [320, 390, 1440]) {
  test(`inicio completo, enlaces y contacto a ${width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Tu próxima consulta, más simple.');
    const especialidades = page.getByRole('region', { name: 'Encontrá tu especialidad' });
    await expect(especialidades.getByRole('link', { name: /^Especialidad \d/ })).toHaveCount(6);
    await expect(especialidades.getByRole('link', { name: 'Especialidad 1', exact: true })).toHaveAttribute('href', '/especialidades/1/turnos');
    await expect(page.getByRole('link', { name: 'Reservar un turno', exact: true })).toHaveAttribute('href', '/reserva');
    await expect(page.getByRole('link', { name: 'Ver mis turnos', exact: true })).toHaveAttribute('href', '/mis-turnos?pendientes=1');
    const imagen = page.getByRole('img', { name: 'Raiden vestido de médico atiende a un paciente en el consultorio' });
    await expect(imagen).toBeVisible();
    await expect.poll(() => imagen.evaluate((el: HTMLImageElement) => el.naturalWidth)).toBeGreaterThan(0);
    await expect(page.getByRole('link', { name: /Cómo llegar/ })).toHaveAttribute('href', /query=Rostok%2C%20La%20Zona/);
    await page.getByRole('button', { name: /Consultar por teléfono/ }).click();
    await expect(page.getByRole('dialog')).toContainText('011-0000-0000');
    await expect(page.getByRole('dialog')).toContainText('Número ficticio');
    await page.getByRole('button', { name: 'Cerrar contacto' }).click();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({ path: testInfo.outputPath(`inicio-${width}.png`), fullPage: true });
  });
}

test('el inicio conserva los accesos cuando no hay especialidades o falla la carga', async ({ page }) => {
  await page.route('**/api/especialidades?conMedicosActivos=true', route => route.fulfill({ json: { data: [] } }));
  await page.goto('/');
  await expect(page.getByRole('alert')).toContainText('Por el momento no hay especialidades disponibles.');
  await page.route('**/api/especialidades?conMedicosActivos=true', route => route.fulfill({ status: 500, json: {} }));
  await page.reload();
  await expect(page.getByRole('alert')).toContainText('No pudimos cargar las especialidades.');
  await page.getByRole('link', { name: 'Reservar un turno', exact: true }).click();
  await expect(page).toHaveURL(/\/reserva$/);
});
