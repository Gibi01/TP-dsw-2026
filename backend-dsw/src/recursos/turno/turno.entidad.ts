import { Entity, PrimaryKey, Property, ManyToOne } from '@mikro-orm/core';
import { Usuario } from '../usuarios/usuario.entidad.js';
import { Doctor } from '../doctor/doctor.entidad.js';

// Pendiente: recién creado. Cancelado: el paciente lo canceló. Asistido: el paciente se
// presentó (lo confirma el doctor). No asistido: no se presentó ni canceló (lo aplica el
// doctor manualmente, o el sistema automáticamente 12hs después de la fecha/hora del turno).
export type EstadoTurno = 'pendiente' | 'cancelado' | 'asistido' | 'no_asistido';

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
  estado: EstadoTurno = 'pendiente';

  @Property({ nullable: true })
  fechaHoraCancelacion?: Date;

  @Property({ nullable: true })
  motivoCancelacion?: string;
}
