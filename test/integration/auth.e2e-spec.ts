import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';

describe('Auth (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;

  const testUser = {
    email: 'test@example.com',
    password: 'password123',
    name: 'Test User',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prismaService = moduleFixture.get<PrismaService>(PrismaService);

    await app.init();

    // Clean up test data
    await prismaService.user.deleteMany({
      where: { email: testUser.email },
    });
  });

  afterAll(async () => {
    // Clean up test data
    await prismaService.user.deleteMany({
      where: { email: testUser.email },
    });

    await app.close();
  });

  describe('/auth/register (POST)', () => {
    it('should register a new user successfully', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(testUser)
        .expect(201);

      expect(response.body).toEqual({
        user: {
          id: expect.any(String),
          email: testUser.email,
          name: testUser.name,
          role: 'USER',
          createdAt: expect.any(String),
        },
        access_token: expect.any(String),
      });

      // Verify user was created in database
      const createdUser = await prismaService.user.findUnique({
        where: { email: testUser.email },
      });
      expect(createdUser).toBeTruthy();
      expect(createdUser.email).toBe(testUser.email);
      expect(createdUser.name).toBe(testUser.name);
    });

    it('should return 409 when email already exists', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send(testUser)
        .expect(409);
    });

    it('should return 400 for invalid input', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'invalid-email',
          password: '123', // too short
          name: '',
        })
        .expect(400);
    });
  });

  describe('/auth/login (POST)', () => {
    it('should login successfully with valid credentials', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(200);

      expect(response.body).toEqual({
        user: {
          id: expect.any(String),
          email: testUser.email,
          name: testUser.name,
          role: 'USER',
          createdAt: expect.any(String),
        },
        access_token: expect.any(String),
      });
    });

    it('should return 401 for invalid email', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: testUser.password,
        })
        .expect(401);
    });

    it('should return 401 for invalid password', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword',
        })
        .expect(401);
    });

    it('should return 400 for invalid input format', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'invalid-email',
          password: '',
        })
        .expect(400);
    });
  });

  describe('/auth/profile (GET)', () => {
    let authToken: string;

    beforeAll(async () => {
      // Get auth token
      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        });

      authToken = loginResponse.body.access_token;
    });

    it('should return user profile with valid token', async () => {
      const response = await request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toEqual({
        id: expect.any(String),
        email: testUser.email,
        name: testUser.name,
        role: 'USER',
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      });
    });

    it('should return 401 without token', async () => {
      await request(app.getHttpServer())
        .get('/auth/profile')
        .expect(401);
    });

    it('should return 401 with invalid token', async () => {
      await request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });
});