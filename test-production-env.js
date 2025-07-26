console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Set ✅' : 'Not set ❌');

if (process.env.DATABASE_URL) {
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();
  
  async function testDB() {
    try {
      console.log('Testing database connection...');
      const userCount = await prisma.user.count();
      console.log('✅ Success! User table accessible, count:', userCount);
    } catch (error) {
      console.error('❌ Database error:', error.message);
      console.error('Error code:', error.code);
    } finally {
      await prisma.$disconnect();
    }
  }
  
  testDB();
}
