import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../src/users/entities/user.entity';

describe('UsersController (e2e)', () => {
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

  it('/users (GET)', () => {
    return request(app.getHttpServer())
      .get('/users')
      .expect(401);
  });

  it('should test all CRUD operations', async () => {
    // Step 1: Create new users
    const createUser1 = await request(app.getHttpServer())
      .post('/users')
      .send({ userName: 'john', password: 'testpass' })
      .expect(201);

    const createUser2 = await request(app.getHttpServer())
      .post('/users')
      .send({ userName: 'jane', password: 'testpassword' })
      .expect(201);

    // Step 2: Test Find Functions (unauthorized)
    await request(app.getHttpServer())
      .get('/users')
      .expect(401);

    // Step 3: Login to get JWT Auth Token to use users APIs
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ userName: 'john', password: 'testpass' })
      .expect(201);
    
    jwtToken = loginResponse.body.access_token;

    // Step 4: Test Find Functions (authorized)
    await request(app.getHttpServer())
      .get('/users')
      .set('Authorization', `Bearer ${jwtToken}`)
      .expect(200)
      .then((response) => {
        expect(response.body).toEqual(expect.any(Array));
        expect(response.body.length).toBeGreaterThan(1);
        expect(response.body[0]).toHaveProperty('userName', 'john');
        expect(response.body[1]).toHaveProperty('userName', 'jane');
      });

    // Step 5: Test Find One
    await request(app.getHttpServer())
      .get(`/users/${createUser1.body.id}`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .expect(200)
      .then((response) => {
        expect(response.body).toHaveProperty('userName', 'john');
      });

    // Step 6: Test Update
    await request(app.getHttpServer())
      .patch(`/users/${createUser1.body.id}`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({ userName: 'johnny' })
      .expect(200)
      .then((response) => {
        expect(response.body).toHaveProperty('userName', 'johnny');
      });

    await request(app.getHttpServer())
      .get(`/users/${createUser1.body.id}`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .expect(200)
      .then((response) => {
        expect(response.body).toHaveProperty('userName', 'johnny');
      });

    // Step 7: Test Delete
    await request(app.getHttpServer())
    .delete(`/users/${createUser1.body.id}`)
    .set('Authorization', `Bearer ${jwtToken}`)
    .expect(200);

    // Adding delay before verifying deletion
    await new Promise(resolve => setTimeout(resolve, 500));

    await request(app.getHttpServer())
    .get(`/users/${createUser1.body.id}`)
    .set('Authorization', `Bearer ${jwtToken}`)
    .expect(404);
  });
});
