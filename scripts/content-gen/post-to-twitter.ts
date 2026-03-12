import 'dotenv/config';
import { TwitterApi } from 'twitter-api-v2';
import fs from 'fs/promises';
import path from 'path';

// --- Configuration ---
// These environment variables will be passed by GitHub Actions from Repository Secrets
const apiKey = process.env.TWITTER_API_KEY;
const apiSecret = process.env.TWITTER_API_SECRET;
const accessToken = process.env.TWITTER_ACCESS_TOKEN;
const accessSecret = process.env.TWITTER_ACCESS_SECRET;

if (!apiKey || !apiSecret || !accessToken || !accessSecret) {
    console.error("❌ Error: Missing Twitter API credentials in environment variables.");
    process.exit(1);
}

// Initialize Twitter client with Read & Write permissions (OAuth 1.0a)
const client = new TwitterApi({
    appKey: apiKey,
    appSecret: apiSecret,
    accessToken: accessToken,
    accessSecret: accessSecret,
});

async function main() {
    console.log("🚀 Starting Automatic X (Twitter) Post...");

    try {
        // 1. Find the latest generated JP Blog post
        const jpBlogDir = path.join(process.cwd(), 'src/content/blog/jp');
        const files = await fs.readdir(jpBlogDir);

        // Filter out non-mdx files and sort descending to get the latest easily
        const mdxFiles = files.filter(f => f.endsWith('.mdx')).sort().reverse();

        if (mdxFiles.length === 0) {
            console.log("⚠️ No blog files found. Exiting without posting.");
            process.exit(0);
        }

        const latestFile = mdxFiles[0];
        const content = await fs.readFile(path.join(jpBlogDir, latestFile), 'utf8');

        // Extract title
        let title = "最新のブログ記事が公開されました！"; // fallback
        const titleMatch = content.match(/^title:\s*['"]?([^'"]+)['"]?/m);
        if (titleMatch) {
            title = titleMatch[1];
        }

        // Extract slug from filename (e.g. "my-post.mdx" -> "my-post")
        const slug = latestFile.replace(/\.mdx$/, '');

        // 2. Construct the Tweet Content
        const blogUrl = `https://doctors-guide-womens-health.vercel.app/blog/${slug}`;

        const tweetText = `【新着記事】\n\n${title}\n\n詳細はこちら👇\n${blogUrl}\n\n#プレコンセプションケア #女性の健康 #生殖医療 #佐藤琢磨`;

        console.log(`📝 Tweet content prepared:\n---\n${tweetText}\n---`);

        // 3. Post to X (Twitter)
        const rwClient = client.readWrite; // ensure write context
        const tweetResponse = await rwClient.v2.tweet(tweetText);

        console.log(`✅ Successfully posted to X! Tweet ID: ${tweetResponse.data.id}`);

    } catch (err: any) {
        console.error("❌ Failed to post to X:", err);
        // If it's an API error, it might have data in err.data
        if (err.data) {
            console.error("API Error Data:", err.data);
        }
        process.exit(1);
    }
}

main();
