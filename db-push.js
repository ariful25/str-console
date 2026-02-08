const { execSync } = require('child_process');
const path = require('path');

// Set environment variable
process.env.DATABASE_URL = 'postgresql://postgres.nheqczaprzwmstmdcxhb:Ariful252201@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres';

console.log('📦 Prisma Database Push Script');
console.log('================================\n');
console.log('DATABASE_URL:', process.env.DATABASE_URL.replace(/:.*@/, ':***@'));
console.log('Working directory:', process.cwd());
console.log('\n🚀 Pushing schema to Supabase...\n');

try {
  // Run the push command
  execSync('npx prisma db push --skip-generate', {
    cwd: __dirname,
    env: process.env,
    stdio: 'inherit'
  });
  
  console.log('\n✅ Database schema successfully pushed!');
  console.log('\nYour Supabase database now has the following tables:');
  console.log('  • User');
  console.log('  • Client');
  console.log('  • Property');
  console.log('  • Thread');
  console.log('  • Message');
  console.log('  • Analysis');
  console.log('  • ApprovalRequest');
  console.log('  • SendLog');
  console.log('  • AuditLog');
  console.log('  • Template');
  console.log('  • AutoRule');
  console.log('  • Metadata');
  console.log('  • Metric');
  console.log('  • AnalyticsDashboard');
  console.log('  • BulkOperation\n');
  
  console.log('You can now:');
  console.log('  1. Run: npm run dev');
  console.log('  2. Create API routes to use the database');
  console.log('  3. Build features that persist data to Supabase\n');
  
  process.exit(0);
} catch (error) {
  console.error('\n❌ Error pushing database schema:');
  console.error(error.message);
  console.log('\nTroubleshooting:');
  console.log('  • Verify DATABASE_URL is correct');
  console.log('  • Check Supabase credentials');
  console.log('  • Ensure network connection to Supabase');
  process.exit(1);
}
