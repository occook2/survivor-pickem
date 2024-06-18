import { IsString, IsEmail } from 'class-validator';

export class CreateUserDto {
  @IsString()
  username: string;

  @IsString()
  password: string;

  // Add other validation rules as necessary
}
