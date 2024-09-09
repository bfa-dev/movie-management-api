import { FindOneOptions } from 'typeorm';
import { Session } from '../entities/session.entity';

export interface ISessionRepository {
  save(session: Session): Promise<Session>;
  findOne(id: string, options?: any): Promise<Session | null>;
  findOneByOptions(options: FindOneOptions<Session>): Promise<Session | null>;
  updateOne(id: string, partialSession: Partial<Session>): Promise<Session>;
  delete(options?: any): Promise<void>;
}