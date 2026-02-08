#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

// Set the environment variable
process.env.DATABASE_URL = 'postgresql://postgres.nheqczaprzwmstmdcxhb:Ariful252201@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres';

// Change to project directory
process.chdir(path.join(__dirname));

// Run prisma db push
const prisma = spawn('npx', ['prisma', 'db', 'push'], {
  stdio: 'inherit',
  shell: true,
  env: process.env
});

prisma.on('close', (code) => {
  console.log(`\nDatabase push completed with exit code: ${code}`);
  if (code === 0) {
    console.log('✅ Successfully pushed schema to Supabase!');
  } else {
    console.log('❌ Database push failed. Check the error above.');
  }
  process.exit(code);
});

prisma.on('error', (err) => {
  console.error('Failed to start process:', err);
  process.exit(1);
});
