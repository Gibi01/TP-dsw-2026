# Estado de la migración

- [x] Crear `codex/better-auth`.
- [x] Instalar y configurar Better Auth con MySQL.
- [x] Crear esquema nuevo y vincular perfiles, sin conservar usuarios anteriores.
- [x] Sustituir JWT por sesiones de 24 horas y preservar permisos de negocio.
- [x] Migrar registro, doctores, edición de identidad, roles y primer administrador.
- [x] Implementar cliente React, recuperación de sesión y cierre en servidor.
- [x] Configurar proxy de Vite y URLs relativas.
- [x] Retirar bcrypt y jsonwebtoken de la implementación propia.
- [x] Adaptar tests, ejecutar builds y verificar tres roles en navegador real.
- [x] Documentar configuración, reinicio local y evidencia.

Fuera del alcance: recuperar contraseña por correo, despliegue, importación de cuentas, OAuth y MFA. Se mantiene Resend para las notificaciones existentes.
