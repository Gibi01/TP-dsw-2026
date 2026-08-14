import {
  Collection,
  Entity,
  ManyToMany,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import { Especialidad } from '../especialidad/especialidad.entidad.js';

@Entity()
export class Doctor {

  @PrimaryKey()
  matricula!: number;

  @Property()
  nombrePr!: string;

  @Property()
  apellidoPr!: string;

  @ManyToMany(() => Especialidad, especialidad => especialidad.doctores, {
    owner: true,
  })
  especialidades = new Collection<Especialidad>(this);
}