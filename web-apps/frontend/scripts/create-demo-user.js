const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    // Check if demo user already exists
    const existingUser = await prisma.user.findUnique({
      where: { id: 'demo-user-001' }
    });

    if (existingUser) {
      console.log('Demo user already exists');
      return;
    }

    // Create demo user
    const user = await prisma.user.create({
      data: {
        id: 'demo-user-001',
        email: 'demo@example.com',
      }
    });

    console.log('Demo user created:', user);
  } catch (error) {
    console.error('Error creating demo user:', error);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());