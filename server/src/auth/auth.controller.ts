import { Controller, Get, Post, Body, Request, UnauthorizedException, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from './public.decorator'; // Assuming you have created a Public decorator
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { LocalAuthGuard } from './local-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    const validUser = await this.authService.validateUser(loginDto.userName, loginDto.password);
    if (validUser === null) {
      throw new UnauthorizedException('Invalid Credentials');
    }
    else {
      return this.authService.login(validUser);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }

}
