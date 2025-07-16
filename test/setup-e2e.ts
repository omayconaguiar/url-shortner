import {PrismaClient} from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url:
        process.env.DATABASE_URL ||
        'postgresql://urlshortener:password@localhost:5432/url_shortener_test?schema=public',
    },
  },
});

beforeAll(async () => {
  await prisma.$connect();
});

afterAll(async () => {
  await prisma.$disconnect();
});

global.beforeEach(async () => {
  // Clean up database before each test
  const deleteVisits = prisma.visit.deleteMany();
  const deleteUrls = prisma.url.deleteMany();
  const deleteUsers = prisma.user.deleteMany();

  await prisma.$transaction([deleteVisits, deleteUrls, deleteUsers]);
});
