import { MikroORM } from "@mikro-orm/core";
import { MySqlDriver } from "@mikro-orm/mysql";
import { SqlHighlighter } from "@mikro-orm/sql-highlighter";
 

export const orm = await MikroORM.init({
  entities: ['dist/**/*.entidad.js'],
  entitiesTs: ['src/**/*.entidad.ts'],
  dbName: 'tp',
  driver: MySqlDriver,
  clientUrl: 'mysql://dsw:1234@localhost:3305/tp',
  highlighter: new SqlHighlighter(),
  debug: true,
  schemaGenerator: {
    disableForeignKeys: true,
    createForeignKeyConstraints: true,
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