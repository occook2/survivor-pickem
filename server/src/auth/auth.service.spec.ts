import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Repository } from 'typeorm';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;
  let userRepository: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        UsersService,
        JwtService,
        {
          provide: getRepositoryToken(User),
          useClass: Repository, // Provide a mock repository
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));

    // Mock the methods of UsersService
    jest.spyOn(usersService, 'findByUsername').mockImplementation(async (username: string) => {
      if (username === 'testuser') {
        return { id: 1, userName: 'testuser', password: 'testpass' } as User;
      }
      return null;
    });

    // Mock the sign method of JwtService
    jest.spyOn(jwtService, 'sign').mockImplementation((payload: any) => {
      return 'testtoken';
    });
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return a user without password if validation is successful', async () => {
      const user = await service.validateUser('testuser', 'testpass');
      expect(user).toEqual({ id: 1, userName: 'testuser' });
    });

    it('should return null if validation fails', async () => {
      const user = await service.validateUser('testuser', 'wrongpass');
      expect(user).toBeNull();
    });

    it('should return null if user is not found', async () => {
      const user = await service.validateUser('nonexistentuser', 'testpass');
      expect(user).toBeNull();
    });
  });

  describe('login', () => {
    it('should return an access token', async () => {
      const user = { username: 'testuser', id: 1 };
      const result = await service.login(user);
      expect(result).toEqual({ access_token: 'testtoken' });
    });
  });
});
