import { MikroORM } from "@mikro-orm/core";
import { MySqlDriver } from "@mikro-orm/mysql";
import { SqlHighlighter } from "@mikro-orm/sql-highlighter";
 

export const orm = await MikroORM.init({
  entities: ['dist/**/*.entidad.js'],
  entitiesTs: ['src/**/*.entidad.ts'],
  dbName: 'tp',
  driver: MySqlDriver,
  clientUrl: 'mysql://dsw:1234@localhost:3306/tp', //donde se encuentra la base de datos
  highlighter: new SqlHighlighter(),
  debug: true,
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