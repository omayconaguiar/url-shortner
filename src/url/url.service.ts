import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import {PrismaService} from '../prisma/prisma.service';
import {CreateUrlDto} from './dto/create-url.dto';
import {UpdateUrlDto} from './dto/update-url.dto';

@Injectable()
export class UrlService {
  constructor(private readonly prisma: PrismaService) {}

  private generateSlug(): string {
    const chars =
      'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  async create(createUrlDto: CreateUrlDto, userId?: string) {
    const {originalUrl, customSlug} = createUrlDto;

    if (originalUrl.includes(process.env.APP_DOMAIN || 'localhost')) {
      throw new BadRequestException('Cannot shorten an already shortened URL');
    }

    let slug = customSlug;

    if (!slug) {
      let attempts = 0;
      do {
        slug = this.generateSlug();
        attempts++;
        const existing = await this.prisma.url.findUnique({
          where: {slug},
        });
        if (!existing) break;

        if (attempts > 10) {
          throw new BadRequestException('Unable to generate unique slug');
        }
      } while (true);
    } else {
      const existing = await this.prisma.url.findUnique({
        where: {slug},
      });
      if (existing) {
        throw new ConflictException('This slug is already taken');
      }
    }

    return this.prisma.url.create({
      data: {
        originalUrl,
        slug,
        userId: userId,
      },
      include: {
        user: userId
          ? {
              select: {
                id: true,
                name: true,
                email: true,
              },
            }
          : false,
        _count: {
          select: {
            visits: true,
          },
        },
      },
    });
  }

  async findAll(userId?: string) {
    const where = userId ? {userId} : {};

    return this.prisma.url.findMany({
      where,
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
  }

  async findBySlug(slug: string) {
    const url = await this.prisma.url.findUnique({
      where: {slug},
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

    if (!url) {
      throw new NotFoundException('URL not found');
    }

    if (!url.isActive) {
      throw new NotFoundException('URL is no longer active');
    }

    return url;
  }

  async redirect(
    slug: string,
    visitData: {ipAddress?: string; userAgent?: string; referer?: string},
  ) {
    const url = await this.findBySlug(slug);

    await this.prisma.visit.create({
      data: {
        urlId: url.id,
        ipAddress: visitData.ipAddress,
        userAgent: visitData.userAgent,
        referer: visitData.referer,
      },
    });

    return url.originalUrl;
  }

  async update(id: string, updateUrlDto: UpdateUrlDto, userId?: string) {
    const url = await this.prisma.url.findUnique({
      where: {id},
    });

    if (!url) {
      throw new NotFoundException('URL not found');
    }

    if (userId && url.userId !== userId) {
      throw new ForbiddenException('You can only update your own URLs');
    }

    if (!userId && url.userId) {
      throw new ForbiddenException('This URL belongs to a registered user');
    }

    if (updateUrlDto.customSlug && updateUrlDto.customSlug !== url.slug) {
      const existing = await this.prisma.url.findUnique({
        where: {slug: updateUrlDto.customSlug},
      });
      if (existing) {
        throw new ConflictException('This slug is already taken');
      }
    }

    return this.prisma.url.update({
      where: {id},
      data: {
        originalUrl: updateUrlDto.originalUrl,
        slug: updateUrlDto.customSlug,
        isActive: updateUrlDto.isActive,
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
  }

  async remove(id: string, userId?: string) {
    const url = await this.prisma.url.findUnique({
      where: {id},
    });

    if (!url) {
      throw new NotFoundException('URL not found');
    }

    if (userId && url.userId !== userId) {
      throw new ForbiddenException('You can only delete your own URLs');
    }

    if (!userId && url.userId) {
      throw new ForbiddenException('This URL belongs to a registered user');
    }

    await this.prisma.url.delete({
      where: {id},
    });

    return {
      message: 'URL deleted successfully',
    };
  }

  async getStats(slug: string, userId?: string) {
    const url = await this.prisma.url.findUnique({
      where: {slug},
      include: {
        visits: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
        },
        _count: {
          select: {
            visits: true,
          },
        },
      },
    });

    if (!url) {
      throw new NotFoundException('URL not found');
    }

    if (userId && url.userId !== userId) {
      throw new ForbiddenException('You can only view stats for your own URLs');
    }

    return {
      slug: url.slug,
      originalUrl: url.originalUrl,
      totalVisits: url._count.visits,
      createdAt: url.createdAt,
      lastVisit: url.visits[0]?.createdAt || null,
    };
  }

  async getDashboardStats(userId: string) {
    const urls = await this.prisma.url.findMany({
      where: {userId},
      include: {
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

    const totalUrls = urls.length;
    const totalVisits = urls.reduce((sum, url) => sum + url._count.visits, 0);
    const topUrls = urls
      .sort((a, b) => b._count.visits - a._count.visits)
      .slice(0, 5)
      .map((url) => ({
        slug: url.slug,
        originalUrl: url.originalUrl,
        visits: url._count.visits,
        createdAt: url.createdAt,
      }));

    return {
      totalUrls,
      totalVisits,
      topUrls,
    };
  }
}
