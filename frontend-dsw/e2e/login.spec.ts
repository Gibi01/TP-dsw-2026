import { test, expect } from "@playwright/test";

// Mockea la respuesta del backend (POST /auth/login) para no depender de una base de datos
// real levantada: lo que se ejercita acá es el circuito completo del navegador -> formulario
// -> Servicios/authService -> Contextos/AuthContext -> React Router, tal como lo usaría un
// usuario real.
test("un usuario inicia sesión y ve su nombre en la barra de navegación", async ({ page }) => {
  await page.route("**/api/auth/login", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        message: "ok",
        data: {
          token: "token-de-test",
          usuario: {
            id: 1,
            nombre: "Ana",
            apellido: "Test",
            email: "ana@test.com",
            rol: "paciente",
          },
        },
      }),
    });
  });

  await page.goto("/login");
  await page.getByLabel("Email").fill("ana@test.com");
  await page.getByLabel("Contraseña", { exact: true }).fill("secreta123");
  await page.getByRole("button", { name: "Ingresar" }).click();

  await expect(page).toHaveURL("http://localhost:5173/");
  await expect(page.getByRole("img", { name: "Ana Test" })).toBeVisible();
});

test("muestra un error de validación si el email no tiene formato válido", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Email").fill("no-es-un-email");
  await page.getByLabel("Contraseña", { exact: true }).fill("secreta123");
  await page.getByRole("button", { name: "Ingresar" }).click();

  await expect(page.getByText("Ingresá un email válido.")).toBeVisible();
});
