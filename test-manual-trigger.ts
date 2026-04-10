import { GET as genText } from './src/app/api/cron/auto-generator-text/route';
import { GET as genVisual } from './src/app/api/cron/auto-generator-visual/route';

async function main() {
  process.env.NODE_ENV = 'development';
  const req = new Request('http://localhost', { headers: { authorization: 'Bearer dev-secret' } });

  console.log('1. Text Generation Triggered...');
  let res = await genText(req);
  console.log(res.status, await res.text());

  console.log('\n2. Visual Generation Triggered...');
  res = await genVisual(req);
  console.log(res.status, await res.text());
}
main();
