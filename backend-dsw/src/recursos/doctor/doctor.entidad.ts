import {
  Collection,
  Entity,
  ManyToMany,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import { Especialidad } from '../especialidad/especialidad.entidad';

@Entity()
export class Doctor {

  @PrimaryKey()
  matricula!: number;

  @Property()
  nombre!: string;

  @Property()
  apellido!: string;

  @ManyToMany(() => Especialidad, especialidad => especialidad.doctores, {
    owner: true,
  })
  especialidades = new Collection<Especialidad>(this);
}