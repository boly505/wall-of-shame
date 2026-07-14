import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@wallofshame.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@Shame2024!';
  const adminName = process.env.ADMIN_NAME || 'The Administrator';

  // Check if admin already exists
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash(adminPassword, 12);

    await prisma.user.create({
      data: {
        name: adminName,
        email: adminEmail,
        password: hashedPassword,
        role: 'ADMIN',
        statusLevel: 99,
      },
    });

    console.log(`✅ Admin user created: ${adminEmail}`);
  } else {
    console.log(`ℹ️  Admin user already exists: ${adminEmail}`);
  }

  // Seed some demo posts with placeholder images
  const postCount = await prisma.post.count();
  if (postCount === 0) {
    const demoPosts = [
      {
        imageUrl:
          'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&q=80',
        caption: 'Exhibit #001 — The Archive Begins.',
      },
      {
        imageUrl:
          'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80',
        caption: 'Exhibit #002 — Nothing is forgotten here.',
      },
      {
        imageUrl:
          'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600&q=80',
        caption: 'Exhibit #003 — The record speaks.',
      },
    ];

    for (const post of demoPosts) {
      await prisma.post.create({ data: post });
    }

    console.log(`✅ ${demoPosts.length} demo posts created.`);
  }

  console.log('🌱 Database seeded successfully.');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
