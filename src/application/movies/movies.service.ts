import { Injectable, Inject } from '@nestjs/common';
import { DataSource, EntityManager, In } from 'typeorm';
import { Movie } from '@domain/movies/entities/movie.entity';
import { Session } from '@domain/sessions/entities/session.entity';
import { TimeSlot } from '@domain/sessions/enums/time.slot.enum';
import { CreateMovieDto } from '@api/movies/dto/create-movie.dto';
import { IMovieRepository } from '@domain/movies/repositories/movie-repository.interface';
import { ISessionRepository } from '@domain/sessions/repositories/session-repository.interface';
import { CreateSessionDto } from '@api/sessions/dto/create-session.dto';
import { UpdateMovieDto } from '@api/movies/dto/update-movie.dto';
import { UpdateSessionDto } from '@api/sessions/dto/update-session-dto';
import { MovieNotFoundError, SessionAlreadyExistsError, SessionNotFoundError } from '@domain/exceptions';
import { BulkCreateMovieDto } from '@api/movies/dto/bulk/bulk-movie.dto';
import { ListMoviesDto } from '@api/movies/dto/list-movies.dto';
import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class MoviesService {
  constructor(
    @Inject('IMovieRepository')
    private movieRepository: IMovieRepository,
    @Inject('ISessionRepository')
    private sessionRepository: ISessionRepository,
    private dataSource: DataSource,
    private logger: PinoLogger,
  ) {}

  async findMoviesByIds(movieIds: string[]): Promise<Movie[]> {
    return this.movieRepository.findWithRelations({ where: { id: In(movieIds) }, relations: ['sessions'] });
  }

  private async checkIfRoomIsAvailable(sessionParams: { date: Date; timeSlot: TimeSlot; roomNumber: number }): Promise<void> {
    const { date, timeSlot, roomNumber } = sessionParams;
    const existingSession = await this.sessionRepository.findOneByOptions({
      where: {
        date: date,
        timeSlot: timeSlot,
        roomNumber: roomNumber,
      },
    });

    if (existingSession) {
      throw new SessionAlreadyExistsError();
    }
  }

  async addSessionToMovie(movie: Movie, createSessionDto: CreateSessionDto): Promise<Session> {
    const { date, timeSlot, roomNumber } = createSessionDto;

    const session = new Session(new Date(date), timeSlot, roomNumber, movie);
    await this.checkIfRoomIsAvailable({ date: new Date(date), timeSlot: timeSlot, roomNumber: roomNumber });
    return this.sessionRepository.save(session);
  }

  async addSessionToMovieTransactional(
    transactionalEntityManager: EntityManager,
    movie: Movie,
    createSessionDto: CreateSessionDto,
  ): Promise<Session> {
    const { date, timeSlot, roomNumber } = createSessionDto;

    const session = new Session(new Date(date), timeSlot, roomNumber, movie);

    await this.checkIfRoomIsAvailable({ date: new Date(date), timeSlot, roomNumber });

    return await transactionalEntityManager.save(Session, session);
  }

  async createMovie(createMovieDto: CreateMovieDto): Promise<Movie> {
    return this.dataSource.transaction(async (transactionalEntityManager: EntityManager) => {
      const { name, ageRestriction, sessions } = createMovieDto;

      const movie = new Movie(name, ageRestriction);
      const savedMovie = await transactionalEntityManager.save(Movie, movie);

      if (sessions && sessions.length > 0) {
        for (const sessionDto of sessions) {
          await this.addSessionToMovieTransactional(transactionalEntityManager, savedMovie, sessionDto);
        }
      }

      const movieWithRelations = await transactionalEntityManager.findOne(Movie, {
        where: { id: savedMovie.id },
        relations: ['sessions'],
      });

      return movieWithRelations;
    });
  }

  private isSessionUpdated(session: Session, sessionDto: UpdateSessionDto): boolean {
    return (
      new Date(sessionDto.date).getTime() !== session.date.getTime() ||
      sessionDto.timeSlot !== session.timeSlot ||
      sessionDto.roomNumber !== session.roomNumber
    );
  }

  private isMovieUpdated(movie: Movie, movieDto: UpdateMovieDto): boolean {
    return movie.name !== movieDto.name || movie.ageRestriction !== movieDto.ageRestriction;
  }

  private async updateMovieSessions(sessions: UpdateSessionDto[]): Promise<void> {
    for (const sessionDto of sessions) {
      const session = await this.sessionRepository.findOne(sessionDto.id);

      if (!session) {
        throw new SessionNotFoundError();
      }

      const isSessionUpdated = this.isSessionUpdated(session, sessionDto);

      const sessionParams = {
        date: new Date(sessionDto.date),
        timeSlot: sessionDto.timeSlot,
        roomNumber: sessionDto.roomNumber,
      };

      if (isSessionUpdated) {
        await this.checkIfRoomIsAvailable(sessionParams);

        Object.assign(session, sessionParams);
        await this.sessionRepository.save(session);
      }
    }
  }

  async updateMovie(id: string, updateMovieDto: UpdateMovieDto): Promise<Movie> {
    const { name, ageRestriction, sessions } = updateMovieDto;
    const movie = await this.movieRepository.findOneById(id);
    if (!movie) {
      throw new MovieNotFoundError();
    }

    if (sessions && sessions.length > 0) {
      await this.updateMovieSessions(sessions);
    }

    const isMovieUpdated = this.isMovieUpdated(movie, updateMovieDto);

    if (isMovieUpdated) {
      Object.assign(movie, {
        name,
        ageRestriction,
      });
      await this.movieRepository.save(movie);
    }

    return this.movieRepository.findOneWithRelations({ where: { id }, relations: ['sessions'] });
  }

  async deleteMovie(id: string): Promise<Movie> {
    return this.movieRepository.updateOne(id, { isActive: false });
  }

  async getMovieWithSessions(id: string): Promise<Movie> {
    const movie = await this.movieRepository.findOneWithRelations({ where: { id }, relations: ['sessions'] });
    if (!movie) {
      throw new MovieNotFoundError();
    }
    return movie;
  }

  async getMovieById(id: string): Promise<Movie> {
    const movie = await this.movieRepository.findOneById(id);
    if (!movie) {
      throw new MovieNotFoundError();
    }
    return movie;
  }

  async listActiveMovies(listMoviesDto: ListMoviesDto): Promise<Movie[]> {
    return this.movieRepository.findActiveMovies(
      listMoviesDto.sortBy,
      listMoviesDto.sortOrder,
      listMoviesDto.name,
      listMoviesDto.ageRestriction,
      listMoviesDto.ageRestrictionCondition,
    );
  }

  async bulkAddMovies(bulkCreateMovieDto: BulkCreateMovieDto): Promise<Movie[]> {
    return await this.dataSource.transaction(async (transactionalEntityManager: EntityManager) => {
      const movies: Movie[] = [];

      for (const createMovieDto of bulkCreateMovieDto.movies) {
        const { name, ageRestriction, sessions } = createMovieDto;

        const savedMovie = await transactionalEntityManager.save(Movie, { name, ageRestriction });

        if (sessions && sessions.length > 0) {
          for (const sessionDto of sessions) {
            await this.addSessionToMovieTransactional(transactionalEntityManager, savedMovie, sessionDto);
          }
        }

        const movieWithRelations = await transactionalEntityManager.findOne(Movie, {
          where: { id: savedMovie.id },
          relations: ['sessions'],
        });

        if (movieWithRelations) {
          movies.push(movieWithRelations);
        }
      }

      return movies;
    });
  }

  async bulkDeleteMovies(movieIds: string[]): Promise<Movie[]> {
    const deletedMovies: Movie[] = [];

    await Promise.all(
      movieIds.map(async (id) => {
        const movie = await this.movieRepository.findOneWithRelations({ where: { id }, relations: ['sessions'] });

        if (movie) {
          await this.movieRepository.updateOne(id, { isActive: false });
          if (movie.sessions && movie.sessions.length > 0) {
            for (const session of movie.sessions) {
              await this.sessionRepository.delete(session.id);
            }
          }
          deletedMovies.push(movie);
        }
      }),
    );

    return deletedMovies;
  }
}
