import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOneOptions, Repository } from 'typeorm';
import { Session } from '@domain/sessions/entities/session.entity';
import { CreateSessionDto } from '@api/sessions/dto/create-session.dto';
import { Movie } from '@domain/movies/entities/movie.entity';
import { MovieHasNoSessionsToDelete, SessionAlreadyExistsError, SessionNotFoundError } from '@domain/exceptions';

@Injectable()
export class SessionsService {
  constructor(
    @InjectRepository(Session)
    private readonly sessionRepository: Repository<Session>,
  ) {}

  async addSession(session: CreateSessionDto, movie: Movie): Promise<Session> {
    const newSession = new Session(new Date(session.date), session.timeSlot, session.roomNumber, movie);
    return this.sessionRepository.save(newSession).catch((error) => {
      if (error.code === '23505') {
        throw new SessionAlreadyExistsError();
      }
      throw error;
    });
  }

  async deleteSession(id: string): Promise<{ result: boolean }> {
    const result = await this.sessionRepository.delete(id);

    if (result.affected > 0) {
      return { result: true };
    } else {
      throw new SessionNotFoundError();
    }
  }

  async deleteAllSessions(movieId: string): Promise<{ result: boolean }> {
    const result = await this.sessionRepository.delete({
      movie: {
        id: movieId,
      },
    });

    if (result.affected > 0) {
      return { result: true };
    } else {
      throw new MovieHasNoSessionsToDelete();
    }
  }

  async findOneWithRelations(options: FindOneOptions<Session>): Promise<Session | null> {
    return this.sessionRepository.findOne(options);
  }

  async findOneById(id: string): Promise<Session | null> {
    return this.sessionRepository.findOne({ where: { id } });
  }
}
