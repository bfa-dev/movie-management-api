import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Unique } from 'typeorm';
import { Movie } from './movie.entity';

export enum TimeSlot {
  SLOT_10_12 = '10:00-12:00',
  SLOT_12_14 = '12:00-14:00',
  SLOT_14_16 = '14:00-16:00',
  SLOT_16_18 = '16:00-18:00',
  SLOT_18_20 = '18:00-20:00',
  SLOT_20_22 = '20:00-22:00',
  SLOT_22_00 = '22:00-00:00',
}

@Entity()
@Unique(['date', 'timeSlot', 'roomNumber'])
export class Session {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'date' })
  date: Date;

  @Column({
    type: 'enum',
    enum: TimeSlot,
  })
  timeSlot: TimeSlot;

  @Column()
  roomNumber: number;

  @ManyToOne(() => Movie, movie => movie.sessions, { onDelete: 'CASCADE' })
  movie: Movie;
}