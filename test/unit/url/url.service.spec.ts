import { Test, TestingModule } from '@nestjs/testing';
import { UrlService } from '../../../src/url/url.service';
import { PrismaService } from '../../../src/prisma/prisma.service';
import {
  NotFoundException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';

describe('UrlService', () => {
  let service: UrlService;
  let prismaService: PrismaService;

  const mockUrl = {
    id: 'url-1',
    originalUrl: 'https://example.com',
    slug: 'abc123',
    userId: 'user-1',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    expiresAt: null,
    user: {
      id: 'user-1',
      name: 'Test User',
      email: 'test@example.com',
    },
    _count: {
      visits: 5,
    },
  };

  const mockPrismaService = {
    url: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    visit: {
      create: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UrlService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<UrlService>(UrlService);
    prismaService = module.get<PrismaService>(PrismaService);

    // Mock environment variable
    process.env.APP_DOMAIN = 'localhost:3000';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createUrlDto = {
      originalUrl: 'https://example.com/long-url',
      customSlug: 'custom123',
    };

    it('should create URL with custom slug', async () => {
      mockPrismaService.url.findUnique.mockResolvedValue(null);
      mockPrismaService.url.create.mockResolvedValue(mockUrl);

      const result = await service.create(createUrlDto, 'user-1');

      expect(mockPrismaService.url.findUnique).toHaveBeenCalledWith({
        where: { slug: createUrlDto.customSlug },
      });
      expect(mockPrismaService.url.create).toHaveBeenCalledWith({
        data: {
          originalUrl: createUrlDto.originalUrl,
          slug: createUrlDto.customSlug,
          userId: 'user-1',
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          _count: {
            select: {
              visits: true,
            },
          },
        },
      });
      expect(result).toEqual(mockUrl);
    });

    it('should create URL with auto-generated slug', async () => {
      const createUrlDtoNoSlug = {
        originalUrl: 'https://example.com/long-url',
      };

      // Mock that slug check returns null (slug available)
      mockPrismaService.url.findUnique.mockResolvedValue(null);
      
      // Mock the created URL with a generated slug
      const mockCreatedUrl = {
        ...mockUrl,
        slug: 'abc123', // Use a proper string slug
      };
      mockPrismaService.url.create.mockResolvedValue(mockCreatedUrl);

      const result = await service.create(createUrlDtoNoSlug, 'user-1');

      expect(mockPrismaService.url.create).toHaveBeenCalledWith({
        data: {
          originalUrl: createUrlDtoNoSlug.originalUrl,
          slug: expect.any(String),
          userId: 'user-1',
        },
        include: expect.any(Object),
      });
      expect(result.slug).toBeDefined();
      expect(typeof result.slug).toBe('string');
      expect(result.slug.length).toBeGreaterThan(0);
    });

    it('should throw ConflictException if slug already exists', async () => {
      mockPrismaService.url.findUnique.mockResolvedValue(mockUrl);

      await expect(
        service.create(createUrlDto, 'user-1'),
      ).rejects.toThrow(ConflictException);
      expect(mockPrismaService.url.create).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException for already shortened URL', async () => {
      const createUrlDtoShort = {
        originalUrl: 'http://localhost:3000/abc123',
      };

      await expect(
        service.create(createUrlDtoShort, 'user-1'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should return all URLs when no userId provided', async () => {
      const mockUrls = [mockUrl];
      mockPrismaService.url.findMany.mockResolvedValue(mockUrls);

      const result = await service.findAll();

      expect(mockPrismaService.url.findMany).toHaveBeenCalledWith({
        where: {},
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          _count: {
            select: {
              visits: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
      expect(result).toEqual(mockUrls);
    });

    it('should return user-specific URLs when userId provided', async () => {
      const mockUrls = [mockUrl];
      mockPrismaService.url.findMany.mockResolvedValue(mockUrls);

      const result = await service.findAll('user-1');

      expect(mockPrismaService.url.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        include: expect.any(Object),
        orderBy: {
          createdAt: 'desc',
        },
      });
      expect(result).toEqual(mockUrls);
    });
  });

  describe('findBySlug', () => {
    it('should return URL when found and active', async () => {
      mockPrismaService.url.findUnique.mockResolvedValue(mockUrl);

      const result = await service.findBySlug('abc123');

      expect(mockPrismaService.url.findUnique).toHaveBeenCalledWith({
        where: { slug: 'abc123' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });
      expect(result).toEqual(mockUrl);
    });

    it('should throw NotFoundException when URL not found', async () => {
      mockPrismaService.url.findUnique.mockResolvedValue(null);

      await expect(service.findBySlug('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException when URL is inactive', async () => {
      mockPrismaService.url.findUnique.mockResolvedValue({
        ...mockUrl,
        isActive: false,
      });

      await expect(service.findBySlug('abc123')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('redirect', () => {
    const visitData = {
      ipAddress: '192.168.1.1',
      userAgent: 'Mozilla/5.0...',
      referer: 'https://google.com',
    };

    it('should create visit record and return original URL', async () => {
      mockPrismaService.url.findUnique.mockResolvedValue(mockUrl);
      mockPrismaService.visit.create.mockResolvedValue({});

      const result = await service.redirect('abc123', visitData);

      expect(mockPrismaService.visit.create).toHaveBeenCalledWith({
        data: {
          urlId: mockUrl.id,
          ipAddress: visitData.ipAddress,
          userAgent: visitData.userAgent,
          referer: visitData.referer,
        },
      });
      expect(result).toBe(mockUrl.originalUrl);
    });
  });

  describe('update', () => {
    const updateUrlDto = {
      originalUrl: 'https://example.com/updated',
      customSlug: 'updated123',
      isActive: true,
    };

    it('should update URL successfully', async () => {
      mockPrismaService.url.findUnique
        .mockResolvedValueOnce(mockUrl) // First call for finding URL
        .mockResolvedValueOnce(null); // Second call for checking slug availability
      mockPrismaService.url.update.mockResolvedValue({
        ...mockUrl,
        ...updateUrlDto,
      });

      const result = await service.update('url-1', updateUrlDto, 'user-1');

      expect(mockPrismaService.url.update).toHaveBeenCalledWith({
        where: { id: 'url-1' },
        data: {
          originalUrl: updateUrlDto.originalUrl,
          slug: updateUrlDto.customSlug,
          isActive: updateUrlDto.isActive,
        },
        include: expect.any(Object),
      });
      expect(result).toEqual({ ...mockUrl, ...updateUrlDto });
    });

    it('should throw NotFoundException when URL not found', async () => {
      mockPrismaService.url.findUnique.mockResolvedValue(null);

      await expect(
        service.update('nonexistent', updateUrlDto, 'user-1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when user is not owner', async () => {
      mockPrismaService.url.findUnique.mockResolvedValue(mockUrl);

      await expect(
        service.update('url-1', updateUrlDto, 'other-user'),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('remove', () => {
    it('should delete URL successfully', async () => {
      mockPrismaService.url.findUnique.mockResolvedValue(mockUrl);
      mockPrismaService.url.delete.mockResolvedValue(mockUrl);

      const result = await service.remove('url-1', 'user-1');

      expect(mockPrismaService.url.delete).toHaveBeenCalledWith({
        where: { id: 'url-1' },
      });
      expect(result).toEqual({
        message: 'URL deleted successfully',
      });
    });

    it('should throw NotFoundException when URL not found', async () => {
      mockPrismaService.url.findUnique.mockResolvedValue(null);

      await expect(service.remove('nonexistent', 'user-1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException when user is not owner', async () => {
      mockPrismaService.url.findUnique.mockResolvedValue(mockUrl);

      await expect(service.remove('url-1', 'other-user')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('getStats', () => {
    const mockStats = {
      slug: 'abc123',
      originalUrl: 'https://example.com',
      totalVisits: 5,
      createdAt: new Date(),
      lastVisit: new Date(),
    };

    it('should return URL statistics', async () => {
      const mockUrlWithVisits = {
        ...mockUrl,
        visits: [{ createdAt: new Date() }],
        _count: { visits: 5 },
      };

      mockPrismaService.url.findUnique.mockResolvedValue(mockUrlWithVisits);

      const result = await service.getStats('abc123', 'user-1');

      expect(result).toEqual({
        slug: mockUrl.slug,
        originalUrl: mockUrl.originalUrl,
        totalVisits: 5,
        createdAt: mockUrl.createdAt,
        lastVisit: mockUrlWithVisits.visits[0].createdAt,
      });
    });

    it('should throw NotFoundException when URL not found', async () => {
      mockPrismaService.url.findUnique.mockResolvedValue(null);

      await expect(service.getStats('nonexistent', 'user-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getDashboardStats', () => {
    it('should return dashboard statistics', async () => {
      const mockUrls = [
        { ...mockUrl, _count: { visits: 10 } },
        { ...mockUrl, id: 'url-2', _count: { visits: 5 } },
      ];

      mockPrismaService.url.findMany.mockResolvedValue(mockUrls);

      const result = await service.getDashboardStats('user-1');

      expect(result).toEqual({
        totalUrls: 2,
        totalVisits: 15,
        topUrls: [
          {
            slug: mockUrl.slug,
            originalUrl: mockUrl.originalUrl,
            visits: 10,
            createdAt: mockUrl.createdAt,
          },
          {
            slug: mockUrl.slug,
            originalUrl: mockUrl.originalUrl,
            visits: 5,
            createdAt: mockUrl.createdAt,
          },
        ],
      });
    });
  });
});