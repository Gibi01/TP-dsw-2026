import { Entity, Property, PrimaryKey } from '@mikro-orm/core';

@Entity()
export class Usuario {
  @PrimaryKey({})
  id!: number;

  @Property({ nullable: false })
  nombre!: string;

  @Property({ nullable: false })
  apellido!: string;

  // con hidden: true el hash nunca viaja en un JSON, ni aunque en algun endpoint se
  // termine serializando el Usuario completo
  @Property({ nullable: false, hidden: true })
  password!: string;

  @Property({ nullable: false })
  email!: string;

  @Property({ nullable: false })
  rol!: string;

  // dato de perfil, se puede editar salvo el dni (ver el comentario en update())
  @Property({ nullable: true })
  dni?: string;

  // longtext porque guardamos la imagen en base64 (no hay storage de archivos en el
  // proyecto), un varchar corto no entra un .png codificado
  @Property({ nullable: true, columnType: 'longtext' })
  foto?: string;

  @Property({ nullable: true })
  obraSocial?: string;

  @Property({ nullable: true })
  direccion?: string;

  @Property({ nullable: true })
  telefonoCelular?: string;
}