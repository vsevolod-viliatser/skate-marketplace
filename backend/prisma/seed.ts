import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { name: 'Decks' },
      update: {},
      create: { name: 'Decks' },
    }),
    prisma.category.upsert({
      where: { name: 'Trucks' },
      update: {},
      create: { name: 'Trucks' },
    }),
    prisma.category.upsert({
      where: { name: 'Wheels' },
      update: {},
      create: { name: 'Wheels' },
    }),
    prisma.category.upsert({
      where: { name: 'Bearings' },
      update: {},
      create: { name: 'Bearings' },
    }),
    prisma.category.upsert({
      where: { name: 'Grip Tape' },
      update: {},
      create: { name: 'Grip Tape' },
    }),
  ]);

  console.log('✅ Categories created:', categories.length);

  // Create test users
  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: 'admin@skateshop.com' },
      update: {},
      create: {
        email: 'admin@skateshop.com',
        password:
          '$2b$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJptJ/op0wSsvqNu/1m', // password123
        role: 'ADMIN',
      },
    }),
    prisma.user.upsert({
      where: { email: 'user@skateshop.com' },
      update: {},
      create: {
        email: 'user@skateshop.com',
        password:
          '$2b$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJptJ/op0wSsvqNu/1m', // password123
        role: 'USER',
      },
    }),
  ]);

  console.log('✅ Users created:', users.length);

  // Create test products
  const products = await Promise.all([
    prisma.product.create({
      data: {
        title: 'Pro Skateboard Deck',
        description: 'High-quality 8.0" skateboard deck made from 7-ply maple',
        price: 59.99,
        image:
          'https://images.unsplash.com/photo-1572776685600-cf276d3c3b32?w=400',
        categoryId: categories[0].id, // Decks
      },
    }),
    prisma.product.create({
      data: {
        title: 'Aluminum Skateboard Trucks',
        description: 'Lightweight aluminum trucks with perfect turning radius',
        price: 45.99,
        image:
          'https://images.unsplash.com/photo-1572776685600-cf276d3c3b32?w=400',
        categoryId: categories[1].id, // Trucks
      },
    }),
    prisma.product.create({
      data: {
        title: 'High-Speed Bearings',
        description: 'ABEC-7 rated bearings for maximum speed and durability',
        price: 19.99,
        image:
          'https://images.unsplash.com/photo-1572776685600-cf276d3c3b32?w=400',
        categoryId: categories[3].id, // Bearings
      },
    }),
    prisma.product.create({
      data: {
        title: 'Grip Tape Sheet',
        description:
          'Black grip tape with excellent traction for all skate styles',
        price: 12.99,
        image:
          'https://images.unsplash.com/photo-1572776685600-cf276d3c3b32?w=400',
        categoryId: categories[4].id, // Grip Tape
      },
    }),
    prisma.product.create({
      data: {
        title: 'Wide Wheels Set',
        description: '54mm wheels perfect for cruising and street skating',
        price: 34.99,
        image:
          'https://images.unsplash.com/photo-1572776685600-cf276d3c3b32?w=400',
        categoryId: categories[2].id, // Wheels
      },
    }),
  ]);

  console.log('✅ Products created:', products.length);

  console.log('🎉 Database seeding completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`   Categories: ${categories.length}`);
  console.log(`   Users: ${users.length}`);
  console.log(`   Products: ${products.length}`);
  console.log('\n🔑 Test Credentials:');
  console.log('   Admin: admin@skateshop.com / password123');
  console.log('   User: user@skateshop.com / password123');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
