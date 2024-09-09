import { Entity, PrimaryGeneratedColumn, ManyToOne, Column, JoinColumn } from 'typeorm';
import { User } from '@domain/users/entities/user.entity';
import { Session } from '@domain/sessions/entities/session.entity';
import { Movie } from '@domain/movies/entities/movie.entity';

@Entity()
export class Ticket {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  sessionId: string;

  @Column()
  movieId: string;

  @Column({ default: false })
  used: boolean;
}