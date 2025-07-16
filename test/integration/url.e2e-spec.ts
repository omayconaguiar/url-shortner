import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';

describe('URL (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let authToken: string;
  let userId: string;
  let createdUrlId: string;

  const testUser = {
    email: 'urltest@example.com',
    password: 'password123',
    name: 'URL Test User',
  };

  const testUrl = {
    originalUrl: 'https://example.com/very-long-url',
    customSlug: 'test123',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prismaService = moduleFixture.get<PrismaService>(PrismaService);

    await app.init();

    // Clean up test data
    await prismaService.url.deleteMany({
      where: { slug: { startsWith: 'test' } },
    });
    await prismaService.user.deleteMany({
      where: { email: testUser.email },
    });

    // Create test user and get auth token
    const registerResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send(testUser);

    authToken = registerResponse.body.access_token;
    userId = registerResponse.body.user.id;
  });

  afterAll(async () => {
    // Clean up test data
    await prismaService.url.deleteMany({
      where: { slug: { startsWith: 'test' } },
    });
    await prismaService.user.deleteMany({
      where: { email: testUser.email },
    });

    await app.close();
  });

  describe('/urls (POST)', () => {
    it('should create URL with custom slug when authenticated', async () => {
      const response = await request(app.getHttpServer())
        .post('/urls')
        .set('Authorization', `Bearer ${authToken}`)
        .send(testUrl)
        .expect(201);

      expect(response.body).toEqual({
        id: expect.any(String),
        originalUrl: testUrl.originalUrl,
        slug: testUrl.customSlug,
        userId: userId,
        isActive: true,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        expiresAt: null,
        user: {
          id: userId,
          name: testUser.name,
          email: testUser.email,
        },
        _count: {
          visits: 0,
        },
      });

      createdUrlId = response.body.id;
    });

    it('should create URL with auto-generated slug when not authenticated', async () => {
      const urlWithoutSlug = {
        originalUrl: 'https://example.com/another-long-url',
      };

      const response = await request(app.getHttpServer())
        .post('/urls')
        .send(urlWithoutSlug)
        .expect(201);

      expect(response.body).toEqual({
        id: expect.any(String),
        originalUrl: urlWithoutSlug.originalUrl,
        slug: expect.any(String),
        userId: null,
        isActive: true,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        expiresAt: null,
        user: false,
        _count: {
          visits: 0,
        },
      });

      expect(response.body.slug).toMatch(/^[a-zA-Z0-9]{6}$/);
    });

    it('should return 409 when custom slug already exists', async () => {
      await request(app.getHttpServer())
        .post('/urls')
        .set('Authorization', `Bearer ${authToken}`)
        .send(testUrl)
        .expect(409);
    });

    it('should return 400 for invalid URL', async () => {
      await request(app.getHttpServer())
        .post('/urls')
        .send({
          originalUrl: 'invalid-url',
          customSlug: 'test456',
        })
        .expect(400);
    });

    it('should return 400 for invalid custom slug', async () => {
      await request(app.getHttpServer())
        .post('/urls')
        .send({
          originalUrl: 'https://example.com/test',
          customSlug: 'ab', // too short
        })
        .expect(400);
    });

    it('should return 400 for already shortened URL', async () => {
      await request(app.getHttpServer())
        .post('/urls')
        .send({
          originalUrl: 'http://localhost:3000/abc123',
          customSlug: 'test789',
        })
        .expect(400);
    });
  });

  describe('/urls (GET)', () => {
    it('should return user URLs when authenticated', async () => {
      const response = await request(app.getHttpServer())
        .get('/urls')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toEqual({
        id: expect.any(String),
        originalUrl: expect.any(String),
        slug: expect.any(String),
        userId: userId,
        isActive: true,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        expiresAt: null,
        user: {
          id: userId,
          name: testUser.name,
          email: testUser.email,
        },
        _count: {
          visits: expect.any(Number),
        },
      });
    });

    it('should return 401 when not authenticated', async () => {
      await request(app.getHttpServer())
        .get('/urls')
        .expect(401);
    });
  });

  describe('/urls/all (GET)', () => {
    it('should return all public URLs', async () => {
      const response = await request(app.getHttpServer())
        .get('/urls/all')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });
  });

  describe('/urls/dashboard (GET)', () => {
    it('should return dashboard stats when authenticated', async () => {
      const response = await request(app.getHttpServer())
        .get('/urls/dashboard')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toEqual({
        totalUrls: expect.any(Number),
        totalVisits: expect.any(Number),
        topUrls: expect.any(Array),
      });

      expect(response.body.totalUrls).toBeGreaterThanOrEqual(0);
      expect(response.body.totalVisits).toBeGreaterThanOrEqual(0);
      expect(response.body.topUrls.length).toBeLessThanOrEqual(5);
    });

    it('should return 401 when not authenticated', async () => {
      await request(app.getHttpServer())
        .get('/urls/dashboard')
        .expect(401);
    });
  });

  describe('/urls/:id/stats (GET)', () => {
    it('should return URL stats for owned URL', async () => {
      const response = await request(app.getHttpServer())
        .get(`/urls/${testUrl.customSlug}/stats`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toEqual({
        slug: testUrl.customSlug,
        originalUrl: testUrl.originalUrl,
        totalVisits: expect.any(Number),
        createdAt: expect.any(String),
        lastVisit: null,
      });
    });

    it('should return URL stats for public URL without authentication', async () => {
      const response = await request(app.getHttpServer())
        .get(`/urls/${testUrl.customSlug}/stats`)
        .expect(200);

      expect(response.body).toEqual({
        slug: testUrl.customSlug,
        originalUrl: testUrl.originalUrl,
        totalVisits: expect.any(Number),
        createdAt: expect.any(String),
        lastVisit: null,
      });
    });

    it('should return 404 for non-existent URL', async () => {
      await request(app.getHttpServer())
        .get('/urls/nonexistent/stats')
        .expect(404);
    });
  });

  describe('/:slug (GET) - Redirect', () => {
    it('should redirect to original URL and track visit', async () => {
      const response = await request(app.getHttpServer())
        .get(`/${testUrl.customSlug}`)
        .expect(302);

      expect(response.headers.location).toBe(testUrl.originalUrl);

      // Verify visit was tracked
      const statsResponse = await request(app.getHttpServer())
        .get(`/urls/${testUrl.customSlug}/stats`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(statsResponse.body.totalVisits).toBeGreaterThan(0);
    });

    it('should track visit metadata', async () => {
      await request(app.getHttpServer())
        .get(`/${testUrl.customSlug}`)
        .set('User-Agent', 'Test Browser')
        .set('Referer', 'https://google.com')
        .expect(302);

      // Check that visit was recorded in database
      const url = await prismaService.url.findUnique({
        where: { slug: testUrl.customSlug },
        include: { visits: true },
      });

      expect(url?.visits.length).toBeGreaterThan(0);
      expect(url?.visits[0]).toEqual(
        expect.objectContaining({
          userAgent: expect.stringContaining('Test Browser'),
          referer: 'https://google.com',
        }),
      );
    });

    it('should return 404 for non-existent slug', async () => {
      await request(app.getHttpServer())
        .get('/nonexistent')
        .expect(404);
    });

    it('should return 404 for inactive URL', async () => {
      // Create and deactivate a URL
      const inactiveUrl = await prismaService.url.create({
        data: {
          originalUrl: 'https://example.com/inactive',
          slug: 'inactive123',
          userId: userId,
          isActive: false,
        },
      });

      await request(app.getHttpServer())
        .get(`/${inactiveUrl.slug}`)
        .expect(404);

      // Cleanup
      await prismaService.url.delete({ where: { id: inactiveUrl.id } });
    });
  });

  describe('/urls/:id (PATCH)', () => {
    it('should update URL when user is owner', async () => {
      const updateData = {
        originalUrl: 'https://example.com/updated-url',
        isActive: true,
      };

      const response = await request(app.getHttpServer())
        .patch(`/urls/${createdUrlId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.originalUrl).toBe(updateData.originalUrl);
      expect(response.body.isActive).toBe(updateData.isActive);
    });

    it('should update custom slug', async () => {
      const updateData = {
        customSlug: 'updated123',
      };

      const response = await request(app.getHttpServer())
        .patch(`/urls/${createdUrlId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.slug).toBe(updateData.customSlug);
    });

    it('should return 409 when updating to existing slug', async () => {
      // Create another URL first
      const anotherUrl = await request(app.getHttpServer())
        .post('/urls')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          originalUrl: 'https://example.com/another',
          customSlug: 'another123',
        });

      // Try to update first URL to use the same slug
      await request(app.getHttpServer())
        .patch(`/urls/${createdUrlId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ customSlug: 'another123' })
        .expect(409);
    });

    it('should return 404 for non-existent URL', async () => {
      await request(app.getHttpServer())
        .patch('/urls/nonexistent')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ isActive: false })
        .expect(404);
    });

    it('should return 401 when not authenticated', async () => {
      await request(app.getHttpServer())
        .patch(`/urls/${createdUrlId}`)
        .send({ isActive: false })
        .expect(401);
    });

    it('should return 403 when user is not owner', async () => {
      // Create another user
      const anotherUser = {
        email: 'another@example.com',
        password: 'password123',
        name: 'Another User',
      };

      const anotherUserResponse = await request(app.getHttpServer())
        .post('/auth/register')
        .send(anotherUser);

      const anotherToken = anotherUserResponse.body.access_token;

      await request(app.getHttpServer())
        .patch(`/urls/${createdUrlId}`)
        .set('Authorization', `Bearer ${anotherToken}`)
        .send({ isActive: false })
        .expect(403);

      // Cleanup
      await prismaService.user.delete({
        where: { id: anotherUserResponse.body.user.id },
      });
    });
  });

  describe('/urls/:id (DELETE)', () => {
    let urlToDelete: string;

    beforeEach(async () => {
      // Create a URL to delete for each test
      const response = await request(app.getHttpServer())
        .post('/urls')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          originalUrl: 'https://example.com/to-delete',
          customSlug: `delete${Date.now()}`,
        });

      urlToDelete = response.body.id;
    });

    it('should return 401 when not authenticated', async () => {
      await request(app.getHttpServer())
        .delete(`/urls/${urlToDelete}`)
        .expect(401);
    });

    it('should return 404 for non-existent URL', async () => {
      await request(app.getHttpServer())
        .delete('/urls/nonexistent')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should return 403 when user is not owner', async () => {
      // Create another user
      const anotherUser = {
        email: `another${Date.now()}@example.com`,
        password: 'password123',
        name: 'Another User',
      };

      const anotherUserResponse = await request(app.getHttpServer())
        .post('/auth/register')
        .send(anotherUser);

      const anotherToken = anotherUserResponse.body.access_token;

      await request(app.getHttpServer())
        .delete(`/urls/${urlToDelete}`)
        .set('Authorization', `Bearer ${anotherToken}`)
        .expect(403);

      // Cleanup
      await prismaService.user.delete({
        where: { id: anotherUserResponse.body.user.id },
      });
    });

    it('should delete URL when user is owner', async () => {
        const url = await prismaService.url.findUnique({
          where: { id: urlToDelete },
        });
        expect(url).toBeTruthy(); 
      
        const urlSlug = url!.slug;
      
        await request(app.getHttpServer())
          .delete(`/urls/${urlToDelete}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(204);
      
        
        await request(app.getHttpServer())
          .get(`/${urlSlug}`)
          .expect(404);
      });
      
      it('should delete URL and cascade delete visits', async () => {
        const url = await prismaService.url.findUnique({
          where: { id: urlToDelete },
        });
        expect(url).toBeTruthy();
      
        const urlSlug = url!.slug;
      
        
        await request(app.getHttpServer())
          .get(`/${urlSlug}`)
          .expect(302); 
      
        
        const visitsBeforeDelete = await prismaService.visit.count({
          where: { urlId: urlToDelete },
        });
        expect(visitsBeforeDelete).toBeGreaterThan(0);
      
        
        await request(app.getHttpServer())
          .delete(`/urls/${urlToDelete}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(204);
      
        
        const visitsAfterDelete = await prismaService.visit.count({
          where: { urlId: urlToDelete },
        });
        expect(visitsAfterDelete).toBe(0);
      });
      
  });

  describe('Edge Cases', () => {
    it('should handle multiple concurrent redirects', async () => {
      const promises = Array.from({ length: 10 }, () =>
        request(app.getHttpServer())
          .get(`/${testUrl.customSlug}`)
          .expect(302),
      );

      const responses = await Promise.all(promises);

      responses.forEach((response) => {
        expect(response.headers.location).toBe(testUrl.originalUrl);
      });

      // Verify all visits were tracked
      const statsResponse = await request(app.getHttpServer())
        .get(`/urls/${testUrl.customSlug}/stats`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(statsResponse.body.totalVisits).toBeGreaterThanOrEqual(10);
    });

    it('should handle very long URLs', async () => {
      const veryLongUrl = 'https://example.com/' + 'a'.repeat(2000);

      const response = await request(app.getHttpServer())
        .post('/urls')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          originalUrl: veryLongUrl,
          customSlug: 'longurl123',
        })
        .expect(201);

      expect(response.body.originalUrl).toBe(veryLongUrl);

      // Test redirect still works
      await request(app.getHttpServer())
        .get(`/${response.body.slug}`)
        .expect(302);
    });

    it('should handle URLs with special characters', async () => {
      const urlWithSpecialChars = 'https://example.com/path?q=test&lang=pt-BR&special=@#$%';

      const response = await request(app.getHttpServer())
        .post('/urls')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          originalUrl: urlWithSpecialChars,
          customSlug: 'special123',
        })
        .expect(201);

      // Test redirect works with special characters
      const redirectResponse = await request(app.getHttpServer())
        .get(`/${response.body.slug}`)
        .expect(302);

      expect(redirectResponse.headers.location).toBe(urlWithSpecialChars);
    });
  });
});