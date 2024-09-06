import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany, JoinTable, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Role } from '@domain/auth/role.enum';
import { Ticket } from '@domain/tickets/entities/ticket.entity';
import { Movie } from '@domain/movies/entities/movie.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  @Column()
  age: number;

  @Column({
    type: 'enum',
    enum: Role,
    default: Role.CUSTOMER
  })
  role: Role;

  @Column({ unique: true })
  email: string;

  @OneToMany(() => Ticket, ticket => ticket.user)
  tickets: Ticket[];

  @ManyToMany(() => Movie)
  @JoinTable()
  watchedMovies: Movie[];

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}