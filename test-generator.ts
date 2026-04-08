import { GET } from './src/app/api/cron/auto-generator/route';

async function run() {
  const req = new Request('http://localhost/api/cron/auto-generator');
  req.headers.set('authorization', `Bearer dev-secret`);
  
  const res = await GET(req);
  const data = await res.json();
  console.log(data);
}

run();
