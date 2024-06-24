import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);

    // Mock the methods of UsersService
    jest.spyOn(service, 'create').mockImplementation(async (createUserDto: CreateUserDto) => {
      return { id: 1, ...createUserDto} as User;
    });

    jest.spyOn(service, 'findAll').mockImplementation(async () => {
      return [{ id: 1, userName: 'jane', password: 'password' }] as User[];
    });

    jest.spyOn(service, 'findOne').mockImplementation(async (id: number) => {
      if (id === 1) {
        return { id: 1, userName: 'jane', password: 'password' } as User;
      }
      return null;
    });

    jest.spyOn(service, 'update').mockImplementation(async (id: number, updateUserDto: UpdateUserDto) => {
      if (id === 1) {
        return { id: 1, userName: 'jane', ...updateUserDto } as User;
      }
      return null;
    });

    jest.spyOn(service, 'remove').mockImplementation(async (id: number) => {
      if (id === 1) {
        return;
      }
      throw new Error('User not found');
    });
  });

  describe('Definition', () => {
    it('should be defined', () => {
      expect(controller).toBeDefined();
    });
  });
  
  describe('create', () => {
    it('should create a user', async () => {
      const createUserDto: CreateUserDto = { userName: 'jane', password: 'password' };
      const result = await controller.create(createUserDto);
      expect(result).toEqual({ id: 1, ...createUserDto });
    });
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const result = await controller.findAll();
      expect(result).toEqual([{ id: 1, userName: 'jane', password: 'password' }]);
    });
  });

  describe('findOne', () => {
    it('should return a single user', async () => {
      const result = await controller.findOne(1);
      expect(result).toEqual({ id: 1, userName: 'jane', password: 'password' });
    });

    it('should return null if user is not found', async () => {
      const result = await controller.findOne(999);
      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const updateUserDto: UpdateUserDto = { password: 'newpassword' };
      const result = await controller.update(1, updateUserDto);
      expect(result).toEqual({ id: 1, userName: 'jane', password: 'newpassword' });
    });

    it('should return null if user is not found', async () => {
      const updateUserDto: UpdateUserDto = { password: 'newpassword' };
      const result = await controller.update(999, updateUserDto);
      expect(result).toBeNull();
    });
  });

  describe('remove', () => {
    it('should remove a user', async () => {
      await expect(controller.remove(1)).resolves.toBeUndefined();
    });

    it('should throw an error if user is not found', async () => {
      await expect(controller.remove(999)).rejects.toThrow('User not found');
    });
  });
}); 

