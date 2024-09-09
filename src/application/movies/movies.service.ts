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
import {
  MovieNotFoundError,
  SessionAlreadyExistsError,
  SessionNotFoundError,
  ThereAreNoMoviesError
} from '@domain/exceptions';
import { BulkCreateMovieDto } from '@api/movies/dto/bulk/bulk-movie.dto';

@Injectable()
export class MoviesService {
  constructor(
    @Inject('IMovieRepository')
    private movieRepository: IMovieRepository,
    @Inject('ISessionRepository')
    private sessionRepository: ISessionRepository,
    private dataSource: DataSource,
  ) { }

  async findMoviesByIds(movieIds: string[]): Promise<Movie[]> {
    return this.movieRepository.findWithRelations({ where: { id: In(movieIds) } });
  }

  private async checkIfRoomIsAvailable(sessionParams: { date: Date, timeSlot: TimeSlot, roomNumber: number }): Promise<void> {
    const { date, timeSlot, roomNumber } = sessionParams;
    const existingSession = await this.sessionRepository.findOneByOptions(
      {
        where: {
          date: date,
          timeSlot: timeSlot,
          roomNumber: roomNumber
        }
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

  async addSessionToMovieTransactional(transactionalEntityManager: EntityManager, movie: Movie, createSessionDto: CreateSessionDto): Promise<Session> {
    const { date, timeSlot, roomNumber } = createSessionDto;

    const session = new Session(new Date(date), timeSlot, roomNumber, movie);

    await this.checkIfRoomIsAvailable({ date: new Date(date), timeSlot, roomNumber });

    return await transactionalEntityManager.save(Session, session);
  }

  async createMovie(createMovieDto: CreateMovieDto): Promise<Movie> {
    const { name, ageRestriction, sessions } = createMovieDto;

    const movie = new Movie(name, ageRestriction);
    const savedMovie = await this.movieRepository.save(movie);

    if (sessions && sessions.length > 0) {
      for (const sessionDto of sessions) {
        const session = await this.addSessionToMovie(savedMovie, sessionDto);
      }
    }

    return this.movieRepository.findOneWithRelations({ where: { id: savedMovie.id }, relations: ['sessions'] });
  }

  private isSessionUpdated(session: Session, sessionDto: UpdateSessionDto): boolean {
    return new Date(sessionDto.date).getTime() !== session.date.getTime() || sessionDto.timeSlot !== session.timeSlot || sessionDto.roomNumber !== session.roomNumber;
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
        roomNumber: sessionDto.roomNumber
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
        ageRestriction
      });
      await this.movieRepository.save(movie);
    }

    return this.movieRepository.findOneWithRelations({ where: { id }, relations: ['sessions'] });
  }

  async deleteMovie(id: string): Promise<Movie> {
    return this.movieRepository.updateOne(id, { isActive: false });
  }

  async addSession(movieId: string, date: Date, timeSlot: TimeSlot, roomNumber: number): Promise<Session> {
    const movie = await this.movieRepository.findOneById(movieId);
    if (!movie) {
      throw new MovieNotFoundError();
    }

    const session = new Session(date, timeSlot, roomNumber, movie);
    return this.sessionRepository.save(session).catch((error) => {
      if (error.code === '23505') {
        throw new SessionAlreadyExistsError();
      }
      throw error;
    });
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

  async listActiveMovies(sortBy: string, sortOrder: 'ASC' | 'DESC', filter: any): Promise<Movie[]> {
    const movies = await this.movieRepository.findWithRelations({
      relations: ['sessions'],
      order: { [sortBy]: sortOrder },
      where: { isActive: true, ...filter }
    });

    if (movies.length === 0) {
      throw new ThereAreNoMoviesError();
    }
    return movies;
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

        movies.push(savedMovie);
      }

      return movies;
    });
  }

  async bulkDeleteMovies(movieIds: string[]): Promise<void> {
    await Promise.all(movieIds.map(id => this.movieRepository.updateOne(id, { isActive: false })));
  }
}