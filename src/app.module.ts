import { Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { AuthModule } from '@application/auth/auth.module';
import { UsersModule } from '@application/users/users.module';
import { JwtAuthGuard } from '@application/guards/jwt-auth.guard';
import { RolesGuard } from '@application/guards/roles.guard';
import { MoviesModule } from '@application/movies/movies.module';
import { TicketsModule } from '@application/tickets/tickets.module';
import { ConfigModule } from './infrastructure/config/config.module';
import { CacheModule } from '@infrastructure/redis/redis.module';
import { DatabaseModule } from '@infrastructure/database/database.module';
import { BaseExceptionFilter } from '@application/filters';
import { LoggingInterceptor, TimeoutInterceptor } from '@application/interceptors';

@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
    AuthModule,
    UsersModule,
    MoviesModule,
    TicketsModule,
    CacheModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_FILTER,
      useClass: BaseExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TimeoutInterceptor,
    },
  ],
})
export class AppModule { }
