import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOneOptions, Repository } from 'typeorm';
import { Session } from '@domain/movies/entities/session.entity';
import { ISessionRepository } from '@domain/movies/repositories/session-repository.interface';

@Injectable()
export class SessionRepository implements ISessionRepository {
  constructor(
    @InjectRepository(Session)
    private readonly repository: Repository<Session>,
  ) { }

  create(session: Partial<Session>): Session {
    return this.repository.create(session);
  }

  async save(session: Session): Promise<Session> {
    return this.repository.save(session);
  }

  async findSessionByMovieIdAndSessionId(movieId: string, sessionId: string): Promise<Session | null> {
    return this.repository.findOne({ where: { id: sessionId, movie: { id: movieId } } });
  }

  async findOne(options: FindOneOptions<Session>): Promise<Session | null> {
    return this.repository.findOne(options);
  }

  async find(options?: any): Promise<Session[]> {
    return this.repository.find(options);
  }
}