# Migración a Better Auth

Implementada el 1 de octubre de 2026 en la rama `codex/better-auth`.

## Alcance acordado

Proyecto de facultad sin producción ni datos que conservar. Reinicio de la base local, sin importación de usuarios ni hashes antiguos. Email/contraseña, scrypt predeterminado de Better Auth y sesiones de 24 horas desde el ingreso, sin renovación automática. Roles paciente, doctor y admin; se conservan los controles de propiedad de turnos y agendas. Resend sigue a cargo de las notificaciones de turnos. Recuperación de contraseña, OAuth, MFA y organizaciones quedan fuera de esta migración.

## Implementación

1. Crear la rama y conservar los cambios previos del workspace.
2. Instalar Better Auth 1.7.7 en Express y React. Usar su adaptador MySQL con `mysql2`, sin desarrollar un adaptador MikroORM.
3. Crear `auth_user`, `auth_account`, `auth_session` y `auth_verification`. Vincular cada identidad a `Usuario.authUserId`, manteniendo el ID numérico para las relaciones existentes. Retirar `Usuario.password`.
4. Proteger las tablas `auth_*` del generador de MikroORM. Separar la preparación del esquema y el reinicio destructivo en comandos explícitos; no borrar usuarios al iniciar el servidor.
5. Montar el handler de Better Auth antes de `express.json`. Sustituir Bearer JWT por cookies, consultar el rol desde Better Auth y conservar las verificaciones de dueño. Validar el origen de solicitudes que modifican recursos.
6. Enviar registro, alta de doctor y cambios de identidad/rol a las APIs de Better Auth. Sincronizar el perfil mediante hooks. Impedir eliminar cuentas vinculadas a doctores o turnos. Crear el primer admin mediante un comando local.
7. Usar `/api` en el frontend y el proxy de Vite hacia `localhost:3000`. Recuperar la sesión al cargar la aplicación, esperar antes de redirigir rutas protegidas y cerrar la sesión en el servidor. Retirar las credenciales anteriores de localStorage.
8. Adaptar las suites existentes, sumar solo dos casos de integración para sincronización/roles y vencimiento/cierre, ejecutar los builds y recorrer la aplicación con los tres roles.

## Decisiones de configuración

- Abrir siempre `http://localhost:5173`. No alternar con `127.0.0.1`: son orígenes diferentes y no comparten cookies.
- Vite y Express siguen siendo dos procesos, en 5173 y 3000 respectivamente. El navegador solicita la API al mismo origen del frontend; Vite la reenvía al backend.
- `APP_ORIGIN` es el origen público confiable, sin `/api`. Better Auth usa `/api/auth` como prefijo.
- La sesión dura 86.400 segundos. `disableSessionRefresh: true` evita prolongarla; la caché de sesión en cookies está deshabilitada para aplicar cambios de rol y revocaciones inmediatamente.
- El alta pública asigna paciente. El rol no es un campo editable por el cliente de registro. La autorización del backend no confía en el rol guardado en React.
- Se conserva la edición inmediata del email para cuentas sin verificación de correo, como en la aplicación existente. La verificación por correo no se incorpora en este alcance.
- En producción se necesita HTTPS y un reverse proxy equivalente para `/api`: el proxy de Vite solo funciona en desarrollo. No se implementó un despliegue.

## Uso local

En cada proyecto, instalar con `pnpm install`. Configurar `backend-dsw/.env` siguiendo `.env.example`; `BETTER_AUTH_SECRET` debe ser aleatorio y tener al menos 32 caracteres. Puede generarse con `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`.

Con el backend detenido, desde `backend-dsw`:

```powershell
pnpm db:reset     # Borra los datos del esquema local configurado y crea el esquema nuevo.
pnpm db:prepare   # Para una base ya migrada: prepara el esquema sin reiniciar los datos.
```

No usar `db:prepare` sobre una base con usuarios antiguos: esta migración requiere reinicio, no backfill. `db:reset` se ejecutó una vez durante la migración, sobre la base local `tp`. Los comandos de preparación rechazan `NODE_ENV=production`.

Para crear un administrador, definir `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_NOMBRE`, `ADMIN_APELLIDO` y `ADMIN_DNI` como variables locales y ejecutar `pnpm auth:admin`. Retirar esas variables después. No existe un endpoint público de bootstrap.

Iniciar `pnpm dev` en `backend-dsw` y `frontend-dsw`. La base y el secreto locales ya quedaron preparados en este workspace. El servidor no crea admins ni reinicia datos al arrancar.

## Validación

Los builds de ambos proyectos pasaron. Backend: 34 tests; frontend: 3 tests; Playwright: 2 tests. Se reutilizaron las suites existentes. El recorrido real incluyó alta administrativa de especialidad y doctor, ingreso del doctor y creación de agenda, registro del paciente, ingreso, reserva, recarga conservando sesión y cancelación. Evidencia en `verificacion/better-auth.md` y capturas asociadas.

## Referencias

- [Express](https://better-auth.com/docs/integrations/express)
- [MySQL](https://better-auth.com/docs/adapters/mysql)
- [Modelos y hooks](https://better-auth.com/docs/concepts/database)
- [Sesiones](https://better-auth.com/docs/concepts/session-management)
- [Email y contraseña](https://better-auth.com/docs/authentication/email-password)
- [Roles administrativos](https://better-auth.com/docs/plugins/admin)
- [Proxy de Vite](https://vite.dev/config/server-options.html#server-proxy)
