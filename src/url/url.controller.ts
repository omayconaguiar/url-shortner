import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  Res,
  HttpStatus,
  HttpCode,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { Request, Response } from 'express';
import { UrlService } from './url.service';
import { CreateUrlDto } from './dto/create-url.dto';
import { UpdateUrlDto } from './dto/update-url.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('URLs')
@Controller()
export class UrlController {
  constructor(private readonly urlService: UrlService) {}

  @Post('urls')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Create a new shortened URL' })
  @ApiBody({ description: 'URL data to create', type: CreateUrlDto })
  @ApiResponse({
    status: 201,
    description: 'URL created successfully',
    schema: {
      example: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        originalUrl: 'https://example.com/very/long/url',
        slug: 'abc123',
        userId: 'user-id-here',
        createdAt: '2024-01-15T10:30:00Z',
        updatedAt: '2024-01-15T10:30:00Z',
        isActive: true,
        _count: { visits: 0 },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad request - invalid URL or slug already taken' })
  create(@Body() createUrlDto: CreateUrlDto, @Req() req) {
    const userId = req.user?.id;
    return this.urlService.create(createUrlDto, userId);
  }
  

  @Get('urls')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all URLs for authenticated user' })
  @ApiResponse({
    status: 200,
    description: 'Returns array of URLs',
  })
  findAll(@Req() req) {
    return this.urlService.findAll(req.user.id);
  }

  @Get('urls/dashboard')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get dashboard statistics for authenticated user' })
  @ApiResponse({
    status: 200,
    description: 'Returns dashboard statistics',
    schema: {
      example: {
        totalUrls: 15,
        totalVisits: 342,
        topUrls: [
          {
            slug: 'abc123',
            originalUrl: 'https://example.com',
            visits: 45,
            createdAt: '2024-01-15T10:30:00Z',
          },
        ],
      },
    },
  })
  getDashboard(@Req() req) {
    return this.urlService.getDashboardStats(req.user.id);
  }

  @Get('urls/all')
  @ApiOperation({ summary: 'Get all URLs (public endpoint)' })
  @ApiResponse({
    status: 200,
    description: 'Returns array of all URLs',
  })
  findAllPublic() {
    return this.urlService.findAll();
  }

  @Get('urls/:id/stats')
  @ApiOperation({ summary: 'Get statistics for a specific URL' })
  @ApiParam({
    name: 'id',
    description: 'URL slug',
    example: 'abc123',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns URL statistics',
    schema: {
      example: {
        slug: 'abc123',
        originalUrl: 'https://example.com',
        totalVisits: 42,
        createdAt: '2024-01-15T10:30:00Z',
        lastVisit: '2024-01-16T14:22:00Z',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'URL not found',
  })
  getStats(@Param('id') slug: string, @Req() req) {
    const userId = req.user?.id;
    return this.urlService.getStats(slug, userId);
  }

  @Patch('urls/:id')
  @ApiOperation({ summary: 'Update a URL' })
  @ApiParam({
    name: 'id',
    description: 'URL ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({
    description: 'Fields to update',
    type: UpdateUrlDto,
  })
  @ApiResponse({
    status: 200,
    description: 'URL updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'URL not found',
  })
  @ApiResponse({
    status: 403,
    description: 'You can only update your own URLs',
  })
  update(@Param('id') id: string, @Body() updateUrlDto: UpdateUrlDto, @Req() req) {
    const userId = req.user?.id;
    return this.urlService.update(id, updateUrlDto, userId);
  }

  @Delete('urls/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a URL' })
  @ApiParam({
    name: 'id',
    description: 'URL ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 204,
    description: 'URL deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'URL not found',
  })
  @ApiResponse({
    status: 403,
    description: 'You can only delete your own URLs',
  })
  remove(@Param('id') id: string, @Req() req) {
    const userId = req.user?.id;
    return this.urlService.remove(id, userId);
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Redirect to original URL' })
  @ApiParam({
    name: 'slug',
    description: 'URL slug',
    example: 'abc123',
  })
  @ApiResponse({
    status: 302,
    description: 'Redirects to original URL',
  })
  @ApiResponse({
    status: 404,
    description: 'URL not found or inactive',
  })
  async redirect(@Param('slug') slug: string, @Req() req, @Res() res: Response) {
    const visitData = {
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      referer: req.get('Referer'),
    };

    try {
      const originalUrl = await this.urlService.redirect(slug, visitData);
      return res.redirect(302, originalUrl);
    } catch (error) {
      return res.status(404).json({
        statusCode: 404,
        message: 'URL not found',
        error: 'Not Found',
      });
    }
  }
}