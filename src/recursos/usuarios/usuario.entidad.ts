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

  @Property({ nullable: false })
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