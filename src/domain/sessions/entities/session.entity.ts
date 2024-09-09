import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Unique, OneToMany } from 'typeorm';
import { Movie } from '@domain/movies/entities/movie.entity';
import { Ticket } from '@domain/tickets/entities/ticket.entity';
import { TimeSlot } from '@domain/sessions/enums/time.slot.enum';

@Entity()
@Unique(['date', 'timeSlot', 'roomNumber'])
export class Session {
  constructor(date: Date, timeSlot: TimeSlot, roomNumber: number, movie: Movie) {
    this.date = date;
    this.timeSlot = timeSlot;
    this.roomNumber = roomNumber;
    this.movie = movie;
  }

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'timestamp' })
  date: Date;

  @Column({
    type: 'enum',
    enum: TimeSlot,
  })
  timeSlot: TimeSlot;

  @Column()
  roomNumber: number;

  @ManyToOne(() => Movie, movie => movie.sessions)
  movie: Movie;

  @OneToMany(() => Ticket, ticket => ticket.sessionId)
  tickets: Ticket[];
}