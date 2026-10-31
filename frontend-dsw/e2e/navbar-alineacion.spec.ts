import { test, expect } from '@playwright/test';

for (const rol of ['invitado', 'paciente', 'doctor', 'admin']) {
  for (const width of [320, 390, 1024, 1200, 1335, 1440]) {
    test(`navbar centrado para ${rol} a ${width}px`, async ({ page }, testInfo) => {
      await page.setViewportSize({ width, height: 900 });
      await page.route('**/api/auth/get-session', route => route.fulfill({ json: rol === 'invitado' ? null : {
        user: { id: 'test', role: rol }, session: { id: 'sesion', userId: 'test', expiresAt: '2030-01-01' },
      } }));
      await page.route('**/api/usuarios/me', route => route.fulfill({ json: { data: { id: 1, nombre: 'Ana', apellido: 'Test', rol } } }));
      await page.route('**/api/especialidades?conMedicosActivos=true', route => route.fulfill({ json: { data: [] } }));
      await page.goto('/');
      const banner = page.getByRole('banner');
      await expect(banner.getByRole('button', { name: rol === 'invitado' ? 'Iniciar sesión' : 'Ana Test', exact: true })).toBeVisible();
      const bounds = (await banner.boundingBox())!;
      const centro = bounds.y + bounds.height / 2;
      const logo = banner.getByRole('link', { name: 'HOSPITAL RIPPER' }).filter({ visible: true });
      const cajaLogo = (await logo.boundingBox())!;
      expect(Math.abs(cajaLogo.y + cajaLogo.height / 2 - centro)).toBeLessThan(2);
      const avatar = (await banner.getByRole('button', { name: rol === 'invitado' ? 'Iniciar sesión' : 'Ana Test', exact: true }).boundingBox())!;
      expect(Math.abs(avatar.y + avatar.height / 2 - centro)).toBeLessThan(2);
      if (width >= 1200) {
        const nav = banner.getByRole('navigation', { name: 'Navegación principal' });
        const botones = nav.locator('a, button');
        for (const boton of await botones.all()) {
          const b = (await boton.boundingBox())!;
          expect(Math.abs(b.y + b.height / 2 - centro)).toBeLessThan(2);
          expect(b.height).toBe(48);
        }
        const cajaNav = (await nav.boundingBox())!;
        const primero = (await botones.first().boundingBox())!;
        const ultimo = (await botones.last().boundingBox())!;
        expect(Math.abs((primero.x + ultimo.x + ultimo.width) / 2 - (cajaNav.x + cajaNav.width / 2))).toBeLessThan(2);
        expect(ultimo.x + ultimo.width).toBeLessThan(avatar.x);
        if (rol === 'doctor') {
          const boton = nav.getByRole('button', { name: 'Mis turnos' });
          const b = (await boton.boundingBox())!;
          const flecha = (await boton.locator('svg').boundingBox())!;
          expect(Math.abs(flecha.y + flecha.height / 2 - (b.y + b.height / 2))).toBeLessThan(2);
          await boton.click();
          await expect(page.getByRole('menuitem', { name: 'Turnos con pacientes' })).toBeVisible();
          await page.keyboard.press('Escape');
        }
      } else {
        expect(Math.abs(cajaLogo.x + cajaLogo.width / 2 - width / 2)).toBeLessThan(2);
        await banner.getByRole('button', { name: 'Abrir menú de navegación' }).click();
        await expect(page.getByRole('menuitem', { name: rol === 'admin' ? 'Ver usuarios' : rol === 'doctor' ? 'Mi agenda' : 'Especialidades', exact: true })).toBeVisible();
        await page.keyboard.press('Escape');
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      if (width === 1335 || width === 390) await banner.screenshot({ path: testInfo.outputPath(`navbar-${rol}-${width}.png`) });
    });
  }
}
