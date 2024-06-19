import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';

describe('UsersService', () => {
  let service: UsersService;
  let repository: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useClass: Repository, // This will provide the repository as a mock
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get<Repository<User>>(getRepositoryToken(User));

    // Mock the repository methods
    jest.spyOn(repository, 'create').mockImplementation((user: User) => user);
    jest.spyOn(repository, 'save').mockImplementation(async (user: User) => ({ id: 1, ...user }));
    jest.spyOn(repository, 'update').mockImplementation(async () => undefined);
    jest.spyOn(repository, 'findOne').mockImplementation(async (criteria: any) => {
      if (criteria.where.id === 1) {
        return {
          id: 1,
          userName: 'john',
          password: 'changeme',
          ...criteria.where,
        } as User;
      }
      return null;
    });
  });

  describe('definition', () => { 
    it('should be defined', () => {
      expect(service).toBeDefined();
    });
  });

  describe('findOne', () => {
    it('should find user', async () => {
      const user = await service.findOne(1);
      expect(user).toEqual({id: 1, userName: 'john', password: 'changeme'});
    });
    it('should return null if user does not exist', async () => {
      const user = await service.findOne(999);
      expect(user).toBeNull();
    });
  });

  describe('create', () => {
    it('should create a user', async () => {
      const createUserDto = { userName: 'jane', password: 'password' };
      const user = await service.create(createUserDto);
      expect(user).toEqual({ id: 1, ...createUserDto });
    });
  });


  describe('update', () => {
    it('should update a user', async () => {
      const updateUserDto = { password: 'changed' };
      const user = await service.update(1, updateUserDto);
      expect(user).toEqual({ id: 1, userName: 'john', password: 'changed' });
    });
  
    it('should throw an error if the user is not found during update', async () => {
      const updateUserDto = { password: 'changed' };
      await expect(service.update(999, updateUserDto)).rejects.toThrow('User with ID 999 not found');
    });
  })
  
});

