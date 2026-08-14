import { MikroORM } from "@mikro-orm/core";
import { MySqlDriver } from "@mikro-orm/mysql";
import { SqlHighlighter } from "@mikro-orm/sql-highlighter";
import { config } from "./config.js";

// En test (vitest) se omite entitiesTs: MikroORM detecta que el proceso tiene soporte TS
// (vitest lo habilita globalmente) y por eso preferiría discovery vía import() de los .entidad.ts
// crudos, lo que rompe en Windows con un error de ESM al no poder resolverlos. En dev/producción
// (tsc-watch / node dist/app.js) esta condición es falsa y el comportamiento no cambia.
export const orm = await MikroORM.init({
  entities: ['dist/**/*.entidad.js'],
  ...(process.env.NODE_ENV === 'test' ? {} : { entitiesTs: ['src/**/*.entidad.ts'] }),
  dbName: config.db.name,
  driver: MySqlDriver,
  host: config.db.host,
  port: config.db.port,
  user: config.db.user,
  password: config.db.password,
  highlighter: new SqlHighlighter(),
  debug: process.env.NODE_ENV !== 'production',
  schemaGenerator: {
    disableForeignKeys: true, //desabilita las claves foráneas para evitar problemas al eliminar tablas
    createForeignKeyConstraints: true, //habilita la creación de claves foráneas al generar el esquema
    ignoreSchema: [], 
  },
});

export const syncSchema = async () => {
  const generator = orm.getSchemaGenerator();
  /*   
  await generator.dropSchema()
  await generator.createSchema()
  */
  await generator.updateSchema();
};
