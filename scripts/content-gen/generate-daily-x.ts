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
あなたは、生殖医療専門医（産婦人科医）である佐藤琢磨医師の専属AIコンテンツクリエイター兼、Webマーケティング/SEOの達人です。
本日の日付は: ${today} です。

あなたのタスクは、自身の専門知識と**最新の検索（Google Search）**から得た情報をもとに、ブログ投稿がない日用の「X（旧Twitter）へのデイリー投稿」を2言語（日本語・英語）で作成することです。

---

生成するアセット（JSON形式）:

1. "jpXPost": 日本語のX投稿テキスト（140文字推奨、最大でも200文字程度まで）。
   - 【重要】米国や英国など**英語圏**で検索上位に入るような「#TTC, #TryingToConceive, #IVF, #Infertility」に関連する最新ニュースやトレンドテーマを自動で検索・考察してください。
   - その海外の最新知見を元に、日本の読者に向けて医師（佐藤琢磨医師）の視点で、医学的に正確（エビデンスベース）かつ共感的な短い文章を日本語で作成してください。
   - 引用した海外のニュースや信頼できる医療記事のURL（リンク）を必ず含めてください。
   - ハッシュタグとして #プレコンセプションケア #妊活 などを1〜2個含めてください。

2. "enXPostThread": 英語のX投稿テキスト（ツリー形式/スレッド形式）。
   - 【重要】基本的には英語圏のトレンドニュース（#TTC等）を検索して作成しますが、**たまには日本発の関連ニュースや研究記事**を検索し、それを英語圏の読者に向けて紹介する内容にしてください。
   - 配列（Array）の形式で、複数のツイート文字列を含めてください（2〜4ツイート程度）。
   - 最初のツイート（Hook）で関心を惹きつけ、続くツイートで医学的な解説と共感を示し、最後に信頼できるニュースや研究論文のURLを引用してください。
   - 英語圏の患者コミュニティで頻繁に使用されるハッシュタグ（#TTC, #TryingToConceive, #IVF, #Infertility, #EggFreezing など）を必ず各ツイートまたはスレッドの最後に自然に含めてください。
   - 文章は Empowerment で Evidence-based なトーンにしてください。

---
CRITICAL: ONLY OUTPUT RAW VALID JSON. DO NOT INCLUDE MARKDOWN CODE BLOCKS. DO NOT INCLUDE ANY OTHER TEXT.
Expected JSON Schema:
{
  "jpXPost": "string containing the Japanese tweet with URL...",
  "enXPostThread": [
    "string for the 1st tweet in English thread...",
    "string for the 2nd tweet...",
    "string for the 3rd tweet with URL and #TTC..."
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
