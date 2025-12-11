#!/usr/bin/env node

/**
 * Database Setup Helper Script
 * 
 * This script helps you set up your Supabase database connection.
 * Run: node scripts/setup-db.js
 */

const readline = require('readline');
const fs = require('fs');
const path = require('path');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function main() {
  console.log('\n🔧 Supabase Database Setup Helper\n');
  console.log('This script will help you configure your DATABASE_URL.\n');

  console.log('📋 Steps to get your connection string:');
  console.log('1. Go to https://app.supabase.com/');
  console.log('2. Select your project');
  console.log('3. Go to Settings → Database');
  console.log('4. Scroll to "Connection Pooler" section (NOT "Connection string")');
  console.log('5. Find "Session mode" connection info');
  console.log('6. Note the host (should be db.xxxxx.pooler.supabase.com)');
  console.log('7. Note the port (should be 6543)\n');
  console.log('⚠️  IMPORTANT: Always use Session Pooler for IPv4 compatibility!\n');

  const host = await question('Enter your Supabase pooler host (e.g., db.wxuyyxqohjtcorzmmuay.pooler.supabase.com): ');
  const password = await question('Enter your database password: ');
  
  // Always use pooler for IPv4 compatibility
  const port = '6543';
  const poolerParam = '?pgbouncer=true&sslmode=require';

  // URL encode password
  const encodedPassword = encodeURIComponent(password);
  
  const databaseUrl = `postgresql://postgres:${encodedPassword}@${host}:${port}/postgres${poolerParam}`;

  console.log('\n✅ Your DATABASE_URL:');
  console.log(databaseUrl);
  console.log('\n📝 Add this to your .env file:\n');
  console.log(`DATABASE_URL="${databaseUrl}"\n`);

  const updateEnv = await question('Would you like to update .env file automatically? (y/n): ');
  
  if (updateEnv.toLowerCase() === 'y') {
    const envPath = path.join(__dirname, '..', '.env');
    let envContent = '';
    
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
      
      // Replace existing DATABASE_URL or add it
      if (envContent.includes('DATABASE_URL=')) {
        envContent = envContent.replace(/DATABASE_URL=.*/g, `DATABASE_URL="${databaseUrl}"`);
      } else {
        envContent += `\nDATABASE_URL="${databaseUrl}"\n`;
      }
    } else {
      envContent = `DATABASE_URL="${databaseUrl}"\n`;
    }
    
    fs.writeFileSync(envPath, envContent);
    console.log('\n✅ Updated .env file!');
  }

  console.log('\n📚 Next steps:');
  console.log('1. Run: npx prisma generate');
  console.log('2. Run: npx prisma db push');
  console.log('3. Run: npx prisma studio (to verify tables were created)\n');

  rl.close();
}

main().catch(console.error);

