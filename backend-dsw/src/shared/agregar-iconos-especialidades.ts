import { orm } from './orm.js';

// Migración aditiva e idempotente: no sincroniza ni elimina otras tablas/columnas.
try {
  const conexion = orm.em.getConnection();
  const columnas = await conexion.execute("SHOW COLUMNS FROM `especialidad` LIKE 'icono'");
  if (columnas.length === 0) {
    await conexion.execute("ALTER TABLE `especialidad` ADD COLUMN `icono` varchar(32) NOT NULL DEFAULT 'medicina'");
    console.log('Columna icono agregada; las especialidades existentes usan medicina.');
  } else {
    console.log('La columna icono ya existe.');
  }
} finally {
  await orm.close();
}
