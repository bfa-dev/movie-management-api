import { Injectable, Inject } from '@nestjs/common';
import { User } from '@domain/users/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { Role } from '@domain/auth/role.enum';
import { IUserRepository } from '@domain/users/repositories/user-repository.interface';
import { CreateUserDto } from '@api/users/dto/create-user.dto';
import { Ticket } from '@domain/tickets/entities/ticket.entity';
import { TicketsService } from '@application/tickets/tickets.service';
import { FindOneOptions } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @Inject('IUserRepository')
    private usersRepository: IUserRepository,
    private ticketsService: TicketsService,
  ) { }

  async findOne(options: FindOneOptions<User>): Promise<User | undefined> {
    return this.usersRepository.findOne(options);
  }

  async updateOne(user: User): Promise<User> {
    return this.usersRepository.save(user);
  }

  async findById(id: string): Promise<User | undefined> {
    return this.usersRepository.findById(id);
  }

  async findByEmail(email: string): Promise<User | undefined> {
    return this.usersRepository.findByEmail(email);
  }

  async findByRole(role: Role): Promise<User[]> {
    return this.usersRepository.findByRole(role);
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const user = new User();
    user.username = createUserDto.username;
    user.password = hashedPassword;
    user.age = createUserDto.age;
    user.role = createUserDto.role;
    user.email = createUserDto.email;
    return this.usersRepository.save(user);
  }

  async getTicketsByUserId(userId: string): Promise<Ticket[]> {
    return this.ticketsService.getTicketsByUserId(userId);
  }

  async getUnusedTicketsByUserId(userId: string): Promise<Ticket[]> {
    return this.ticketsService.getUnusedTicketsByUserId(userId);
  }

  async getWatchHistoryByUserId(userId: string): Promise<Ticket[]> {
    return this.ticketsService.getWatchHistoryByUserId(userId);
  }
}