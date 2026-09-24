import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity()
export class ObraSocial {
  @PrimaryKey()
  id!: number;

  @Property()
  nombre!: string;

}
