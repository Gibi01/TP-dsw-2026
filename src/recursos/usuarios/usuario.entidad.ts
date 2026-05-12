import {
  Entity,
  Property,
  Cascade,
  PrimaryKey,
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


}