# Ver usuarios

Ruta administrativa: `/admin/usuarios`. Tanto la página como
`GET /api/usuarios/listado` requieren el rol administrador.

El listado incluye nombre, apellido, email, rol, estado y fecha de alta.
Permite combinar búsqueda por nombre/apellido (sin distinguir mayúsculas o
acentos), rol y estado. Por defecto ordena por fecha de creación descendente;
también permite ordenar por nombre. La paginación muestra diez registros.
Los filtros y la paginación se aplican en el cliente sobre el listado completo.

La fecha proviene de `auth_user.createdAt`; si falta, se muestra «Sin registro».
Un usuario figura dado de baja si su médico asociado tiene `activo=false` o
si la cuenta tiene un bloqueo vigente de Better Auth. Un bloqueo vencido no
cuenta como baja. La baja de un médico no implica que su cuenta esté bloqueada.

La eliminación actual de pacientes/administradores es física; los registros
ya eliminados no pueden aparecer. Este listado no cambia el mecanismo de baja
ni agrega acciones de modificación o eliminación.

La consulta devuelve solo los campos necesarios, sin credenciales, identificadores
de autenticación, fotos en base64 ni sesiones. Los permisos y estados están
cubiertos por `listado.integration.test.ts`; filtros, orden, paginación móvil,
errores y navegación por `admin-usuarios.spec.ts`.
