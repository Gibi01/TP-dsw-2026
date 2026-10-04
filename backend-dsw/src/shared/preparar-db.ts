import { getMigrations } from 'better-auth/db/migration';
import { auth, authPool } from './auth.js';
import { orm } from './orm.js';

try {
  if (process.env.NODE_ENV === 'production') throw new Error('Este comando es solo para la base local de desarrollo');
  if (process.argv.includes('--reset')) {
    await orm.getSchemaGenerator().dropSchema();
    const connection = await authPool.getConnection();
    try {
      await connection.query('SET FOREIGN_KEY_CHECKS = 0');
      for (const table of ['auth_session', 'auth_account', 'auth_verification', 'auth_user']) {
        await connection.query(`DROP TABLE IF EXISTS ${table}`);
      }
    } finally {
      await connection.query('SET FOREIGN_KEY_CHECKS = 1');
      connection.release();
    }
    await orm.getSchemaGenerator().createSchema();
  } else {
    await orm.getSchemaGenerator().updateSchema();
  }
  const migrations = await getMigrations(auth.options);
  await migrations.runMigrations();
  console.log('Base preparada para Better Auth.');
} finally {
  await authPool.end();
  await orm.close();
}
