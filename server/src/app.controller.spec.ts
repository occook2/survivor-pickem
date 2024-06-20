import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth/auth.service';
import { AppController } from './app.controller';
import { UsersService } from './users/users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './users/entities/user.entity';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';

describe('AppController', () => {
  let controller: AppController;
  let authService: AuthService;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [AppController], // Register the controller here
      providers: [
        AuthService,
        UsersService,
        JwtService,
        {
          provide: getRepositoryToken(User),
          useClass: Repository, // This will provide the repository as a mock
        },
      ],
    }).compile();

    authService = moduleRef.get<AuthService>(AuthService);
    controller = moduleRef.get<AppController>(AppController);

    // Mock AuthService methods
    jest.spyOn(authService, 'login').mockImplementation(async (user) => ({
      access_token: 'mockAccessToken',
    }));
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('Hello World', () => {
    it('should return Hello World', async () => {
      expect(await controller.getHelloWorld()).toEqual("Hello World!");
    });
  });

  describe('login', () => {
    it('should return an access token', async () => {
      const req = { user: { username: 'test', password: 'test' } };
      const result = await controller.login(req);
      expect(result).toEqual({ access_token: 'mockAccessToken' });
    });
  });

  describe('getProfile', () => {
    it('should return the user profile', async () => {
      const req = { user: { username: 'test', password: 'test' } };
      const result = await controller.getProfile(req);
      expect(result).toEqual(req.user);
    });
  });
});
