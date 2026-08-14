import { Entity, PrimaryKey, Property, ManyToOne } from '@mikro-orm/core';
import { Usuario } from '../usuarios/usuario.entidad.js';
import { Doctor } from '../doctor/doctor.entidad.js';

export type EstadoTurno = 'reservado' | 'cancelado';

@Entity()
export class Turno {
  @PrimaryKey()
  id!: number;

  @ManyToOne(() => Usuario)
  usuario!: Usuario;

  @ManyToOne(() => Doctor)
  doctor!: Doctor;

  @Property()
  fechaHoraEmision!: Date;

  @Property()
  fechaHoraTurno!: Date;

  @Property()
  estado: EstadoTurno = 'reservado';

  @Property({ nullable: true })
  fechaHoraCancelacion?: Date;

  @Property({ nullable: true })
  motivoCancelacion?: string;
}
