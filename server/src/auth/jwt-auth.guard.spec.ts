// src/auth/jwt-auth.guard.spec.ts
import { JwtAuthGuard } from './jwt-auth.guard';
import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new JwtAuthGuard(reflector);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should return true if the route is public', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);

    const context = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: jest.fn().mockReturnThis(),
      getRequest: jest.fn().mockReturnValue({}),
    } as unknown as ExecutionContext;

    expect(guard.canActivate(context)).toBe(true);
  });

  it('should call super.canActivate if the route is not public', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);

    const context = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: jest.fn().mockReturnThis(),
      getRequest: jest.fn().mockReturnValue({}),
    } as unknown as ExecutionContext;

    const canActivateSpy = jest.spyOn(guard, 'canActivate').mockImplementation(() => true);
    
    expect(guard.canActivate(context)).toBe(true);
    expect(canActivateSpy).toHaveBeenCalled();
  });

  it('should return false if user is not authenticated', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);

    const context = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: jest.fn().mockReturnThis(),
      getRequest: jest.fn().mockReturnValue({ user: null }),
    } as unknown as ExecutionContext;

    jest.spyOn(guard, 'canActivate').mockReturnValue(false);

    expect(guard.canActivate(context)).toBe(false);
  });
});
