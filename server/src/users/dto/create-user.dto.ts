import { IsString, IsEmail } from 'class-validator';

export class CreateUserDto {
  @IsString()
  userName: string;

  @IsString()
  password: string;

  // Add other validation rules as necessary
}
