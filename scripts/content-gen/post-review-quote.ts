/**
 * Posts a random Amazon review quote as social proof tweet
 * Rotates between JP and EN reviews
 */
import * as dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.join(process.cwd(), '.env') });
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

import { TwitterApi } from 'twitter-api-v2';

const apiKey = process.env.EN_TWITTER_API_KEY || process.env.TWITTER_API_KEY;
const apiSecret = process.env.EN_TWITTER_API_SECRET || process.env.TWITTER_API_SECRET;
const accessToken = process.env.EN_TWITTER_ACCESS_TOKEN || process.env.TWITTER_ACCESS_TOKEN;
const accessSecret = process.env.EN_TWITTER_ACCESS_SECRET || process.env.TWITTER_ACCESS_SECRET;

if (!apiKey || !apiSecret || !accessToken || !accessSecret) {
  console.error('❌ Twitter credentials missing');
  process.exit(1);
}

const client = new TwitterApi({ appKey: apiKey, appSecret: apiSecret, accessToken, accessSecret });

const EN_REVIEWS = [
  {
    quote: "It clearly explains the information working women need to know regarding future pregnancy. I also thought it would be a great book for partners to read.",
    reviewer: "Hiyokomame",
  },
  {
    quote: "Beyond just listing medical facts, you can feel the author's sincere wish for the readers' happy life planning, drawn from his own experiences as a father.",
    reviewer: "Amazon Reviewer",
  },
];

const EN_TEMPLATES = [
  (r: typeof EN_REVIEWS[0]) => `★★★★★\n\n"${r.quote}"\n— ${r.reviewer}, Amazon Review\n\n📖 24 evidence-based facts from a fertility specialist:\nhttps://amazon.com/dp/B0F7XTWJ3X?tag=ttcguide-enlp-22\n\n#TTC #TTCcommunity`,
  (r: typeof EN_REVIEWS[0]) => `What readers are saying:\n\n"${r.quote}"\n\nWritten by a board-certified fertility specialist.\n\nhttps://amazon.com/dp/B0F7XTWJ3X?tag=ttcguide-enlp-22\n\n#fertility #TTCcommunity`,
  (r: typeof EN_REVIEWS[0]) => `This review made my day 🙏\n\n"${r.quote}"\n\nIf one person feels more prepared after reading, that's everything.\n\nhttps://amazon.com/dp/B0F7XTWJ3X?tag=ttcguide-enlp-22\n\n#TTC #babydust ✨`,
];

async function main() {
  const review = EN_REVIEWS[Math.floor(Math.random() * EN_REVIEWS.length)];
  const template = EN_TEMPLATES[Math.floor(Math.random() * EN_TEMPLATES.length)];
  const text = template(review);

  // Truncate if needed
  const finalText = text.length > 280 ? text.substring(0, 277) + '...' : text;

  const result = await client.v2.tweet(finalText);
  console.log(`✅ Review tweet posted: ${result.data.id}`);
}

main().catch(e => {
  console.error('Error:', e.message);
  process.exit(1);
});
