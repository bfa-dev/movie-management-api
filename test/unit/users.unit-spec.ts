import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from '../../src/api/users/users.controller';
import { UsersService } from '../../src/application/users/users.service';
import { GenericResponseDto } from '../../src/api/shared/dto/generic-response.dto';
import { User } from '../../src/domain/users/entities/user.entity';
import { Movie } from '../../src/domain/movies/entities/movie.entity';
import { Role } from '../../src/domain/auth/enums/role.enum';
import { CreateUserDto } from '../../src/api/users/dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { UserNotFoundError } from '../../src/domain/exceptions';
import { TicketsService } from '../../src/application/tickets/tickets.service';
import { MoviesService } from '../../src/application/movies/movies.service';
import { IUserRepository } from '../../src/domain/users/repositories/user-repository.interface';
import { Ticket } from '../../src/domain/tickets/entities/ticket.entity';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: jest.Mocked<UsersService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            findOne: jest.fn(),
            getWatchHistory: jest.fn(),
            findByRole: jest.fn(),
            findUserByEmailWithPassword: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    usersService = module.get(UsersService);
  });

  it('should return the user profile', async () => {
    const user: User = {
      id: '4a736f64-616c-69-6173-696f6e',
      email: 'user@example.com',
      role: 'customer',
    } as User;
    jest.spyOn(usersService, 'findOne').mockResolvedValue(user);

    const result = await controller.getUserProfile(user);

    expect(result).toEqual(new GenericResponseDto(user, 'The user profile has been successfully retrieved.'));
  });

  it('should return the user\'s watch history', async () => {
    const user: User = {
      id: '4a736f64-616c-69-6173-696f6e',
      email: 'user@example.com',
      role: 'customer',
    } as User;
    const movies: Movie[] = [{ id: 'movie1', name: 'Inception', ageRestriction: 13 } as Movie];
    jest.spyOn(usersService, 'getWatchHistory').mockResolvedValue(movies);

    const result = await controller.getWatch(user);

    expect(result).toEqual(new GenericResponseDto(movies, 'The users watch history has been successfully retrieved.'));
  });

  it('should return an empty array if the user has no watch history', async () => {
    const user: User = {
      id: '4a736f64-616c-69-6173-696f6e',
      email: 'user@example.com',
      role: 'customer',
    } as User;
    jest.spyOn(usersService, 'getWatchHistory').mockResolvedValue([]);

    const result = await controller.getWatch(user);

    expect(result).toEqual(new GenericResponseDto([], 'The users watch history has been successfully retrieved.'));
  });

  it('should return the user if found', async () => {
    const mockUser = {
      id: '4a736f64-616c-69-6173-696f6e',
      email: 'user@example.com',
      role: 'customer',
    } as User;

    jest.spyOn(usersService, 'findOne').mockResolvedValue(mockUser);

    const result = await usersService.findOne({ where: { id: '1' } });

    expect(result).toEqual(mockUser);
    expect(usersService.findOne).toHaveBeenCalledWith({ where: { id: '1' } });
  });

  it('should return user by email', async () => {
    const mockUser = {
      id: '4a736f64-616c-69-6173-696f6e',
      email: 'user@example.com',
      role: 'customer',
    } as User;

    jest.spyOn(usersService, 'findOne').mockResolvedValue(mockUser);

    const result = await usersService.findOne({ where: { email: 'user@example.com' } });

    expect(result).toEqual(mockUser);
  });

  it('should return users watch history', async () => {
    const mockUser = {
      id: '4a736f64-616c-69-6173-696f6e',
      email: 'user@example.com',
      role: 'customer',
    } as User;
    const mockWatchHistory = [{ id: '1', name: 'Inception', ageRestriction: 13 } as Movie];

    jest.spyOn(usersService, 'getWatchHistory').mockResolvedValue(mockWatchHistory);

    const result = await usersService.getWatchHistory(mockUser.id);

    expect(result).toEqual(mockWatchHistory);
  });

  it('should return users by role as manager', async () => {
    const mockUsers = [{
      id: '4a736f64-616c-69-6173-696f6e',
      email: 'user@example.com',
      role: Role.MANAGER
    } as User];

    usersService.findByRole.mockResolvedValue(mockUsers);

    const result = await usersService.findByRole(Role.MANAGER);

    expect(result).toEqual(mockUsers);
  });

  it('should return users by role as customer', async () => {
    const mockUsers = [{
      id: '4a736f64-616c-69-6173-696f6e',
      email: 'user@example.com',
      role: Role.CUSTOMER
    } as User];

    usersService.findByRole.mockResolvedValue(mockUsers);

    const result = await usersService.findByRole(Role.CUSTOMER);

    expect(result).toEqual(mockUsers);
  });

  it('should return user by email with password', async () => {
    const mockUser = {
      id: '4a736f64-616c-69-6173-696f6e',
      email: 'user@example.com',
      password: 'password',
      role: Role.MANAGER
    } as User;

    usersService.findUserByEmailWithPassword.mockResolvedValue(mockUser);

    const result = await usersService.findUserByEmailWithPassword('user@example.com');

    expect(result).toEqual(mockUser);
  });
});

describe('UsersService', () => {
  let usersService: UsersService;
  let usersRepository: jest.Mocked<IUserRepository>;
  let ticketsService: jest.Mocked<TicketsService>;
  let moviesService: jest.Mocked<MoviesService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: 'IUserRepository',
          useValue: {
            findOne: jest.fn(),
            findByEmail: jest.fn(),
            findByEmailWithPassword: jest.fn(),
            save: jest.fn(),
            findByRole: jest.fn(),
          },
        },
        {
          provide: TicketsService,
          useValue: {
            getUsersUsedTickets: jest.fn(),
          },
        },
        {
          provide: MoviesService,
          useValue: {
            findMoviesByIds: jest.fn(),
          },
        },
      ],
    }).compile();

    usersService = module.get<UsersService>(UsersService);
    usersRepository = module.get('IUserRepository');
    ticketsService = module.get(TicketsService);
    moviesService = module.get(MoviesService);
  });

  it('should throw UserNotFoundError when user is not found', async () => {
    usersRepository.findByEmail.mockResolvedValue(null);

    await expect(usersService.findOne({ where: { id: '1' } })).rejects.toThrow(UserNotFoundError);
  });

  it('should find user by email', async () => {
    const mockUser = {
      id: '4a736f64-616c-69-6173-696f6e',
      email: 'user@example.com',
      role: 'customer',
    } as User;
    usersRepository.findByEmail.mockResolvedValue(mockUser);

    const result = await usersService.findUserByEmail('user@example.com');

    expect(result).toEqual(mockUser);
    expect(usersRepository.findByEmail).toHaveBeenCalledWith('user@example.com');
  });

  it('should create a new user', async () => {
    const createUserDto: CreateUserDto = {
      username: 'testuser',
      password: 'password123',
      age: 25,
      role: Role.CUSTOMER,
      email: 'testuser@example.com',
    };

    const hashedPassword = 'hashedPassword';
    const mockUser = {
      ...createUserDto,
      id: '4a736f64-616c-69-6173-696f6e',
      password: hashedPassword
    } as User;

    jest.spyOn(bcrypt, 'hash').mockImplementation(() => Promise.resolve(hashedPassword));
    usersRepository.save.mockResolvedValue(mockUser);

    const result = await usersService.createUser(createUserDto);

    expect(result).toEqual(mockUser);
    expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
    expect(usersRepository.save).toHaveBeenCalledWith(expect.objectContaining({
      username: 'testuser',
      password: hashedPassword,
      age: 25,
      role: Role.CUSTOMER,
      email: 'testuser@example.com',
    }));
  });

  it('should get user watch history', async () => {
    const userId = '1';
    const mockTickets: Ticket[] = [
      {
        id: '4a736f64-616c-69-6173-696f6e',
        userId: '1',
        movieId: 'movie1',
        sessionId: 's1',
        used: true
      },
      {
        id: '4a736f64-616c-69-6173-696f6e',
        userId: '1',
        movieId: 'movie2', sessionId: 's2', used: true }
    ];
    const mockMovies = [
      { id: 'movie1', name: 'Movie 1' },
      { id: 'movie2', name: 'Movie 2' },
    ] as Movie[];

    ticketsService.getUsersUsedTickets.mockResolvedValue(mockTickets);
    moviesService.findMoviesByIds.mockResolvedValue(mockMovies);

    const result = await usersService.getWatchHistory(userId);

    expect(result).toEqual(mockMovies);
    expect(ticketsService.getUsersUsedTickets).toHaveBeenCalledWith(userId);
    expect(moviesService.findMoviesByIds).toHaveBeenCalledWith(['movie1', 'movie2']);
  });
});