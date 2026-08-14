import { Entity, PrimaryKey, Property, ManyToOne } from '@mikro-orm/core';
import { Doctor } from '../doctor/doctor.entidad.js';

// Bloque de disponibilidad semanal recurrente de un doctor. Un doctor puede tener
// varios bloques (p. ej. lunes mañana y lunes tarde, con distinta duración de turno).
@Entity()
export class Agenda {
  @PrimaryKey()
  id!: number;

  @ManyToOne(() => Doctor)
  doctor!: Doctor;

  @Property()
  diaSemana!: number; // 0 = domingo ... 6 = sábado

  @Property()
  horaInicio!: string; // "HH:MM"

  @Property()
  horaFin!: string; // "HH:MM"

  @Property()
  duracionTurnoMinutos!: number;
}
