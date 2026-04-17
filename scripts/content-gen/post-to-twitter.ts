import 'dotenv/config';
import { TwitterApi } from 'twitter-api-v2';
import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';

// --- Configuration ---
// These environment variables will be passed by GitHub Actions from Repository Secrets
const apiKey = process.env.TWITTER_API_KEY;
const apiSecret = process.env.TWITTER_API_SECRET;
const accessToken = process.env.TWITTER_ACCESS_TOKEN;
const accessSecret = process.env.TWITTER_ACCESS_SECRET;

const enApiKey = process.env.EN_TWITTER_API_KEY;
const enApiSecret = process.env.EN_TWITTER_API_SECRET;
const enAccessToken = process.env.EN_TWITTER_ACCESS_TOKEN;
const enAccessSecret = process.env.EN_TWITTER_ACCESS_SECRET;

if (!apiKey || !apiSecret || !accessToken || !accessSecret) {
    console.error("❌ Error: Missing JP Twitter API credentials in environment variables.");
    console.error("💡 解決方法: GitHubリポジトリの Settings > Secrets and variables > Actions に TWITTER_API_KEY 等の正しい値を設定してください。");
    process.exit(1);
}

// Initialize Twitter clients
const jpClient = new TwitterApi({ appKey: apiKey, appSecret: apiSecret, accessToken: accessToken, accessSecret: accessSecret });

let enClient: TwitterApi | null = null;
if (enApiKey && enApiSecret && enAccessToken && enAccessSecret) {
    enClient = new TwitterApi({ appKey: enApiKey, appSecret: enApiSecret, accessToken: enAccessToken, accessSecret: enAccessSecret });
}

// Helper: sleep
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function tweetWithRetry(client: TwitterApi, text: string, retries = 3): Promise<any> {
    if (process.env.DRY_RUN === 'true') {
        console.log(`[DRY RUN] Would tweet:\n${text}`);
        return { data: { id: 'dry-run-id' } };
    }
    for (let i = 0; i < retries; i++) {
        try {
            return await client.readWrite.v2.tweet(text);
        } catch (err: any) {
            console.error(`❌ Tweet failed (Attempt ${i + 1}/${retries}):`, err.message);
            if (i === retries - 1) throw err;
            await delay(5000 * (i + 1)); // Backoff
        }
    }
}

async function processFile(filePath: string) {
    console.log(`\n⏳ Processing file: ${filePath}`);
    try {
        const fullPath = path.resolve(process.cwd(), filePath);
        const content = await fs.readFile(fullPath, 'utf8');
        const parsed = matter(content);
        let xPostTip = parsed.data.x_post;
        
        if (!xPostTip) {
            console.log("⚠️ No x_post field in frontmatter. Skipping.");
            return;
        }

        const isEnglish = filePath.includes('/blog/en/');
        const langStr = isEnglish ? "EN" : "JP";
        console.log(`🌐 Language detected: ${langStr}`);

        const slug = path.basename(filePath, '.mdx');
        const blogUrl = isEnglish
            ? `https://ttcguide.co/en/blog/${slug}`
            : `https://ttcguide.co/blog/${slug}`;

        let tweetText = "";
        if (isEnglish) {
            tweetText = `【💡Preconception Care Tips】\n\n${xPostTip}\n\n👇 Read the full guide here:\n${blogUrl}\n\n#PreconceptionCare #WomensHealth #Fertility #DrTakuma`;
        } else {
            tweetText = `【💡今週のプレコン・Tips】\n\n${xPostTip}\n\n👇 詳しくはこちらの最新記事で解説しています！\n${blogUrl}\n\n#プレコンセプションケア #女性の健康 #生殖医療 #佐藤琢磨`;
        }
        
        // Ensure tweet fits within X limit
        if (tweetText.length > 270) {
            console.log("⚠️ Tweet text too long, truncating tip...");
            const truncateLength = 270 - (tweetText.length - xPostTip.length);
            const truncatedTip = xPostTip.substring(0, truncateLength - 3) + "...";
            if (isEnglish) {
                 tweetText = `【💡Preconception Care Tips】\n\n${truncatedTip}\n\n👇 Read the full guide here:\n${blogUrl}\n\n#PreconceptionCare #WomensHealth #Fertility #DrTakuma`;
            } else {
                 tweetText = `【💡今週のプレコン・Tips】\n\n${truncatedTip}\n\n👇 詳しくはこちらの最新記事で解説しています！\n${blogUrl}\n\n#プレコンセプションケア #女性の健康 #生殖医療 #佐藤琢磨`;
            }
        }

        console.log(`📝 Prepared Tweet:\n---\n${tweetText}\n---`);

        const tClient = isEnglish ? enClient : jpClient;
        if (!tClient) {
            console.error(`❌ Missing Twitter credentials for ${langStr} account.`);
            return;
        }

        const tweetResponse = await tweetWithRetry(tClient, tweetText);
        console.log(`✅ Successfully posted to ${langStr} X! Tweet ID: ${tweetResponse.data.id}`);
        
    } catch (err: any) {
        console.error(`❌ Failed to process ${filePath}:`, err.message);
    }
}

async function main() {
    console.log("🚀 Starting Automatic X (Twitter) Post...");

    const targetFilesEnv = process.env.TARGET_FILE;
    if (!targetFilesEnv) {
        console.log("⚠️ No TARGET_FILE provided by environment. Exiting.");
        process.exit(0);
    }

    // TARGET_FILE may contain multiple newline-separated files
    const files = targetFilesEnv.split('\\n').flatMap(line => line.split('\n')).map(f => f.trim()).filter(f => f.endsWith('.mdx'));
    
    if (files.length === 0) {
        console.log("⚠️ No relevant .mdx files found to process. Exiting.");
        process.exit(0);
    }

    console.log(`📌 Found ${files.length} new blog file(s) to post:`);
    for (const f of files) console.log(`  - ${f}`);

    for (const file of files) {
        await processFile(file);
        // Add delay between posts if processing multiple to avoid rate limits
        if (files.length > 1) {
            await delay(3000);
        }
    }
    console.log("\\n🎉 All X posts completed successfully.");
}

main();
