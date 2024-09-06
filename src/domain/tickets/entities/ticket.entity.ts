import { Entity, PrimaryGeneratedColumn, ManyToOne, Column, JoinColumn } from 'typeorm';
import { User } from '@domain/users/entities/user.entity';
import { Session } from '../../movies/entities/session.entity';

@Entity()
export class Ticket {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, user => user.tickets, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;

  @ManyToOne(() => Session)
  session: Session;

  @Column()
  movieId: string;

  @Column({ default: false })
  used: boolean;
}