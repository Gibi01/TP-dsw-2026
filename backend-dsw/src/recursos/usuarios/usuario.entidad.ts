import {
  Entity,
  Property,
  PrimaryKey,
  ManyToOne,
  OneToMany,
  Collection,
} from '@mikro-orm/core';

import { BaseEntity } from '../../shared/baseEntity.entity.js';

@Entity()
export class Usuario extends BaseEntity {
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

  //muchos usuarios tienen un usuario 'lider' o 'padre', y un usuario puede ser el lider de muchos usuarios
  @ManyToOne(() => Usuario, { nullable: true })
  padre?: Usuario;

  //un usuario puede ser el lider de muchos usuarios, y un usuario tiene un solo lider o padre
  @OneToMany(() => Usuario, usuario => usuario.padre)
  hijos = new Collection<Usuario>(this);
}