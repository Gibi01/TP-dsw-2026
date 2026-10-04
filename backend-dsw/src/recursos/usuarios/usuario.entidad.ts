import { Entity, Property, PrimaryKey } from '@mikro-orm/core';

@Entity()
export class Usuario {
  @PrimaryKey({})
  id!: number;

  @Property({ nullable: false })
  nombre!: string;

  @Property({ nullable: false })
  apellido!: string;

  @Property({ unique: true, hidden: true })
  authUserId!: string;

  @Property({ nullable: false })
  email!: string;

  @Property({ nullable: false })
  rol!: string;

  // dato de perfil editable; la identidad técnica del usuario es su id
  @Property({ nullable: true })
  dni?: string;

  // longtext porque guardamos la imagen en base64 (no hay storage de archivos en el
  // proyecto), un varchar corto no entra un .png codificado
  @Property({ nullable: true, columnType: 'longtext' })
  foto?: string;

  @Property({ nullable: true })
  direccion?: string;

  @Property({ nullable: true })
  telefonoCelular?: string;
}
