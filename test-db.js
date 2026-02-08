const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testConnection() {
  try {
    console.log('Testing Supabase connection...');
    console.log('DATABASE_URL:', process.env.DATABASE_URL);
    
    const result = await prisma.$queryRaw`SELECT NOW()`;
    console.log('✅ Connection successful!');
    console.log('Current database time:', result);
    process.exit(0);
  } catch (error) {
    console.error('❌ Connection failed!');
    console.error('Error:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
