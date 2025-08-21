import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  try {
    // Clear existing data (optional - uncomment if you want to start fresh)
    // await prisma.orderItem.deleteMany();
    // await prisma.order.deleteMany();
    // await prisma.product.deleteMany();
    // await prisma.category.deleteMany();
    // await prisma.user.deleteMany();

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
      prisma.category.upsert({
        where: { name: 'Hardware' },
        update: {},
        create: { name: 'Hardware' },
      }),
      prisma.category.upsert({
        where: { name: 'Apparel' },
        update: {},
        create: { name: 'Apparel' },
      }),
    ]);

    console.log('✅ Categories created:', categories.length);

    // Hash passwords with Argon2
    const password123 = await argon2.hash('password123', {
      type: argon2.argon2id,
      memoryCost: 2 ** 16,
      timeCost: 3,
      parallelism: 1,
    });

    // Create test users
    const users = await Promise.all([
      prisma.user.upsert({
        where: { email: 'admin@skateshop.com' },
        update: {},
        create: {
          email: 'admin@skateshop.com',
          password: password123,
          role: 'ADMIN',
        },
      }),
      prisma.user.upsert({
        where: { email: 'user@skateshop.com' },
        update: {},
        create: {
          email: 'user@skateshop.com',
          password: password123,
          role: 'USER',
        },
      }),
      prisma.user.upsert({
        where: { email: 'john@skateshop.com' },
        update: {},
        create: {
          email: 'john@skateshop.com',
          password: password123,
          role: 'USER',
        },
      }),
    ]);

    console.log('✅ Users created:', users.length);

    // Create test products with more realistic data
    const products = await Promise.all([
      prisma.product.create({
        data: {
          title: 'Pro Skateboard Deck',
          description:
            'High-quality 8.0" skateboard deck made from 7-ply maple. Perfect for street and park skating.',
          price: 59.99,
          image:
            'https://images.unsplash.com/photo-1572776685600-cf276d3c3b32?w=400',
          categoryId: categories[0].id, // Decks
        },
      }),
      prisma.product.create({
        data: {
          title: 'Aluminum Skateboard Trucks',
          description:
            'Lightweight aluminum trucks with perfect turning radius. Compatible with most deck sizes.',
          price: 45.99,
          image:
            'https://images.unsplash.com/photo-1572776685600-cf276d3c3b32?w=400',
          categoryId: categories[1].id, // Trucks
        },
      }),
      prisma.product.create({
        data: {
          title: 'High-Speed Bearings',
          description:
            'ABEC-7 rated bearings for maximum speed and durability. Includes 8 bearings.',
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
            'Black grip tape with excellent traction for all skate styles. 9" x 33" sheet.',
          price: 12.99,
          image:
            'https://images.unsplash.com/photo-1572776685600-cf276d3c3b32?w=400',
          categoryId: categories[4].id, // Grip Tape
        },
      }),
      prisma.product.create({
        data: {
          title: 'Wide Wheels Set',
          description:
            '54mm wheels perfect for cruising and street skating. Set of 4 wheels.',
          price: 34.99,
          image:
            'https://images.unsplash.com/photo-1572776685600-cf276d3c3b32?w=400',
          categoryId: categories[2].id, // Wheels
        },
      }),
      prisma.product.create({
        data: {
          title: 'Skateboard Hardware Kit',
          description:
            'Complete hardware kit including 8 bolts and 8 nuts. 1" length, black finish.',
          price: 8.99,
          image:
            'https://images.unsplash.com/photo-1572776685600-cf276d3c3b32?w=400',
          categoryId: categories[5].id, // Hardware
        },
      }),
      prisma.product.create({
        data: {
          title: 'Skate T-Shirt',
          description:
            'Comfortable cotton t-shirt with skate design. Available in multiple sizes.',
          price: 24.99,
          image:
            'https://images.unsplash.com/photo-1572776685600-cf276d3c3b32?w=400',
          categoryId: categories[6].id, // Apparel
        },
      }),
    ]);

    console.log('✅ Products created:', products.length);

    // Create test orders
    const orders = await Promise.all([
      prisma.order.create({
        data: {
          userId: users[1].id, // user@skateshop.com
          status: 'PAID',
          items: {
            create: [
              {
                productId: products[0].id, // Pro Skateboard Deck
                quantity: 1,
              },
              {
                productId: products[1].id, // Aluminum Trucks
                quantity: 1,
              },
            ],
          },
        },
      }),
      prisma.order.create({
        data: {
          userId: users[2].id, // john@skateshop.com
          status: 'PENDING',
          items: {
            create: [
              {
                productId: products[2].id, // Bearings
                quantity: 2,
              },
              {
                productId: products[4].id, // Wheels
                quantity: 1,
              },
            ],
          },
        },
      }),
      prisma.order.create({
        data: {
          userId: users[1].id, // user@skateshop.com
          status: 'SHIPPED',
          items: {
            create: [
              {
                productId: products[3].id, // Grip Tape
                quantity: 1,
              },
              {
                productId: products[5].id, // Hardware
                quantity: 1,
              },
            ],
          },
        },
      }),
    ]);

    console.log('✅ Orders created:', orders.length);

    console.log('🎉 Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   Categories: ${categories.length}`);
    console.log(`   Users: ${users.length}`);
    console.log(`   Products: ${products.length}`);
    console.log(`   Orders: ${orders.length}`);
    console.log('\n🔑 Test Credentials:');
    console.log('   Admin: admin@skateshop.com / password123');
    console.log('   User: user@skateshop.com / password123');
    console.log('   User: john@skateshop.com / password123');
    console.log('\n📦 Sample Orders:');
    console.log('   - User order with deck and trucks (PAID)');
    console.log("   - John's order with bearings and wheels (PENDING)");
    console.log(
      "   - User's second order with grip tape and hardware (SHIPPED)",
    );
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
