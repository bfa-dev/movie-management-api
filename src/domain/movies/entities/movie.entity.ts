import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Session } from '@domain/sessions/entities/session.entity';
import { Ticket } from '@domain/tickets/entities/ticket.entity';

@Entity()
export class Movie {
  constructor(name: string, ageRestriction: number) {
    this.name = name;
    this.ageRestriction = ageRestriction;
  }

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column() // movies can have the same name
  name: string;

  @Column()
  ageRestriction: number;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => Session, (session) => session.movie)
  sessions: Session[];

  @OneToMany(() => Ticket, (ticket) => ticket.movieId)
  tickets: Ticket[];
}
