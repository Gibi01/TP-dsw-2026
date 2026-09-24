import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity()
export class MotivoCancelacion {
  @PrimaryKey()
  id!: number;

  @Property()
  descripcion!: string;
}
