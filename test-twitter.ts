
import { TwitterApi } from 'twitter-api-v2';
import dotenv from 'dotenv';
dotenv.config();

async function check() {
  console.log('Starting...');
  const client = new TwitterApi({
    appKey: process.env.TWITTER_API_KEY || '',
    appSecret: process.env.TWITTER_API_SECRET || '',
    accessToken: process.env.TWITTER_ACCESS_TOKEN || '',
    accessSecret: process.env.TWITTER_ACCESS_SECRET || ''
  });
  console.log('Fetching me()...');
  const me = await client.v2.me();
  console.log('Me:', me?.data?.id);
}
check().catch(console.error);

