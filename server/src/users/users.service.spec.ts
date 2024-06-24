import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository, DeleteResult } from 'typeorm';
import { NotFoundException } from '@nestjs/common';

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
    jest.spyOn(repository, 'delete').mockImplementation(async (id: number) => ({
      raw: undefined,
      affected: id === 1 ? 1 : 0,
    } as DeleteResult));
    jest.spyOn(repository, 'findOne').mockImplementation(async (criteria: any) => {
      if (criteria.where.id === 1 || criteria.where.userName === 'john') {
        return {
          id: 1,
          userName: 'john',
          password: 'changeme',
          ...criteria.where,
        } as User;
      }
      return null;
    });
    jest.spyOn(repository, 'find').mockImplementation(async () => [
      { id: 1, userName: 'john', password: 'changeme' },
    ] as User[]);
  });

  describe('definition', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });
  });

  describe('findOne', () => {
    it('should find user by id', async () => {
      const user = await service.findOne(1);
      expect(user).toEqual({ id: 1, userName: 'john', password: 'changeme' });
    });

    it('should return null if user does not exist', async () => {
      const user = await service.findOne(999);
      expect(user).toBeNull();
    });
  });

  describe('findByUsername', () => {
    it('should find user by username', async () => {
      const user = await service.findByUsername('john');
      expect(user).toEqual({ id: 1, userName: 'john', password: 'changeme' });
    });

    it('should return null if user does not exist', async () => {
      const user = await service.findByUsername('nonexistent');
      expect(user).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const users = await service.findAll();
      expect(users).toEqual([{ id: 1, userName: 'john', password: 'changeme' }]);
    });
  });

  describe('remove', () => {
    it('should remove a user', async () => {
      await expect(service.remove(1)).resolves.toBeUndefined();
    });

    it('should throw an error if user is not found', async () => {
      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
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
  });
});
