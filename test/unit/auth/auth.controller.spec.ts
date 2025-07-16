import {Test, TestingModule} from '@nestjs/testing';
import {AuthController} from '../../../src/auth/auth.controller';
import {AuthService} from '../../../src/auth/auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
    getProfile: jest.fn(),
  };

  const mockUser = {
    id: 'user-1',
    email: 'test@example.com',
    name: 'Test User',
    role: 'USER',
    createdAt: new Date(),
  };

  const mockAuthResponse = {
    user: mockUser,
    access_token: 'mock-jwt-token',
  };

  const mockRequest = {
    user: {
      id: 'user-1',
      email: 'test@example.com',
      name: 'Test User',
      role: 'USER',
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    const registerDto = {
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
    };

    it('should register user successfully', async () => {
      mockAuthService.register.mockResolvedValue(mockAuthResponse);

      const result = await controller.register(registerDto);

      expect(mockAuthService.register).toHaveBeenCalledWith(registerDto);
      expect(result).toEqual(mockAuthResponse);
    });
  });

  describe('login', () => {
    const loginDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should login user successfully', async () => {
      mockAuthService.login.mockResolvedValue(mockAuthResponse);

      const result = await controller.login(loginDto);

      expect(mockAuthService.login).toHaveBeenCalledWith(loginDto);
      expect(result).toEqual(mockAuthResponse);
    });
  });

  describe('getProfile', () => {
    it('should return user profile', async () => {
      const userProfile = {
        ...mockUser,
        updatedAt: new Date(),
      };

      mockAuthService.getProfile.mockResolvedValue(userProfile);

      const result = await controller.getProfile(mockRequest as any);

      expect(mockAuthService.getProfile).toHaveBeenCalledWith(
        mockRequest.user.id,
      );
      expect(result).toEqual(userProfile);
    });
  });
});
