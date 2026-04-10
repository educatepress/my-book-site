import { GET } from './src/app/api/cron/daily-publisher/route';
import { NextRequest } from 'next/server';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

async function run() {
  process.env.NODE_ENV = 'development';
  // Fake request
  const req = new NextRequest('http://localhost:3000/api/cron/daily-publisher', {
    headers: { authorization: `Bearer dev-secret` }
  });
  
  console.log("Triggering Daily Publisher...");
  try {
    const res = await GET(req as any);
    const body = await res.json();
    console.log("Response:", JSON.stringify(body, null, 2));
  } catch(e) {
    console.error("Error:", e);
  }
}
run();
