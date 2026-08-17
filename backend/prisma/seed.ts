import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/common/utils/hash';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create admin user
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      name: 'Admin',
      email: 'admin@example.com',
      passwordHash: await hashPassword('password123'),
      role: 'ADMIN',
    },
  });

  console.log('✓ Admin user created:', admin.email);

  // Create sample scholars
  const scholars = await Promise.all([
    prisma.scholar.upsert({
      where: { slug: 'ruwaid-ibn-najim' },
      update: {},
      create: {
        name: 'Ruwaid Ibn Najim',
        slug: 'ruwaid-ibn-najim',
        biography: 'Islamic scholar and speaker',
        status: 'ACTIVE',
      },
    }),
    prisma.scholar.upsert({
      where: { slug: 'abdul-hameed-ash-shammari' },
      update: {},
      create: {
        name: 'Abdul Hameed Ash Shammari',
        slug: 'abdul-hameed-ash-shammari',
        biography: 'Known for clear Islamic teachings',
        status: 'ACTIVE',
      },
    }),
  ]);

  console.log('✓ Sample scholars created');

  // Create sample topics
  const topics = await Promise.all([
    prisma.topic.upsert({
      where: { name: 'Tawheed' },
      update: {},
      create: { name: 'Tawheed' },
    }),
    prisma.topic.upsert({
      where: { name: 'Fiqh' },
      update: {},
      create: { name: 'Fiqh' },
    }),
    prisma.topic.upsert({
      where: { name: 'Hadith' },
      update: {},
      create: { name: 'Hadith' },
    }),
  ]);

  console.log('✓ Sample topics created');

  // Create sample series
  const series = await prisma.series.create({
    data: {
      title: 'Tawheed Series',
      slug: 'tawheed-series',
      description: 'Comprehensive series on Islamic monotheism',
      scholarId: scholars[0].id,
      status: 'PUBLISHED',
    },
  });

  console.log('✓ Sample series created');

  // Create sample episodes
  for (let i = 1; i <= 5; i++) {
    await prisma.episode.create({
      data: {
        title: `Episode ${i} - Understanding Tawheed`,
        slug: `episode-${i}-understanding-tawheed`,
        description: `This is episode ${i} discussing the foundations of Islamic belief.`,
        duration: 3600 + i * 600,
        scholarId: scholars[0].id,
        seriesId: series.id,
        status: 'PUBLISHED',
        publishedAt: new Date(Date.now() - i * 86400000),
        topics: {
          create: [
            {
              topic: { connect: { id: topics[0].id } },
            },
          ],
        },
      },
    });
  }

  console.log('✓ Sample episodes created');

  console.log('✅ Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
