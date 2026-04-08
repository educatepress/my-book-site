import 'dotenv/config';
import { GET } from './src/app/api/cron/auto-generator/route';

async function main() {
  const req = {
    headers: {
      get: () => 'Bearer dev-secret'
    }
  } as any;

  console.log("=== Running Auto Generator ===");
  const res = await GET(req);
  console.log(await res.text());
}
main();
