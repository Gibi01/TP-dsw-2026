import {
  Entity,
  Property,
  Cascade,
  PrimaryKey,
} from '@mikro-orm/core';

@Entity()
export class Sanatorio {
  @PrimaryKey({})
  id!: number;

  @Property({ nullable: false })
  nombre!: string;

}
