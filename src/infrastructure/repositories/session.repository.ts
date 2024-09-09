import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOneOptions, Repository } from 'typeorm';
import { Session } from '@domain/sessions/entities/session.entity';
import { ISessionRepository } from '@domain/sessions/repositories/session-repository.interface';

@Injectable()
export class SessionRepository implements ISessionRepository {
  constructor(
    @InjectRepository(Session)
    private readonly repository: Repository<Session>,
  ) {}

  async save(session: Session): Promise<Session> {
    return this.repository.save(session);
  }

  async findOne(id: string, options?: any): Promise<Session | null> {
    return this.repository.findOne({ where: { id }, ...options });
  }

  async findOneByOptions(options: FindOneOptions<Session>): Promise<Session | null> {
    return this.repository.findOne(options);
  }

  async updateOne(id: string, partialSession: Partial<Session>): Promise<Session> {
    const session = await this.repository.findOne({ where: { id } });
    if (!session) {
      throw new NotFoundException('Session not found');
    }
    return this.repository.save({ ...session, ...partialSession });
  }

  async delete(options?: any): Promise<void> {
    await this.repository.delete(options);
  }
}
