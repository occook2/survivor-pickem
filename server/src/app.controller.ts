import { Controller, Get, Request, Post, UseGuards, UnauthorizedException } from '@nestjs/common';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { LocalAuthGuard } from './auth/local-auth.guard';
import { AuthService } from './auth/auth.service';
import { Public } from './auth/public.decorator';

@Controller()
export class AppController {
  constructor(private authService: AuthService) {}

  @Public()
  @Get()
  async getHelloWorld() {
    return "Hello World!";
  }
}