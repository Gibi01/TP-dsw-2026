import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.route('**/api/auth/get-session', (route) => route.fulfill({ json: null }));
});

for (const ruta of ['/mis-turnos', '/perfil', '/mi-agenda', '/mis-turnos/atender', '/admin/carga', '/admin/modificar']) {
  test(`sin sesión, ${ruta} redirige al registro`, async ({ page }) => {
    await page.goto(ruta);
    await expect(page).toHaveURL(/\/registro$/);
    await expect(page.getByRole('button', { name: 'Registrarme' })).toBeVisible();
  });
}

for (const tipo of ['doctor', 'especialidad']) {
  test(`reservar por ${tipo} sin sesión redirige al registro sin crear un turno`, async ({ page }) => {
    const doctor = { matricula: 1, nombre: 'Ana', apellido: 'Test', foto: '/avatares-doctores/mistral.png', especialidades: [] };
    const horario = new Date();
    horario.setHours(10, 0, 0, 0);
    let reservas = 0;
    await page.route('**/api/doctores/1', (route) => route.fulfill({ json: { data: doctor } }));
    await page.route('**/api/obras-sociales', (route) => route.fulfill({ json: { data: [] } }));
    await page.route('**/api/turnos/**', (route) => {
      const path = new URL(route.request().url()).pathname;
      const data = path.includes('disponibilidad-mes') ? []
        : path.includes('disponibilidad-especialidad') ? [{ fechaHoraTurno: horario.toISOString(), doctor }]
        : [horario.toISOString()];
      return route.fulfill({ json: { data } });
    });
    await page.route('**/api/turnos', (route) => {
      reservas += 1;
      return route.fulfill({ status: 401, json: { message: 'Sin sesión' } });
    });
    await page.goto(tipo === 'doctor' ? '/doctores/1' : '/especialidades/1/turnos');
    await page.getByRole('button', { name: '10:00', exact: true }).click();
    if (tipo === 'especialidad') {
      const avatar = page.getByRole('dialog').getByRole('img', { name: 'Ana Test' });
      await expect(avatar).toHaveAttribute('src', doctor.foto);
      await expect.poll(() => avatar.evaluate((img: HTMLImageElement) => img.naturalWidth)).toBeGreaterThan(0);
      await page.getByRole('button', { name: 'Dr./Dra. Ana Test' }).click();
    }
    await expect(page).toHaveURL(/\/registro$/);
    await expect(page.getByText('Creá una cuenta para reservar un turno.')).toBeVisible();
    expect(reservas).toBe(0);
  });
}
