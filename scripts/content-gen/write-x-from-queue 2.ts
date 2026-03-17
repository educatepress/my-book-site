import 'dotenv/config';
import { GoogleGenAI } from '@google/genai';
import { TwitterApi } from 'twitter-api-v2';
import fs from 'fs/promises';
import path from 'path';
import { getNextPendingItem, markItemStatus } from './queue-manager';
import { verifyUrl, extractAndVerifySourceUrl } from './url-verifier';

// Configure Gemini API
if (!process.env.GEMINI_API_KEY) {
    console.error("❌ Error: GEMINI_API_KEY is missing in .env");
    process.exit(1);
}
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Configure Twitter APIs
const jpApiKey = process.env.TWITTER_API_KEY;
const jpApiSecret = process.env.TWITTER_API_SECRET;
const jpAccessToken = process.env.TWITTER_ACCESS_TOKEN;
const jpAccessSecret = process.env.TWITTER_ACCESS_SECRET;

const enApiKey = process.env.EN_TWITTER_API_KEY;
const enApiSecret = process.env.EN_TWITTER_API_SECRET;
const enAccessToken = process.env.EN_TWITTER_ACCESS_TOKEN;
const enAccessSecret = process.env.EN_TWITTER_ACCESS_SECRET;

let jpClient: TwitterApi | null = null;
if (jpApiKey && jpApiSecret && jpAccessToken && jpAccessSecret) {
    jpClient = new TwitterApi({
        appKey: jpApiKey,
        appSecret: jpApiSecret,
        accessToken: jpAccessToken,
        accessSecret: jpAccessSecret,
    });
} else {
    console.warn("⚠️ Warning: JP Twitter API credentials missing.");
}

let enClient: TwitterApi | null = null;
if (enApiKey && enApiSecret && enAccessToken && enAccessSecret) {
    enClient = new TwitterApi({
        appKey: enApiKey,
        appSecret: enApiSecret,
        accessToken: enAccessToken,
        accessSecret: enAccessSecret,
    });
} else {
    console.warn("⚠️ Warning: EN Twitter API credentials missing.");
}

async function main() {
    console.log("🚀 Starting X Content Generation from Queue...");

    const item = await getNextPendingItem("x");
    if (!item) {
        console.log("🟢 The Queue is empty. No pending X posts to process today.");
        process.exit(0);
    }

    console.log(`\n📋 Processing Item [${item.id}]: ${item.theme}`);
    console.log(`🔗 Primary Source URL: ${item.sourceUrls[0]}`);

    const prompt = `
あなたは、生殖医療専門医（産婦人科医）である佐藤琢磨医師の専属AIコンテンツクリエイターです。

あなたのタスクは、提供された【指定テーマ】と【エビデンス（ソースURL）】をもとに、「X（旧Twitter）へのデイリー投稿」を2言語（日本語・英語）で作成することです。

【発信テーマ情報（MUST）】
- 日本語テーマ: ${item.theme}
- 英語テーマ: ${item.themeEn}
- 記事の方向性/目的 (JP): ${item.direction}
- 記事の方向性/目的 (EN): ${item.directionEn}
- エビデンスとなるソースURL: ${item.sourceUrls.join('\n')}

【超重要: 検索と情報源抽出プロセス（必須）】
あなたは手持ちの知識で記事をでっち上げるのではなく、必ず以下のステップを踏んでください:
1. 提供されたソースURL（${item.sourceUrls[0]}）の内容を読み込み（Google Search等を利用して内容を把握する）、要約・ファクトを抽出してください。
2. 投稿の最後に必ず、提供された【ソースURL】を添付してください。

【人間味のある「共感的なコメント（感想）」の付与（必須）】
ニュース記事の単なる要約にするのではなく、必ず「医師としての人間味のある短い感想・コメント」を添えてください。
- ❌ 強い断定、批判は絶対に避けること。
- ✅ 「共感的（Empathetic）」「傾聴的（Listening）」なスタンスを維持する。
- ✅ 「不安になりますよね」「こんな視点もあるのですね」「焦らずに一緒に歩んでいきましょう」といったニュアンス。

【文化に合わせたトーンの制御】
■ 日本語の投稿ルール:
日本の読者は否定的・棘のある表現を嫌います。
  ❌ 禁止: 「意味のない努力」「逆効果」「間違った情報」「限界を感じていませんか？」
  ✅ 推奨: 「〜という選択肢もあります」「〜を知っておくと安心です」「専門医の視点から〜」
トーンは「信頼できるかかりつけ医が優しく語りかけるように」。

■ 英語の投稿ルール:
  ❌ 禁止: 恐怖ベースの煽り（"You're ruining your chances"など）
  ✅ 推奨: Empowermentベースの表現（"Knowledge is power", "You deserve informed decisions"）

【CTAリンクについて（超重要）】
- 投稿テキストの中に書籍ガイドのURL（doctors-guide-womens-health.vercel.app等）は含めないでください。
- 「当院」「当クリニック」という表現は使わないでください。

---
生成するアセット（JSON形式）:

1. "jpXPost": 日本語のX投稿テキスト（140〜200文字程度）。
   - ポジティブなHookから始める。否定語・恐怖喚起は絶対禁止。
   - ${item.direction} の指示に必ず従うこと。
   - 情報の信頼性を高めるため、指定されたソースURLを必ず最後に記載する。
   - ハッシュタグ（#プレコンセプションケア #妊活 など）を含める。

2. "enXPostThread": 英語のX投稿（スレッド形式、2〜4ツイート）。配列で出力。
   - Empowermentベースのトーン。
   - ${item.directionEn} の指示に必ず従うこと。
   - 指定されたソースURLを含める。
   - #TTC #Infertility などのハッシュタグを入れる。

---
CRITICAL: ONLY OUTPUT RAW VALID JSON. DO NOT INCLUDE MARKDOWN CODE BLOCKS.
{
  "jpXPost": "Japanese tweet text...",
  "enXPostThread": ["1st tweet...", "2nd tweet...", "3rd tweet..."]
}
`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }],
            }
        });

        let resultText = response.text || '{}';
        resultText = resultText.replace(/^```json\s*/, '').replace(/\s*```$/, '');

        let result;
        try {
            result = JSON.parse(resultText);
        } catch (e) {
             console.log("Raw Response:", resultText);
             throw new Error("Failed to parse JSON response");
        }

        let jpText: string = result.jpXPost || "";
        let enThread: string[] = result.enXPostThread || [];

        // --- URL Verification Phase ---
        console.log("\n🔍 Verifying URLs in generated output...");
        
        try {
            console.log("\n  [Checking JP Post]");
            jpText = await extractAndVerifySourceUrl(jpText);
        } catch (e: any) {
            console.error(e.message);
            console.error("  👉 Aborting JP post formatting.");
            jpText = "";
        }

        if (enThread.length > 0) {
            console.log("\n  [Checking EN Thread]");
            const fullEnText = enThread.join(' ');
            try {
                await extractAndVerifySourceUrl(fullEnText);
                // Clean individual parts
                for (let i = 0; i < enThread.length; i++) {
                     const urls = enThread[i].match(/https?:\/\/[^\s)\]"']+/g) || [];
                     for (const url of urls) {
                         if (!(await verifyUrl(url))) {
                             enThread[i] = enThread[i].replace(url, '').replace(/\n\n+/g, '\n\n').trim();
                         }
                     }
                }
            } catch (e: any) {
                console.error(e.message);
                console.error("  👉 Aborting EN thread formatting.");
                enThread = [];
            }
        }

        if (!jpText && enThread.length === 0) {
             console.error("❌ Both JP and EN outputs failed validation or hallucinated URLs. Exiting.");
             process.exit(1);
        }

        // Save locally as backup
        const outDir = path.join(process.cwd(), 'scripts', 'content-gen', 'out-daily-x');
        await fs.mkdir(outDir, { recursive: true });
        const todayStr = new Date().toISOString().split('T')[0];
        if (jpText) await fs.writeFile(path.join(outDir, `${todayStr}-jp.txt`), jpText);
        if (enThread.length > 0) await fs.writeFile(path.join(outDir, `${todayStr}-en-thread.json`), JSON.stringify(enThread, null, 2));

        console.log("--- ✨ JP Preview ✨ ---\n" + jpText);
        console.log("\n--- ✨ EN Thread Preview ✨ ---\n" + enThread.join('\n\n---\n\n'));

        // Action posting
        let postSuccess = false;

        if (jpClient && jpText) {
            console.log("\n🚀 Posting to JP Twitter...");
            try {
                const jpRes = await jpClient.readWrite.v2.tweet(jpText);
                console.log(`✅ Success JP Tweet ID: ${jpRes.data.id}`);
                postSuccess = true;
            } catch (jpErr) {
                console.error("❌ Failed to post JP tweet:", jpErr);
            }
        }

        if (enClient && enThread.length > 0) {
            console.log("\n🚀 Posting to EN Twitter Thread...");
            try {
                const enRes = await enClient.readWrite.v2.tweetThread(enThread);
                console.log(`✅ Success EN Thread. First Tweet ID: ${enRes[0].data.id}`);
                postSuccess = true;
            } catch (enErr) {
                console.error("❌ Failed to post EN thread:", enErr);
            }
        }

        if (postSuccess) {
            await markItemStatus(item.id, "posted");
        } else {
             // If local generation worked but Twitter API failed (e.g no credentials locally), mark as generated.
            await markItemStatus(item.id, "generated");
            console.log("✅ Marked as 'generated' locally due to Twitter API failure (or running locally).");
        }

        console.log("\n🎉 Queue X Generation & Posting complete!");

    } catch (err: any) {
        console.error("❌ Error processing X queue:");
        console.error(err);
        process.exit(1);
    }
}

main();
