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
import {
  movieData1,
  movieData2,
  movieData7,
  movieData8,
  movieData9,
  movieData10
} from './mocks/movie-mocks';
import { User } from '../../src/domain/users/entities/user.entity';
import { ERRORS } from '../../src/domain/exceptions/messages';

describe('MoviesController (e2e)', () => {
  let app: INestApplication;
  let movieRepository: Repository<Movie>;
  let sessionRepository: Repository<Session>;
  let ticketRepository: Repository<Ticket>;
  let userRepository: Repository<User>;
  let configService: ConfigService;
  let managerToken: string;
  let userToken: string;
  let movieId: string;
  let movieIds: string[];
  let sessionId: string;

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

    let managerEmail = configService.get('INITIAL_MANAGER_EMAIL');
    let managerPassword = configService.get('INITIAL_MANAGER_PASSWORD');
    let managerLoginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: managerEmail,
        password: managerPassword,
      });
    managerToken = managerLoginResponse.body.data.access_token;

    let userEmail = configService.get('INITIAL_USER_EMAIL');
    let userPassword = configService.get('INITIAL_USER_PASSWORD');
    let userLoginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: userEmail,
        password: userPassword,
      });
    userToken = userLoginResponse.body.data.access_token;
  });

  it('/movies (POST) - should create movie with sessions with manager authorization', async () => {
    const response = await request(app.getHttpServer())
      .post('/movies')
      .send(movieData1)
      .set('Authorization', `Bearer ${managerToken}`);
    movieId = response.body.data.id;
    sessionId = response.body.data.sessions[0].id;
    Object.assign(movieData2.sessions[0], { id: sessionId });
    expect(response.status).toBe(HttpStatus.CREATED);
    expect(response.body.data).toBeInstanceOf(Object);
    expect(response.body.data.name).toBe(movieData1.name);
    expect(response.body.data.ageRestriction).toBe(movieData1.ageRestriction);
    expect(response.body.data.sessions).toBeInstanceOf(Array);
    expect(response.body.data.sessions.length).toBe(movieData1.sessions.length);
    expect(response.body.data.sessions[0].date).toBe(movieData1.sessions[0].date);
    expect(response.body.data.sessions[0].timeSlot).toBe(movieData1.sessions[0].timeSlot);
    expect(response.body.data.sessions[0].roomNumber).toBe(movieData1.sessions[0].roomNumber);
  });

  it('/movies (POST) - should fail create movie without manager authorization', async () => {
    const response = await request(app.getHttpServer())
      .post('/movies')
      .send(movieData1);
    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    expect(response.body.message).toBe('Unauthorized');
  });

  it('/movies (POST) - should fail create movie with user authorization', async () => {
    const response = await request(app.getHttpServer())
      .post('/movies')
      .send(movieData1)
      .set('Authorization', `Bearer ${userToken}`);
    expect(response.status).toBe(HttpStatus.FORBIDDEN);
    expect(response.body.message).toBe('Forbidden resource');
  });

  it('/movies (GET) - should get all movies', async () => {
    const response = await request(app.getHttpServer()).get('/movies');
    expect(response.status).toBe(HttpStatus.OK);
    expect(response.body.data).toBeInstanceOf(Array);
  });

  it('/movies/:id (GET) - should get movie by id', async () => {
    const response = await request(app.getHttpServer()).get(`/movies/${movieId}`);
    expect(response.status).toBe(HttpStatus.OK);
    expect(response.body.data).toBeInstanceOf(Object);
    expect(response.body.data.name).toBe(movieData1.name);
    expect(response.body.data.ageRestriction).toBe(movieData1.ageRestriction);
    expect(response.body.data.sessions).toBeInstanceOf(Array);
    expect(response.body.data.sessions.length).toBe(movieData1.sessions.length);
    expect(response.body.data.sessions[0].date).toBe(movieData1.sessions[0].date);
    expect(response.body.data.sessions[0].timeSlot).toBe(movieData1.sessions[0].timeSlot);
    expect(response.body.data.sessions[0].roomNumber).toBe(movieData1.sessions[0].roomNumber);
  });

  it('/movies/:id (PUT) - should update movie with manager authorization', async () => {
    const response = await request(app.getHttpServer())
      .put(`/movies/${movieId}`)
      .send(movieData2)
      .set('Authorization', `Bearer ${managerToken}`);
    expect(response.status).toBe(HttpStatus.OK);
    expect(response.body.data).toBeInstanceOf(Object);
    expect(response.body.data.name).toBe(movieData2.name);
    expect(response.body.data.ageRestriction).toBe(movieData2.ageRestriction);
    expect(response.body.data.sessions).toBeInstanceOf(Array);
    expect(response.body.data.sessions.length).toBe(movieData2.sessions.length);
    expect(response.body.data.sessions[0].date).toBe(movieData2.sessions[0].date);
    expect(response.body.data.sessions[0].timeSlot).toBe(movieData2.sessions[0].timeSlot);
    expect(response.body.data.sessions[0].roomNumber).toBe(movieData2.sessions[0].roomNumber);
  });

  it('/movies/:id (PUT) - should fail update movie without manager authorization', async () => {
    const response = await request(app.getHttpServer())
      .put(`/movies/${movieId}`)
      .send(movieData2);
    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    expect(response.body.message).toBe('Unauthorized');
  });

  it('/movies/:id (PUT) - should fail update movie with user authorization', async () => {
    const response = await request(app.getHttpServer())
      .put(`/movies/${movieId}`)
      .send(movieData2)
      .set('Authorization', `Bearer ${userToken}`);
    expect(response.status).toBe(HttpStatus.FORBIDDEN);
    expect(response.body.message).toBe('Forbidden resource');
  });

  it('/movies/bulk-add (POST) - should bulk add movies with manager authorization', async () => {
    const response = await request(app.getHttpServer())
      .post('/movies/bulk-add')
      .send({ movies: [movieData7, movieData8] })
      .set('Authorization', `Bearer ${managerToken}`);
    expect(response.status).toBe(HttpStatus.CREATED);
    expect(response.body.data).toBeInstanceOf(Array);
    movieIds = response.body.data.map((movie: Movie) => movie.id);
  });

  it('/movies/bulk-add (POST) - should rollback transaction when trying to add different movies with conflicting sessions', async () => {
    const response = await request(app.getHttpServer())
      .post('/movies/bulk-add')
      .send({ movies: [movieData9, movieData10] })
      .set('Authorization', `Bearer ${managerToken}`);
    expect(response.status).toBe(HttpStatus.CONFLICT);
    expect(response.body.name).toBe(ERRORS.SESSION_ALREADY_EXISTS.error);
    expect(response.body.message).toBe(ERRORS.SESSION_ALREADY_EXISTS.message);
  });

  it('/movies/bulk-delete (DELETE) - should bulk delete movies with manager authorization', async () => {
    const response = await request(app.getHttpServer())
      .post('/movies/bulk-delete')
      .send({ movieIds: movieIds })
      .set('Authorization', `Bearer ${managerToken}`);
    expect(response.status).toBe(HttpStatus.CREATED);
  });

  it('/movies/:id (DELETE) - should delete movie with manager authorization', async () => {
    const response = await request(app.getHttpServer())
      .delete(`/movies/${movieId}`)
      .set('Authorization', `Bearer ${managerToken}`);
    expect(response.status).toBe(HttpStatus.OK);
    expect(response.body.data).toBeInstanceOf(Object);
    expect(response.body.data.id).toBe(movieId);
  });

  it('/movies/:id (DELETE) - should fail delete movie without manager authorization', async () => {
    const response = await request(app.getHttpServer())
      .delete(`/movies/${movieId}`);
    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    expect(response.body.message).toBe('Unauthorized');
  });

  it('/movies/:id (DELETE) - should fail delete movie with user authorization', async () => {
    const response = await request(app.getHttpServer())
      .delete(`/movies/${movieId}`)
      .set('Authorization', `Bearer ${userToken}`);
    expect(response.status).toBe(HttpStatus.FORBIDDEN);
    expect(response.body.message).toBe('Forbidden resource');
  });

  afterAll(async () => {
    await app.close();
  });
});
