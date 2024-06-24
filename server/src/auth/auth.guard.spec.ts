// src/auth/auth.guard.spec.ts
import { AuthGuard } from './auth.guard';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { jwtConstants } from './constants';
import { Request } from 'express';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let jwtService: JwtService;

  beforeEach(() => {
    jwtService = new JwtService({ secret: jwtConstants.secret });
    guard = new AuthGuard(jwtService);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should return true if token is valid', async () => {
    const token = 'valid-token';
    const payload = { userId: 1 };

    jest.spyOn(jwtService, 'verifyAsync').mockResolvedValue(payload);

    const request = {
      headers: {
        authorization: `Bearer ${token}`,
      },
    } as unknown as Request;

    const context = {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as ExecutionContext;

    const result = await guard.canActivate(context);
    expect(result).toBe(true);
    expect(request['user']).toEqual(payload);
  });

  it('should throw UnauthorizedException if token is invalid', async () => {
    const token = 'invalid-token';

    jest.spyOn(jwtService, 'verifyAsync').mockRejectedValue(new Error('Invalid token'));

    const request = {
      headers: {
        authorization: `Bearer ${token}`,
      },
    } as unknown as Request;

    const context = {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as ExecutionContext;

    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException if no token is present', async () => {
    const request = {
      headers: {},
    } as unknown as Request;

    const context = {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as ExecutionContext;

    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
  });

  it('should extract token from header correctly', () => {
    const requestWithBearer = {
      headers: {
        authorization: 'Bearer token',
      },
    } as unknown as Request;

    const token = guard['extractTokenFromHeader'](requestWithBearer);
    expect(token).toBe('token');

    const requestWithoutBearer = {
      headers: {
        authorization: 'Basic token',
      },
    } as unknown as Request;

    const noToken = guard['extractTokenFromHeader'](requestWithoutBearer);
    expect(noToken).toBeUndefined();
  });
});
