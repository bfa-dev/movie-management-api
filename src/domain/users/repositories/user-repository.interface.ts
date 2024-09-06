import { Role } from '@domain/auth/role.enum';
import { User } from '../entities/user.entity';
import { FindOneOptions } from 'typeorm';

export interface IUserRepository {
  findOne(options: FindOneOptions<User>): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByRole(role: Role): Promise<User[]>;
  create(user: User): Promise<User>;
  save(user: User): Promise<User>;
}