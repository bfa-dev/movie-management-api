// create manager if not exists when app starts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '@domain/auth/role.enum';
import { UsersService } from '@application/users/users.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppInitializerService {
  constructor(
    private readonly userService: UsersService,
    private readonly configService: ConfigService,
  ) { }

  async onModuleInit() {
    const existingManagers = await this.userService.findByRole(Role.MANAGER);
    if (existingManagers.length === 0) {
      const manager = this.userService.create({
        email: this.configService.get('INITIAL_MANAGER_EMAIL'),
        password: this.configService.get('INITIAL_MANAGER_PASSWORD'),
        role: Role.MANAGER,
        age: 30,
        username: 'initial-manager',
        createdAt: new Date(),
      });
    }
  }
}
