import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MoviesController } from '@api/movies/movies.controller';
import { MoviesService } from './movies.service';
import { Movie } from '@domain/movies/entities/movie.entity';
import { Session } from '@domain/movies/entities/session.entity';
import { Ticket } from '@domain/tickets/entities/ticket.entity';
import { User } from '@domain/users/entities/user.entity';
import { MovieRepository } from '@infrastructure/repositories/movie.repository';
import { SessionRepository } from '@infrastructure/repositories/session.repository';
import { TicketRepository } from '@infrastructure/repositories/ticket.repository';
import { UserRepository } from '@infrastructure/repositories/user.repository';
import { TicketsModule } from '@application/tickets/tickets.module';
import { UsersModule } from '@application/users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Movie, Session, Ticket, User]),
    TicketsModule,
    UsersModule,
  ],
  controllers: [MoviesController],
  providers: [
    MoviesService,
    {
      provide: 'IMovieRepository',
      useClass: MovieRepository,
    },
    {
      provide: 'ISessionRepository',
      useClass: SessionRepository,
    },
    {
      provide: 'ITicketRepository',
      useClass: TicketRepository,
    },
    {
      provide: 'IUserRepository',
      useClass: UserRepository,
    },
  ],
  exports: [MoviesService],
})
export class MoviesModule { }