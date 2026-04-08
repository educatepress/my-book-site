import 'dotenv/config';
import { GET } from './src/app/api/cron/pre-patrol/route';

async function main() {
  const req = {
    headers: {
      get: () => 'Bearer dev-secret'
    }
  } as any;

  console.log("=== Running Pre Patrol ===");
  const res = await GET(req);
  console.log(await res.text());
}
main();
