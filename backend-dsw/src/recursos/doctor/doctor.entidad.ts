import {
  Collection,
  Entity,
  ManyToMany,
  OneToOne,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import { Especialidad } from '../especialidad/especialidad.entidad.js';
import { Usuario } from '../usuarios/usuario.entidad.js';

@Entity()
export class Doctor {

  @PrimaryKey()
  matricula!: number;

  // El doctor es también un Usuario (tiene cuenta propia para loguearse). Nombre, apellido,
  // email, foto, dirección, etc. viven únicamente en Usuario para no duplicar datos.
  @OneToOne(() => Usuario, { owner: true, unique: true })
  usuario!: Usuario;

  @ManyToMany(() => Especialidad, especialidad => especialidad.doctores, {
    owner: true,
  })
  especialidades = new Collection<Especialidad>(this);

  // Baja lógica: un doctor dado de baja no se borra (ni él ni sus turnos), pero deja de
  // ofrecerse como opción al paciente en listados, fichas y disponibilidad.
  @Property()
  activo: boolean = true;
}
