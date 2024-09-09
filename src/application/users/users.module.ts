import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from '@api/users/users.controller';
import { User } from '@domain/users/entities/user.entity';
import { UserRepository } from '@infrastructure/repositories/user.repository';
import { TicketsModule } from '@application/tickets/tickets.module';
import { MoviesModule } from '@application/movies/movies.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), TicketsModule, MoviesModule],
  providers: [
    {
      provide: 'IUserRepository',
      useClass: UserRepository,
    },
    UsersService,
  ],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
