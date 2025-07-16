import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const users = [];
  
  for (let i = 1; i <= 5; i++) {
    const hashedPassword = await bcrypt.hash('password123', 10);
    const user = await prisma.user.upsert({
      where: { email: `user${i}@example.com` },
      update: {},
      create: {
        email: `user${i}@example.com`,
        password: hashedPassword,
        name: `User ${i}`,
        role: 'USER',
      },
    });
    users.push(user);
  }

  const sampleUrls = [
    'https://github.com/nestjs/nest',
    'https://docs.nestjs.com',
    'https://www.typescriptlang.org',
    'https://reactjs.org',
    'https://nextjs.org',
    'https://tailwindcss.com',
    'https://prisma.io',
    'https://www.postgresql.org',
    'https://swagger.io',
    'https://nodejs.org',
    'https://www.npmjs.com',
    'https://www.docker.com',
    'https://vercel.com',
    'https://www.heroku.com',
    'https://aws.amazon.com',
  ];

  for (let i = 0; i < sampleUrls.length; i++) {
    const randomUser = users[Math.floor(Math.random() * users.length)];
    const shouldHaveUser = Math.random() > 0.3;
    
    const url = await prisma.url.create({
      data: {
        originalUrl: sampleUrls[i],
        slug: `url${i + 1}`,
        userId: shouldHaveUser ? randomUser.id : null,
      },
    });

    const visitCount = Math.floor(Math.random() * 50);
    for (let j = 0; j < visitCount; j++) {
      await prisma.visit.create({
        data: {
          urlId: url.id,
          ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          referer: Math.random() > 0.5 ? 'https://google.com' : null,
        },
      });
    }
  }

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });