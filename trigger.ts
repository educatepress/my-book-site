import 'dotenv/config';
import { GET as NotifyDraftGET } from './src/app/api/cron/notify-draft/route';

async function main() {
  const req = {
    headers: {
      get: () => 'Bearer dev-secret'
    }
  } as any;

  console.log("=== Running Notify Draft ===");
  if (!process.env.SLACK_WEBHOOK_URL) {
     console.error("NO SLACK WEBHOOK URL FOUND in .env!!");
  } else {
     console.log("Found SLACK_WEBHOOK_URL!");
  }
  const res2 = await NotifyDraftGET(req);
  console.log(await res2.text());
}
main();
