/* eslint-disable @typescript-eslint/no-unused-vars */
import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Movie } from '../../src/domain/movies/entities/movie.entity';
import { Session } from '../../src/domain/sessions/entities/session.entity';
import { Ticket } from '../../src/domain/tickets/entities/ticket.entity';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { movieData5, movieData6 } from './mocks/movie-mocks';
import { sessionData5, sessionData6, sessionData7, sessionData8, sessionData9 } from './mocks/sessions-mocks';
import { User } from '../../src/domain/users/entities/user.entity';
import { authenticateUser } from './helpers/authenticate-user';
import { createMovies, createSessions } from './helpers/data-helpers';

describe('SessionsController (e2e)', () => {
  let app: INestApplication;
  let movieRepository: Repository<Movie>;
  let sessionRepository: Repository<Session>;
  let ticketRepository: Repository<Ticket>;
  let userRepository: Repository<User>;
  let configService: ConfigService;
  let managerToken: string;
  let userToken: string;
  let firstMovieId: string;
  let secondMovieId: string;
  let firstSessionId: string;
  let secondSessionId: string;
  let managerFirstTicketId: string;
  let managerSecondTicketId: string;
  let userFirstTicketId: string;
  let userSecondTicketId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        AppModule,
        TypeOrmModule.forRoot({
          type: 'postgres',
          url: process.env.TEST_DATABASE_URL,
          entities: [__dirname + '/../../**/*.entity{.ts,.js}'],
          synchronize: true,
        }),
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    movieRepository = moduleFixture.get<Repository<Movie>>('MovieRepository');
    sessionRepository = moduleFixture.get<Repository<Session>>('SessionRepository');
    ticketRepository = moduleFixture.get<Repository<Ticket>>('TicketRepository');
    userRepository = moduleFixture.get<Repository<User>>('UserRepository');
    configService = moduleFixture.get<ConfigService>(ConfigService);

    managerToken = (await authenticateUser(app, 'INITIAL_MANAGER_EMAIL', 'INITIAL_MANAGER_PASSWORD')).access_token;
    userToken = (await authenticateUser(app, 'INITIAL_USER_EMAIL', 'INITIAL_USER_PASSWORD')).access_token;

    const movies = await createMovies(movieRepository, [movieData5, movieData6]);
    firstMovieId = movies[0].id;
    secondMovieId = movies[1].id;

    const sessions = await createSessions(sessionRepository, [sessionData5, sessionData6], movies);
    firstSessionId = sessions[0].id;
    secondSessionId = sessions[1].id;
  });

  it('/sessions/:movieId (POST) - should create session for movie with manager authorization', async () => {
    const response = await request(app.getHttpServer())
      .post(`/sessions/${firstMovieId}`)
      .send(sessionData7)
      .set('Authorization', `Bearer ${managerToken}`);
    expect(response.status).toBe(HttpStatus.CREATED);
    expect(response.body.data).toBeInstanceOf(Object);
    expect(response.body.data.date).toBe(sessionData7.date);
    expect(response.body.data.timeSlot).toBe(sessionData7.timeSlot);
    expect(response.body.data.roomNumber).toBe(sessionData7.roomNumber);
    expect(response.body.data.movie.id).toBe(firstMovieId);
  });

  it('/sessions/:movieId (POST) - should fail create session for movie without manager authorization', async () => {
    const response = await request(app.getHttpServer()).post(`/sessions/${firstMovieId}`).send(sessionData8);
    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    expect(response.body.message).toBe('Unauthorized');
  });

  it('/movies/:sessionId/sessions (POST) - should fail create session for movie with user authorization', async () => {
    const response = await request(app.getHttpServer())
      .post(`/sessions/${firstMovieId}`)
      .send(sessionData9)
      .set('Authorization', `Bearer ${userToken}`);
    expect(response.status).toBe(HttpStatus.FORBIDDEN);
    expect(response.body.message).toBe('Forbidden resource');
  });

  it('/:sessionId (DELETE) - should delete session with manager authorization', async () => {
    const response = await request(app.getHttpServer())
      .delete(`/sessions/${firstSessionId}`)
      .set('Authorization', `Bearer ${managerToken}`);
    expect(response.status).toBe(HttpStatus.OK);
    expect(response.body.data).toBeInstanceOf(Object);
    expect(response.body.data.result).toBe(true);
  });

  it('/:sessionId (DELETE) - should fail delete session with user authorization', async () => {
    const response = await request(app.getHttpServer()).delete(`/sessions/${secondSessionId}`).set('Authorization', `Bearer ${userToken}`);
    expect(response.status).toBe(HttpStatus.FORBIDDEN);
    expect(response.body.message).toBe('Forbidden resource');
  });

  it('/:sessionId (DELETE) - should fail delete session without authorization', async () => {
    const response = await request(app.getHttpServer()).delete(`/sessions/${firstSessionId}`);
    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    expect(response.body.message).toBe('Unauthorized');
  });

  afterAll(async () => {
    await app.close();
  });
});
