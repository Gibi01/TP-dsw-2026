import {
  Collection,
  Entity,
  ManyToMany,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import { Doctor } from '../doctor/doctor.entidad.js';

@Entity()
export class Especialidad {

  @PrimaryKey()
  idEspecialidad!: number;

  @Property()
  descripcionEsp!: string;

  @ManyToMany(() => Doctor, doctor => doctor.especialidades)
  doctores = new Collection<Doctor>(this);
}