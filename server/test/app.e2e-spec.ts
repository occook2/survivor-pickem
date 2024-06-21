import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../src/users/entities/user.entity';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let jwtToken: string;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        AppModule,
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [User],
          synchronize: true,
          dropSchema: true,
        })],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close(); // Ensure proper teardown
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  it('/users (GET)', () => {
    return request(app.getHttpServer())
    .get('/users')
    .expect(401)
  });

  it('should create a new user, login, and get users with auth', async () => {
    // Step 1: Create a new user
    await request(app.getHttpServer())
      .post('/users')
      .send({ userName: 'john', password: 'testpass'})
      .expect(201);

    // Step 2: Login with the new user to get a JWT token
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ userName: 'john', password: 'testpass'})
      .expect(201);
    
    jwtToken = loginResponse.body.access_token;

    // Step 3: Use JWT Token for API request
    return request(app.getHttpServer())
      .get('/users')
      .set('Authorization', `Bearer ${jwtToken}`)
      .expect(200)
      .then((response) => {
        expect(response.body).toEqual(expect.any(Array));
        expect(response.body.length).toBeGreaterThan(0);
        expect(response.body[0]).toHaveProperty('userName', 'john');
      });
  });

  it('should create new users, login, and get profiles using Auth Tokens', async () => {
    // Step 1: Create a new users
    await request(app.getHttpServer())
      .post('/users')
      .send({ userName: 'john', password: 'testpass'})
      .expect(201);

      await request(app.getHttpServer())
      .post('/users')
      .send({ userName: 'jane', password: 'testpassword'})
      .expect(201);

    // Step 2: Attempt Profile API without logging in, expect Unauthorized Exception
    request(app.getHttpServer())
      .get('/auth/profile')
      .set('Authorization', `Bearer NotAValidToken`)
      .expect(401);
    
    // Step 3: Login with credentials of created users
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ userName: 'john', password: 'testpass'})
      .expect(201);

    const secondLoginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ userName: 'jane', password: 'testpassword'})
      .expect(201);

    // Step 4: Use JWT Tokens to use profile API
    jwtToken = loginResponse.body.access_token;
    const jwtToken2 = secondLoginResponse.body.access_token;

    expect(jwtToken).not.toEqual(jwtToken2);

    request(app.getHttpServer())
      .get('/auth/profile')
      .set('Authorization', `Bearer ${jwtToken}`)
      .expect(200)
      .then((response) => {
        expect(response.body).toHaveProperty('userName', 'john');
      });

    return request(app.getHttpServer())
      .get('/auth/profile')
      .set('Authorization', `Bearer ${jwtToken2}`)
      .expect(200)
      .then((response) => {
        expect(response.body).toHaveProperty('userName', 'jane');
      });
  });
});
