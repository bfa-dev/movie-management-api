import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../../src/application/auth/auth.service';
import { UsersService } from '../../src/application/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { UserAlreadyExistsError, UserNotAuthorizedError } from '../../src/domain/exceptions';
import { LoginDto } from '../../src/api/auth/dto/login.dto';
import { CreateUserDto } from '../../src/api/users/dto/create-user.dto';
import { CreateManagerDto } from '../../src/api/users/dto/create-manager.dto';
import { Role } from '../../src/domain/auth/enums/role.enum';
import { User } from '../../src/domain/users/entities/user.entity';

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findUserByEmailWithPassword: jest.fn(),
            findUserByEmail: jest.fn(),
            createUser: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return user data without password if credentials are valid', async () => {
      const mockUser = { id: '1', email: 'test@example.com', password: 'hashedPassword' };
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const compareSpy = jest.spyOn(require('bcrypt'), 'compare').mockResolvedValue(true);

      (usersService.findUserByEmailWithPassword as jest.Mock).mockResolvedValue(mockUser);

      const result = await authService.validateUser('test@example.com', 'password');

      expect(result).toEqual({ id: '1', email: 'test@example.com' });
      expect(compareSpy).toHaveBeenCalledWith('password', 'hashedPassword');
    });

    it('should return null if credentials are invalid', async () => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const compareSpy = jest.spyOn(require('bcrypt'), 'compare').mockResolvedValue(false);

      (usersService.findUserByEmailWithPassword as jest.Mock).mockResolvedValue({ password: 'hashedPassword' });

      const result = await authService.validateUser('test@example.com', 'wrongPassword');

      expect(result).toBeNull();
      expect(compareSpy).toHaveBeenCalledWith('wrongPassword', 'hashedPassword');
    });
  });

  describe('login', () => {
    it('should return a JWT token if login is successful', async () => {
      const loginDto: LoginDto = { email: 'test@example.com', password: 'password' };
      const mockUser = {
        id: '4a736f64-616c-69-6173-696f6e',
        email: 'test@example.com',
        role: 'customer',
        age: 25,
      };

      jest.spyOn(authService, 'validateUser').mockResolvedValue(mockUser);
      (jwtService.sign as jest.Mock).mockReturnValue('jwtToken');

      const result = await authService.login(loginDto);

      expect(result).toEqual({ access_token: 'jwtToken' });
      expect(authService.validateUser).toHaveBeenCalledWith('test@example.com', 'password');
      expect(jwtService.sign).toHaveBeenCalledWith({
        email: 'test@example.com',
        sub: '4a736f64-616c-69-6173-696f6e',
        role: 'customer',
        age: 25,
        id: '4a736f64-616c-69-6173-696f6e',
      });
    });

    it('should throw UserNotAuthorizedError if credentials are invalid', async () => {
      jest.spyOn(authService, 'validateUser').mockResolvedValue(null);

      await expect(authService.login({ email: 'test@example.com', password: 'password' })).rejects.toThrow(UserNotAuthorizedError);
    });

    it('should throw an error if an exception occurs during validation', async () => {
      jest.spyOn(authService, 'validateUser').mockRejectedValue(new Error('Unexpected error'));

      await expect(authService.login({ email: 'test@example.com', password: 'password' })).rejects.toThrow('Unexpected error');
    });
  });

  describe('register', () => {
    it('should return a JWT token if registration is successful', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        password: 'password',
        username: 'TestUser',
        age: 25,
        role: Role.CUSTOMER,
      };
      const mockUser = {
        id: '4a736f64-616c-69-6173-696f6e',
        email: 'test@example.com',
        role: 'customer',
        age: 25,
      };

      (usersService.findUserByEmail as jest.Mock).mockResolvedValue(null);
      (usersService.createUser as jest.Mock).mockResolvedValue(mockUser);
      (jwtService.sign as jest.Mock).mockReturnValue('jwtToken');

      const result = await authService.register(createUserDto);

      expect(result).toEqual({ access_token: 'jwtToken' });
      expect(usersService.createUser).toHaveBeenCalledWith(createUserDto);
    });

    it('should throw UserAlreadyExistsError if the user already exists', async () => {
      (usersService.findUserByEmail as jest.Mock).mockResolvedValue({ id: '1', email: 'test@example.com' });

      await expect(
        authService.register({
          email: 'test@example.com',
          password: 'password',
          username: 'TestUser',
          age: 25,
          role: Role.CUSTOMER,
        }),
      ).rejects.toThrow(UserAlreadyExistsError);
    });

    it('should throw an error if an exception occurs during registration', async () => {
      (usersService.findUserByEmail as jest.Mock).mockRejectedValue(new Error('Unexpected error'));

      await expect(
        authService.register({
          email: 'test@example.com',
          password: 'password',
          username: 'TestUser',
          age: 25,
          role: Role.CUSTOMER,
        }),
      ).rejects.toThrow('Unexpected error');
    });
  });

  describe('createManager', () => {
    it('should return a JWT token if manager creation is successful', async () => {
      const createManagerDto: CreateManagerDto = {
        email: 'manager@example.com',
        password: 'password',
        username: 'ManagerUser',
        age: 30,
        role: Role.MANAGER,
      };
      const mockManager = {
        id: '4a736f64-616c-69-6173-696f6e',
        email: 'manager@example.com',
        role: 'manager',
      };

      (usersService.findUserByEmail as jest.Mock).mockResolvedValue(null);
      (usersService.createUser as jest.Mock).mockResolvedValue(mockManager);
      (jwtService.sign as jest.Mock).mockReturnValue('jwtToken');

      const result = await authService.createManager(createManagerDto);

      expect(result).toEqual({ access_token: 'jwtToken' });
      expect(usersService.createUser).toHaveBeenCalledWith(createManagerDto);
    });

    it('should throw UserAlreadyExistsError if the manager already exists', async () => {
      (usersService.findUserByEmail as jest.Mock).mockResolvedValue({ id: '1', email: 'manager@example.com' });

      await expect(
        authService.createManager({
          email: 'manager@example.com',
          password: 'password',
          username: 'ManagerUser',
          age: 30,
          role: Role.MANAGER,
        }),
      ).rejects.toThrow(UserAlreadyExistsError);
    });

    it('should throw an error if an exception occurs during manager creation', async () => {
      (usersService.findUserByEmail as jest.Mock).mockRejectedValue(new Error('Unexpected error'));

      await expect(
        authService.createManager({
          email: 'manager@example.com',
          password: 'password',
          username: 'ManagerUser',
          age: 30,
          role: Role.MANAGER,
        }),
      ).rejects.toThrow('Unexpected error');
    });
  });

  it('should return JWT token for valid login credentials', async () => {
    const loginDto = { email: 'user@example.com', password: 'password' };
    const user = { id: '1', email: 'user@example.com', role: 'customer', age: 20 } as User;

    jest.spyOn(authService, 'validateUser').mockResolvedValue(user);
    jest.spyOn(jwtService, 'sign').mockReturnValue('jwtToken');

    const result = await authService.login(loginDto);

    expect(result.access_token).toBe('jwtToken');
  });
});
