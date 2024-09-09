import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '@application/users/users.service';
import * as bcrypt from 'bcrypt';
import { LoginDto } from '@api/auth/dto/login.dto';
import { CreateUserDto } from '@api/users/dto/create-user.dto';
import { CreateManagerDto } from '@api/users/dto/create-manager.dto';
import { UserAlreadyExistsError, UserNotAuthorizedError } from '@domain/exceptions';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) { }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findUserByEmailWithPassword(email);
    if (user && await bcrypt.compare(password, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UserNotAuthorizedError();
    }
    const payload = { email: user.email, sub: user.id, role: user.role, age: user.age, id: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async register(createUserDto: CreateUserDto) {
    const existingUser = await this.usersService.findUserByEmail(createUserDto.email);
    if (existingUser) {
      throw new UserAlreadyExistsError();
    }

    const user = await this.usersService.createUser(
      createUserDto,
    );

    const payload = { email: user.email, sub: user.id, role: user.role, age: user.age, id: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async createManager(createManagerDto: CreateManagerDto) {
    const existingManager = await this.usersService.findUserByEmail(createManagerDto.email);
    if (existingManager) {
      throw new UserAlreadyExistsError();
    }

    const manager = await this.usersService.createUser(createManagerDto);

    const payload = { email: manager.email, sub: manager.id, role: manager.role };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}