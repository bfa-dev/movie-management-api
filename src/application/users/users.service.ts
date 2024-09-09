import { Injectable, Inject } from '@nestjs/common';
import { User } from '@domain/users/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { Role } from '@domain/auth/enums/role.enum';
import { IUserRepository } from '@domain/users/repositories/user-repository.interface';
import { CreateUserDto } from '@api/users/dto/create-user.dto';
import { TicketsService } from '@application/tickets/tickets.service';
import { FindOneOptions } from 'typeorm';
import { UserNotFoundError } from '@domain/exceptions';
import { Movie } from '@domain/movies/entities/movie.entity';
import { MoviesService } from '@application/movies/movies.service';

@Injectable()
export class UsersService {
  constructor(
    @Inject('IUserRepository')
    private usersRepository: IUserRepository,
    private ticketsService: TicketsService,
    private moviesService: MoviesService,
  ) {}

  async findOne(options: FindOneOptions<User>): Promise<User | undefined> {
    const user = await this.usersRepository.findOne(options);
    if (!user) {
      throw new UserNotFoundError();
    }
    return user;
  }

  async findUserByEmail(email: string): Promise<User | undefined> {
    return this.usersRepository.findByEmail(email);
  }

  async findUserByEmailWithPassword(email: string): Promise<User | undefined> {
    return this.usersRepository.findByEmailWithPassword(email);
  }

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const user = new User();
    user.username = createUserDto.username;
    user.password = hashedPassword;
    user.age = createUserDto.age;
    user.role = createUserDto.role;
    user.email = createUserDto.email;
    return this.usersRepository.save(user);
  }

  async getWatchHistory(userId: string): Promise<Movie[]> {
    const usedTickets = await this.ticketsService.getUsersUsedTickets(userId);
    const movies = await this.moviesService.findMoviesByIds(usedTickets.map((ticket) => ticket.movieId));
    return movies;
  }

  async findByRole(role: Role): Promise<User[]> {
    return this.usersRepository.findByRole(role);
  }
}
