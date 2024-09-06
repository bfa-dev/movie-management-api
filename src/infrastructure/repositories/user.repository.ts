import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOneOptions, Repository } from 'typeorm';
import { User } from '@domain/users/entities/user.entity';
import { IUserRepository } from '@domain/users/repositories/user-repository.interface';
import { Role } from '@domain/auth/role.enum';

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,
  ) { }

  async create(user: User): Promise<User> {
    return this.repository.save(user);
  }

  async findOne(options: FindOneOptions<User>): Promise<User | null> {
    return this.repository.findOne(options);
  }

  async findById(id: string): Promise<User | null> {
    return this.repository.findOne({ where: { id }, relations: ['watchedMovies'] });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.repository.findOne({ where: { email }, relations: ['watchedMovies'] });
  }

  async findByRole(role: Role): Promise<User[]> {
    return this.repository.find({ where: { role } });
  }

  async save(user: User): Promise<User> {
    return this.repository.save(user);
  }
}