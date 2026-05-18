import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

import { BaseEntity } from '../../shared/baseEntity.entity.js';

@Entity()
export class Categoria extends BaseEntity{
  @PrimaryKey()
  id!: number;

  @Property()
  nombre!: string;
}