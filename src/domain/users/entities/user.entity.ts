import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany, JoinTable, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Role } from '@domain/auth/enums/role.enum';
import { Ticket } from '@domain/tickets/entities/ticket.entity';
import { Movie } from '@domain/movies/entities/movie.entity';
import { Exclude } from 'class-transformer';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column() // allowing duplicate usernames because email is unique
  username: string;

  @Exclude()
  @Column({ select: false })
  password: string;

  @Column()
  age: number;

  @Column({
    type: 'enum',
    enum: Role,
    default: Role.CUSTOMER,
  })
  role: Role;

  @Column({ unique: true })
  email: string;

  @OneToMany(() => Ticket, (ticket) => ticket.userId)
  tickets: Ticket[];

  @ManyToMany(() => Movie)
  @JoinTable()
  watchedMovies: string[];

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
