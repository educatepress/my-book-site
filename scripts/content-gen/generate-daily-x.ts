import 'dotenv/config';
import { GoogleGenAI } from '@google/genai';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

// Configure Gemini API
if (!process.env.GEMINI_API_KEY) {
    console.error("❌ Error: GEMINI_API_KEY is missing in .env");
    process.exit(1);
}
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function main() {
    console.log("🚀 Starting Daily X Content Generation (with Google Search Grounding)...");

    const today = new Date().toISOString().split('T')[0];

    // System Prompt for multi-asset generation
    const prompt = `
あなたは、生殖医療専門医（産婦人科医）である佐藤琢磨医師の専属AIコンテンツクリエイター兼、Webマーケティング/SEO/AEOの達人です。
本日の日付は: ${today} です。

あなたのタスクは、最新の検索（Google Search）から得た情報をもとに、ブログ投稿がない日用の「X（旧Twitter）へのデイリー投稿」を2言語（日本語・英語）で作成することです。

【超重要戦略: Smart Brevity（結論ファースト）】
X（Twitter）では「最初の1行目でスクロールを止める人がわずか3%」です。挨拶やダラダラとした前置きは絶対に不要です。
投稿は常に以下の「3ステップ構成」を厳守してください。

1. [Hook / 最初の1行]: 読者がドキッとするような常識を覆す事実や、具体的な問題提起（結論に近い強い言葉）で始めてください。
2. [Why it matters / なぜ重要か]: 箇条書き（3点程度）で、その事実の医学的な理由やリスク、または行動すべき理由を簡潔に示してください。
3. [The Lede / 結論]: だからこそ、どう考えるべきかを提示し、可能であれば最新ニュースや関連するエビデンス（引用URL）を添えてください。全体をEmpowermentのトーンで締めくくってください。

---

生成するアセット（JSON形式）:

1. "jpXPost": 日本語のX投稿テキスト（140〜200文字程度）。
   - 「寄り添い」からの「専門的な警告」というトーン。
   - 英語圏の「#TTC, #IVF」関連の最新ニュースを検索し、日本の読者に向けて医師視点で解説する。
   - 箇条書きを効果的に使い、構造的に分かりやすくする。
   - 信頼できる医療記事やニュースのURLを含める。
   - ハッシュタグ（#プレコンセプションケア #妊活 など）を含める。

2. "enXPostThread": 英語のX投稿テキスト（ツリー形式/スレッド形式、2〜4ツイート）。
   - 超ダイレクトかつ Fact-Based なトーン（Fact: ... のような表現）。
   - 日本発または世界の関連ニュース・研究を英語圏に向けて紹介する。
   - 1ツイート目（Hook）は特に強烈な箇条書きや結論で惹きつける。
   - 各ツイートの最後に #TTC #Infertility などのハッシュタグを自然に入れる。

---
CRITICAL: ONLY OUTPUT RAW VALID JSON. DO NOT INCLUDE MARKDOWN CODE BLOCKS. DO NOT INCLUDE ANY OTHER TEXT.
Expected JSON Schema:
{
  "jpXPost": "string containing the Japanese tweet with URL...",
  "enXPostThread": [
    "string for the 1st tweet in English thread...",
    "string for the 2nd tweet...",
    "string for the 3rd tweet..."
  ]
}
  `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                // Enable Google Search Grounding to let the model search the web for real links
                tools: [{ googleSearch: {} }],
            }
        });

        const resultText = response.text || '{}';
        const result = JSON.parse(resultText);

        const jpText = result.jpXPost || "";
        const enThread = result.enXPostThread || [];

        // Save to temporary files for later posting via a workflow or manually.
        // We'll save them to a common output directory.
        const outDir = path.join(process.cwd(), 'scripts', 'content-gen', 'out-daily-x');
        await fs.mkdir(outDir, { recursive: true });

        const jpFilePath = path.join(outDir, `${today}-jp.txt`);
        const enFilePath = path.join(outDir, `${today}-en-thread.json`);

        await fs.writeFile(jpFilePath, jpText);
        await fs.writeFile(enFilePath, JSON.stringify(enThread, null, 2));

        console.log(`✅ Generated JP X Post -> ${jpFilePath}`);
        console.log(`✅ Generated EN X Thread (${enThread.length} parts) -> ${enFilePath}`);
        
        console.log("\n--- JP Preview ---\n" + jpText);
        console.log("\n--- EN Thread Preview ---\n" + enThread.join('\n\n---\n\n'));

        console.log("\n🎉 Daily X Content generated successfully!");

    } catch (err: any) {
        console.error("❌ Error generating daily X content:");
        console.error(err);
        process.exit(1);
    }
}

main();
