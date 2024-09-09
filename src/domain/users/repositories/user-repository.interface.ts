import { Role } from '@domain/auth/enums/role.enum';
import { User } from '../entities/user.entity';
import { FindOneOptions } from 'typeorm';

export interface IUserRepository {
  save(user: User): Promise<User>;
  findOne(options: FindOneOptions<User>): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByEmailWithPassword(email: string): Promise<User | null>;
  findByRole(role: Role): Promise<User[]>;
}
