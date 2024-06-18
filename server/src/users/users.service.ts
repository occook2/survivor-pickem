import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  // TODO: Remove hardcoded users table
  private readonly users = [
    {
      userId: 1,
      username: 'john',
      password: 'changeme',
    },
    {
      userId: 2,
      username: 'maria',
      password: 'guess',
    },
  ];

  // findOne function that works on a static table
  // async findOne(username: string) {
  //   return this.users.find(user => user.username === username);
  // }

  findOne(userName: string): Promise<User | null> {
    return this.usersRepository.findOneBy({ userName });
  }

  findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  async remove(id: number): Promise<void> {
    await this.usersRepository.delete(id);
  }

  async create(createUserDto: CreateUserDto) {
    const user = this.usersRepository.create(createUserDto);
    return this.usersRepository.save(user);
  }

  async update(userName: string, updateUserDto: UpdateUserDto): Promise<User> {
    await this.usersRepository.update(userName, updateUserDto);
    return this.usersRepository.findOne({ where: {userName }});
  }
}
