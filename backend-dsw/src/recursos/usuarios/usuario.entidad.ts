import { Entity, Property, PrimaryKey } from '@mikro-orm/core';

@Entity()
export class Usuario {
  @PrimaryKey({})
  id!: number;

  @Property({ nullable: false })
  nombre!: string;

  @Property({ nullable: false })
  apellido!: string;

  // hidden: true asegura que el hash nunca viaje en un JSON, incluso si en algún endpoint
  // se termina serializando un Usuario completo (relación populada, entidad devuelta directo, etc).
  @Property({ nullable: false, hidden: true })
  password!: string;

  @Property({ nullable: false })
  email!: string;

  @Property({ nullable: false })
  rol!: string;

  // Datos de perfil, editables por el usuario salvo el DNI (ver comentario en update()).
  @Property({ nullable: true })
  dni?: string;

  // longtext: guarda la imagen en base64 (no hay almacenamiento de archivos en el
  // proyecto), un varchar corto no alcanza para un .png codificado.
  @Property({ nullable: true, columnType: 'longtext' })
  foto?: string;

  @Property({ nullable: true })
  obraSocial?: string;

  @Property({ nullable: true })
  direccion?: string;

  @Property({ nullable: true })
  telefonoCelular?: string;
}