import 'dotenv/config';
import { TwitterApi } from 'twitter-api-v2';
import fs from 'fs/promises';

// --- Configuration ---
const apiKey = process.env.TWITTER_API_KEY;
const apiSecret = process.env.TWITTER_API_SECRET;
const accessToken = process.env.TWITTER_ACCESS_TOKEN;
const accessSecret = process.env.TWITTER_ACCESS_SECRET;

if (!apiKey || !apiSecret || !accessToken || !accessSecret) {
    console.error("❌ Error: Missing Twitter API credentials in environment variables.");
    process.exit(1);
}

// Initialize Twitter client with Read & Write permissions
const client = new TwitterApi({
    appKey: apiKey,
    appSecret: apiSecret,
    accessToken: accessToken,
    accessSecret: accessSecret,
});

async function main() {
    try {
        const textPath = process.argv[2];
        if (!textPath) {
            console.error("❌ Error: Please provide the path to a text file containing the tweet as an argument.");
            process.exit(1);
        }

        const tweetText = await fs.readFile(textPath, 'utf8');

        if (tweetText.trim() === '') {
            console.error("❌ Error: Tweet text is empty.");
            process.exit(1);
        }

        console.log(`🚀 Posting to X (Twitter)...\n---\n${tweetText}\n---`);

        const rwClient = client.readWrite; 
        const tweetResponse = await rwClient.v2.tweet(tweetText);

        console.log(`✅ Successfully posted to X! Tweet ID: ${tweetResponse.data.id}`);

    } catch (err: any) {
        console.error("❌ Failed to post to X:", err);
        if (err.data) {
            console.error("API Error Data:", err.data);
        }
        process.exit(1);
    }
}

main();
