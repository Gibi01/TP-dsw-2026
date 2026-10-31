# Paleta e iconos de especialidades

La interfaz usa ocre `#8D6700` para la marca y las acciones, ocre oscuro
`#6F5100` para títulos, crema `#FAF5E6` para encabezados y blanco para superficies.
La información, los éxitos y los errores mantienen azul, verde y rojo.
El tema está en `frontend-dsw/src/tema.ts`.

## Administración

Al crear o editar una especialidad, el administrador elige un icono del catálogo
y ve una vista previa. Hay 50 iconos de especialidades y uno general, con búsqueda
por nombre que ignora acentos y un listado desplazable adaptado a móviles.
Se guarda un identificador y se conservan los ocho identificadores originales.
No se suben archivos. El administrador puede cambiar cualquier elección.
Un nombre nuevo no determina automáticamente el icono.

Los SVG son Health Icons outline, licencia CC0, servidos localmente desde
`frontend-dsw/public/iconos-especialidades`. Su README documenta origen y revisión.
El catálogo está en `backend-dsw/src/recursos/especialidad/catalogo.ts` y
`frontend-dsw/src/iconosEspecialidad.ts`; la prueba E2E verifica su igualdad
y que todos los SVG estén disponibles. Al ampliarlo, actualizar ambos catálogos.

## Base de datos

El listado público y el filtro de especialidades de médicos consultan
`GET /api/especialidades?conMedicosActivos=true`: solo incluye especialidades
con al menos un doctor asociado con `activo=true`, aunque no tenga agenda.
Sin ese parámetro se conserva el catálogo completo para administración.
No se eliminan especialidades cuando se da de baja o desvincula al último médico.

Antes de desplegar el backend nuevo sobre una base existente, ejecutar desde
`backend-dsw`: `pnpm db:iconos`. Agrega únicamente la columna `icono`, con valor
predeterminado `medicina`, y no modifica los demás datos. Puede repetirse.
En desarrollo, la sincronización de esquema existente también agrega la columna.
No usar `db:reset` para aplicar este cambio.

Para cargar las 50 especialidades aprobadas: `pnpm db:especialidades`.
La carga se ejecuta en una transacción, reconoce nombres sin acentos y el alias
Traumatología, conserva ids, nombres y relaciones existentes y solo reemplaza
el icono genérico. Respeta los iconos personalizados y las especialidades ajenas
al catálogo; aborta si hay coincidencias ambiguas. Puede repetirse sin duplicar.
Carga local del 29/10/2026: 44 creadas, 6 iconos actualizados; segunda ejecución:
0 creadas, 0 actualizadas, 50 conservadas.

Para revertir la aplicación, se puede dejar la columna adicional en la base.
Solo si se desea eliminar definitivamente las elecciones guardadas, después de
volver al backend anterior: `ALTER TABLE especialidad DROP COLUMN icono;`.

## Verificación

- Backend: `pnpm test` (requiere MySQL local y compila antes de ejecutar).
- Frontend: `pnpm test`, `pnpm build`, `pnpm lint`.
- Navegador: `pnpm test:e2e`.
- `diseno-iconos.spec.ts` cubre elección/edición y pantallas a 320, 390 y 1280 px;
  los screenshots de esas pruebas usan respuestas simuladas.
