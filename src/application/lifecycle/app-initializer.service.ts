import { Injectable } from '@nestjs/common';
import { Role } from '@domain/auth/enums/role.enum';
import { UsersService } from '@application/users/users.service';
import { ConfigService } from '@nestjs/config';
import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class AppInitializerService {
  constructor(
    private readonly logger: PinoLogger,
    private readonly userService: UsersService,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit() {
    this.logger.info('Initializing app...');
    const existingManagers = await this.userService.findByRole(Role.MANAGER);
    if (existingManagers.length === 0) {
      const manager = await this.userService.createUser({
        email: this.configService.get('INITIAL_MANAGER_EMAIL'),
        password: this.configService.get('INITIAL_MANAGER_PASSWORD'),
        role: Role.MANAGER,
        age: 30,
        username: this.configService.get('INITIAL_MANAGER_USERNAME'),
        createdAt: new Date(),
      });
      this.logger.info('Manager created:', manager);
    }

    const existingUsers = await this.userService.findByRole(Role.CUSTOMER);
    if (existingUsers.length === 0) {
      const users = await this.userService.createUser({
        email: this.configService.get('INITIAL_USER_EMAIL'),
        password: this.configService.get('INITIAL_USER_PASSWORD'),
        role: Role.CUSTOMER,
        age: 13,
        username: this.configService.get('INITIAL_USER_USERNAME'),
        createdAt: new Date(),
      });
      this.logger.info('Users created:', users);
    }
  }
}
