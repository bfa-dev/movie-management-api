import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { User } from '../../src/domain/users/entities/user.entity';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let managerToken: string;
  let userRepository: Repository<User>;
  let configService: ConfigService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        AppModule,
        TypeOrmModule.forRoot({
          url: process.env.TEST_DATABASE_URL,
          type: 'postgres',
          entities: [__dirname + '/../../**/*.entity{.ts,.js}'],
          synchronize: true,
        }),
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    userRepository = moduleFixture.get<Repository<User>>('UserRepository');
    configService = moduleFixture.get<ConfigService>(ConfigService);
  });

  it('/auth/register (POST)', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        age: 20,
        username: 'testuser',
      })
      .expect(201);

    expect(response.body.data).toHaveProperty('access_token');
  });

  it('/auth/login (POST)', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123',
      })
      .expect(201);

    expect(response.body.data).toHaveProperty('access_token');
  });

  it('/auth/login (POST) - Invalid credentials', async () => {
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'test@example.com',
        password: 'wrongpassword',
      })
      .expect(401);
  });

  it('/auth/create-manager (POST) - Unauthorized', async () => {
    await request(app.getHttpServer())
      .post('/auth/create-manager')
      .send({
        email: 'manager@example.com',
        password: 'managerpass',
        username: 'Manager User',
      })
      .expect(401);
  });

  it('/auth/create-manager (POST) - Authorized', async () => {
    const email = configService.get('INITIAL_MANAGER_EMAIL');
    const password = configService.get('INITIAL_MANAGER_PASSWORD');
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: email,
        password: password,
      })
      .expect(201);

    managerToken = loginResponse.body.data.access_token;

    const response = await request(app.getHttpServer())
      .post('/auth/create-manager')
      .set('Authorization', `Bearer ${managerToken}`)
      .send({
        email: 'another-manager@example.com',
        password: 'anotherpass',
        username: 'Another Manager',
        age: 20,
      })
      .expect(201);

    expect(response.body.data).toHaveProperty('access_token');
  });

  afterAll(async () => {
    await userRepository.delete({});
    await app.close();
  });
});
