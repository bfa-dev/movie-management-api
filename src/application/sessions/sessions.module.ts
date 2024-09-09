import { Module } from '@nestjs/common';
import { SessionsController } from '@api/sessions/sessions.controller';
import { SessionsService } from '@application/sessions/sessions.service';
import { Session } from '@domain/sessions/entities/session.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SessionRepository } from '@infrastructure/repositories/session.repository';
import { MoviesModule } from '@application/movies/movies.module';

@Module({
  imports: [TypeOrmModule.forFeature([Session]), MoviesModule],
  controllers: [SessionsController],
  providers: [
    SessionsService,
    {
      provide: 'ISessionRepository',
      useClass: SessionRepository,
    },
  ],
  exports: [SessionsService],
})
export class SessionsModule {}
