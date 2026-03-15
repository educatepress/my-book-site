import 'dotenv/config';
import { TwitterApi } from 'twitter-api-v2';

const client = new TwitterApi({
    appKey: process.env.TWITTER_API_KEY as string,
    appSecret: process.env.TWITTER_API_SECRET as string,
    accessToken: process.env.TWITTER_ACCESS_TOKEN as string,
    accessSecret: process.env.TWITTER_ACCESS_SECRET as string,
});

async function run() {
    try {
        const me = await client.v2.me();
        console.log("✅ Success! Authenticated as:", me.data.username);
    } catch (err: any) {
        console.error("❌ Error Authenticating:");
        if (err.data) {
            console.error(err.data);
        } else {
            console.error(err);
        }
    }
}
run();
