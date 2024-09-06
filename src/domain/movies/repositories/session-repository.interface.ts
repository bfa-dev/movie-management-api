import { FindOneOptions } from 'typeorm';
import { Session } from '../entities/session.entity';

export interface ISessionRepository {
  create(session: Partial<Session>): Session;
  save(session: Session): Promise<Session>;
  findOne(options: FindOneOptions<Session>): Promise<Session | null>;
}