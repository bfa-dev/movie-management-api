import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOneOptions, Repository } from 'typeorm';
import { Session } from '@domain/sessions/entities/session.entity';
import { CreateSessionDto } from '@api/sessions/dto/create-session.dto';
import { Movie } from '@domain/movies/entities/movie.entity';

@Injectable()
export class SessionsService {
  constructor(
    @InjectRepository(Session)
    private readonly sessionRepository: Repository<Session>,
  ) { }

  async addSession(session: CreateSessionDto, movie: Movie): Promise<Session> {
    const newSession = new Session(
      new Date(session.date),
      session.timeSlot,
      session.roomNumber,
      movie
    );

    return this.sessionRepository.save(newSession);
  }

  async deleteSession(id: string): Promise<{ result: boolean }> {
    const result = await this.sessionRepository.delete(id);
    return { result: result.affected > 0 };
  }

  async deleteAllSessions(movieId: string): Promise<{ result: boolean }> {
    const result = await this.sessionRepository.delete({
      movie: {
        id: movieId,
      },
    });
    return { result: result.affected > 0 };
  }

  async findOneWithRelations(options: FindOneOptions<Session>): Promise<Session | null> {
    return this.sessionRepository.findOne(options);
  }
}