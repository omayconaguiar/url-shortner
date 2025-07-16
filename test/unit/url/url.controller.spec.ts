import {Test, TestingModule} from '@nestjs/testing';
import {UrlController} from '../../../src/url/url.controller';
import {UrlService} from '../../../src/url/url.service';
import {Response} from 'express';

describe('UrlController', () => {
  let controller: UrlController;
  let urlService: UrlService;

  const mockUrlService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findBySlug: jest.fn(),
    redirect: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    getStats: jest.fn(),
    getDashboardStats: jest.fn(),
  };

  const mockUrl = {
    id: 'url-1',
    originalUrl: 'https://example.com',
    slug: 'abc123',
    userId: 'user-1',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    user: {
      id: 'user-1',
      name: 'Test User',
      email: 'test@example.com',
    },
    _count: {
      visits: 5,
    },
  };

  const mockRequest = {
    user: {
      id: 'user-1',
      email: 'test@example.com',
      name: 'Test User',
      role: 'USER',
    },
    ip: '192.168.1.1',
    get: jest.fn().mockImplementation((header: string) => {
      if (header === 'User-Agent') return 'Mozilla/5.0...';
      if (header === 'Referer') return 'https://google.com';
      return undefined;
    }),
  };

  const mockResponse = {
    redirect: jest.fn(),
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  } as unknown as Response;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UrlController],
      providers: [
        {
          provide: UrlService,
          useValue: mockUrlService,
        },
      ],
    }).compile();

    controller = module.get<UrlController>(UrlController);
    urlService = module.get<UrlService>(UrlService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createUrlDto = {
      originalUrl: 'https://example.com',
      customSlug: 'custom123',
    };

    it('should create URL successfully', async () => {
      mockUrlService.create.mockResolvedValue(mockUrl);

      const result = await controller.create(createUrlDto, mockRequest as any);

      expect(mockUrlService.create).toHaveBeenCalledWith(
        createUrlDto,
        mockRequest.user.id,
      );
      expect(result).toEqual(mockUrl);
    });

    it('should create URL without user when not authenticated', async () => {
      const mockRequestNoUser = {user: undefined};
      mockUrlService.create.mockResolvedValue({...mockUrl, userId: null});

      const result = await controller.create(
        createUrlDto,
        mockRequestNoUser as any,
      );

      expect(mockUrlService.create).toHaveBeenCalledWith(
        createUrlDto,
        undefined,
      );
      expect(result.userId).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should return user URLs', async () => {
      const mockUrls = [mockUrl];
      mockUrlService.findAll.mockResolvedValue(mockUrls);

      const result = await controller.findAll(mockRequest as any);

      expect(mockUrlService.findAll).toHaveBeenCalledWith(mockRequest.user.id);
      expect(result).toEqual(mockUrls);
    });
  });

  describe('findAllPublic', () => {
    it('should return all public URLs', async () => {
      const mockUrls = [mockUrl];
      mockUrlService.findAll.mockResolvedValue(mockUrls);

      const result = await controller.findAllPublic();

      expect(mockUrlService.findAll).toHaveBeenCalledWith();
      expect(result).toEqual(mockUrls);
    });
  });

  describe('getDashboard', () => {
    it('should return dashboard stats', async () => {
      const mockStats = {
        totalUrls: 5,
        totalVisits: 25,
        topUrls: [mockUrl],
      };
      mockUrlService.getDashboardStats.mockResolvedValue(mockStats);

      const result = await controller.getDashboard(mockRequest as any);

      expect(mockUrlService.getDashboardStats).toHaveBeenCalledWith(
        mockRequest.user.id,
      );
      expect(result).toEqual(mockStats);
    });
  });

  describe('getStats', () => {
    it('should return URL statistics', async () => {
      const mockStats = {
        slug: 'abc123',
        originalUrl: 'https://example.com',
        totalVisits: 5,
        createdAt: new Date(),
        lastVisit: new Date(),
      };
      mockUrlService.getStats.mockResolvedValue(mockStats);

      const result = await controller.getStats('abc123', mockRequest as any);

      expect(mockUrlService.getStats).toHaveBeenCalledWith(
        'abc123',
        mockRequest.user.id,
      );
      expect(result).toEqual(mockStats);
    });
  });

  describe('update', () => {
    const updateUrlDto = {
      originalUrl: 'https://example.com/updated',
      isActive: true,
    };

    it('should update URL successfully', async () => {
      const updatedUrl = {...mockUrl, ...updateUrlDto};
      mockUrlService.update.mockResolvedValue(updatedUrl);

      const result = await controller.update(
        'url-1',
        updateUrlDto,
        mockRequest as any,
      );

      expect(mockUrlService.update).toHaveBeenCalledWith(
        'url-1',
        updateUrlDto,
        mockRequest.user.id,
      );
      expect(result).toEqual(updatedUrl);
    });
  });

  describe('remove', () => {
    it('should delete URL successfully', async () => {
      const deleteResponse = {message: 'URL deleted successfully'};
      mockUrlService.remove.mockResolvedValue(deleteResponse);

      const result = await controller.remove('url-1', mockRequest as any);

      expect(mockUrlService.remove).toHaveBeenCalledWith(
        'url-1',
        mockRequest.user.id,
      );
      expect(result).toEqual(deleteResponse);
    });
  });

  describe('redirect', () => {
    it('should redirect to original URL', async () => {
      mockUrlService.redirect.mockResolvedValue('https://example.com');

      await controller.redirect('abc123', mockRequest as any, mockResponse);

      expect(mockUrlService.redirect).toHaveBeenCalledWith('abc123', {
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0...',
        referer: 'https://google.com',
      });
      expect(mockResponse.redirect).toHaveBeenCalledWith(
        302,
        'https://example.com',
      );
    });

    it('should return 404 when URL not found', async () => {
      mockUrlService.redirect.mockRejectedValue(new Error('URL not found'));

      await controller.redirect(
        'nonexistent',
        mockRequest as any,
        mockResponse,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: 404,
        message: 'URL not found',
        error: 'Not Found',
      });
    });
  });
});
