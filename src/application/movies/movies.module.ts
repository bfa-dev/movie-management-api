import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MoviesController } from '@api/movies/movies.controller';
import { MoviesService } from './movies.service';
import { Movie } from '@domain/movies/entities/movie.entity';
import { Session } from '@domain/sessions/entities/session.entity';
import { MovieRepository } from '@infrastructure/repositories/movie.repository';
import { SessionRepository } from '@infrastructure/repositories/session.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Movie, Session])],
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
  ],
  exports: [MoviesService],
})
export class MoviesModule {}
