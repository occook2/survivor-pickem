import { LocalStrategy } from './local.strategy';
import { AuthService } from './auth.service';

describe('LocalStrategy', () => {
  let strategy: LocalStrategy;
  let authService: AuthService;

  beforeEach(() => {
    authService = { validateUser: jest.fn() } as any;
    strategy = new LocalStrategy(authService);
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  it('should validate a user', async () => {
    const user = { username: 'test', password: 'test' };
    jest.spyOn(authService, 'validateUser').mockResolvedValue(user);

    expect(await strategy.validate('test', 'test')).toEqual(user);
  });

  it('should throw an error if validation fails', async () => {
    jest.spyOn(authService, 'validateUser').mockResolvedValue(null);

    await expect(strategy.validate('test', 'test')).rejects.toThrow();
  });
});
