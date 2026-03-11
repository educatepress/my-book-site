import 'dotenv/config';
import { GoogleGenAI } from '@google/genai';
import fs from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

// Configure Gemini API
if (!process.env.GEMINI_API_KEY) {
    console.error("❌ Error: GEMINI_API_KEY is missing in .env");
    process.exit(1);
}
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function main() {
    console.log("🚀 Starting Automatic Blog Generation with Gemini AI...");

    // 1. Calculate the next publishing date
    const jpBlogDir = path.join(process.cwd(), 'src/content/blog/jp');
    let maxDateStr = new Date().toISOString().split('T')[0];

    if (existsSync(jpBlogDir)) {
        const files = await fs.readdir(jpBlogDir);
        for (const file of files) {
            if (file.endsWith('.mdx')) {
                const content = await fs.readFile(path.join(jpBlogDir, file), 'utf8');
                const dateMatch = content.match(/^date:\s*['"]?(\d{4}-\d{2}-\d{2})/m);
                if (dateMatch) {
                    const fileDate = dateMatch[1];
                    if (fileDate > maxDateStr) {
                        maxDateStr = fileDate;
                    }
                }
            }
        }
    }

    const maxDateObj = new Date(maxDateStr);
    // Add 3 days to the latest date found (or today)
    maxDateObj.setDate(maxDateObj.getDate() + 3);
    const postDateStr = maxDateObj.toISOString().split('T')[0];

    console.log(`📅 Target Post Date calculated as: ${postDateStr}`);
    const today = new Date().toISOString().split('T')[0];

    const prompt = `
あなたは、生殖医療専門医（産婦人科医）である佐藤琢磨医師の専属AIコンテンツクリエイター兼、Webマーケティング/SEOの達人です。
あなたのタスクは、以下のテーマのいずれかに関する「トレンド感のあるブログ記事」を自動で考案し、作成することです。

【テーマ候補】
- Google Analytics 4 (GA4) / Webマーケティング
- AEO (アンサーエンジン最適化) / 最新のSEOトレンド
- プレコンセプションケア / 生殖医療

【ターゲット読者層】
将来の妊娠・出産、キャリアプラン、晩婚化などに漠然とした不安を抱える、20代〜30代の女性（およびそのパートナー）。

【執筆のトーン＆マナー】
- 信頼できる専門家として、冷静かつ論理的に、しかし読者の未来を心から応援する愛情深いトーン。
- 専門用語を避け、一般読者にも理解しやすい平易な言葉遣い。
- 読者の悩みに寄り添い、「確かな知識によって人生の選択肢を広げる」ことを後押しするEmpowermentな文体。

【医療的正確性・エビデンスに関する厳格なルール（CRITICAL）】
1. 必ず、エビデンスレベルの高い英語文献や、WHO・CDC・厚労省・日本産科婦人科学会などの公的機関の情報・ガイドラインを情報源（根拠）として使用すること。
2. クリニックのホームページや、医師個人の見解など、エビデンスレベルの低い情報源からの引用や参考は一切行わないこと。
3. 日英両方の記事の最後（FAQブロックの直前）に、必ず「参考（References）」という見出しを作成し、参考にした英語文献や公的ガイドラインの名称（可能ならURLも箇条書きで）を出力すること。

記事の投稿日（フロントマター用）: ${postDateStr}

以下の2つのアセットをJSON形式で出力してください。

1. "jpBlog": 完全な日本語版のMDXブログ記事（2000文字程度）。
   - Markdownのフロントマター（title, date, excerpt, author）から始めること。YAMLエラーを防ぐためタイトルはダブルクォーテーションで囲む。
   - "date" の値には必ず「${postDateStr}」を指定すること。
   - 見出し（H2, H3）、箇条書きリスト、重要なポイントの太字装飾を適切に使用すること。
   - 【SEO・内部リンクの必須ルール】: LPのトップページ（ \`/\` ）や、「葉酸の大切さについて」など関連する可能性のあるテーマへのテキストリンク（例: \`[当院の詳細・ご相談はこちら](/)\` ）を、**文脈に合わせて自然に2箇所以上**必ず挿入すること。
   - 【AEO対策ルール】: 記事の最後に「よくある質問（FAQ）」として、このテーマに関して読者が抱きやすいQ&A（QとAのセット）を1〜2つ必ず含めること。
   - 記事の最後には、必ず以下の【書籍紹介CTA】のいずれか1つを自然な流れで挿入し、書籍リンク（ https://amzn.to/3NcOWBl ）へ誘導すること。
     [CTA案1] 漠然とした未来の不安は、確かな知識で一つずつ解消できます。専門医である著者が、あなたの人生の選択をサポートするために厳選した知恵の数々。あなたらしい理想のライフプランを描く第一歩を、ぜひこの一冊から始めてみませんか？
     [CTA案2] 「自分を知り、大切にする」――それは将来を見据えたライフプランのヒントであり、最高の自己投資となるでしょう。この本で、あなたの未来と大切な人々の健康を守るための知識を身につけてください。
     [CTA案3] 産婦人科医として多くの患者さんの未来と向き合ってきた著者が、あなたの“知りたい”に寄り添い、望む人生を自由に選択できる力を与えてくれます。さあ、あなたの未来を自信を持ってデザインするための伴走者を、ぜひ手にとってみてください。
   - "slug" キーには、ファイル名として使えるURLフレンドリーな短い英語の文字列を指定すること。

2. "enBlog": 日本語版と同内容の、英語に翻訳・ローカライズされたMDXブログ記事。
   - 英語圏の読者にとって自然で響く表現（EmpowermentとEvidence-basedな選択を強調するトーン）にすること。
   - 英語のフロントマターを含めること。"date" の値には必ず「${postDateStr}」を指定すること。
   - 【SEO・内部リンクの必須ルール】: LPのトップページ（ \`/en\` ）へのテキストリンク（例: \`[Learn more about our clinic](/en)\` ）を文脈に合わせて自然に組み込むこと。
   - 【AEO対策ルール】: 記事の最後に「FAQ」セクションを設け、英語で1〜2つのQ&Aを含めること。
   - 記事の最後には必ず以下のURLで英語版書籍へのCTAを含めること: https://www.amazon.co.jp/Doctor%E2%80%99s-Guide-Womens-Health-Preconception/dp/B0F7XTWJ3X/ref=tmm_pap_swatch_0



---
CRITICAL: ONLY OUTPUT RAW VALID JSON. DO NOT INCLUDE MARKDOWN CODE BLOCKS. DO NOT INCLUDE ANY OTHER TEXT.
Expected JSON Schema:
{
  "slug": "url-friendly-english-slug",
  "jpBlog": "markdown formatted string...",
  "enBlog": "markdown formatted string..."
}
  `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        let resultText = response.text || '';
        if (resultText.startsWith('\`\`\`json')) {
            resultText = resultText.replace(/^\`\`\`json\n/, '').replace(/\n\`\`\`$/, '');
        }

        const result = JSON.parse(resultText);

        // 1. Save JP Blog MDX
        const jpBlogDir = path.join(process.cwd(), 'src/content/blog/jp');
        await fs.mkdir(jpBlogDir, { recursive: true });
        const jpBlogPath = path.join(jpBlogDir, `${result.slug}.mdx`);
        await fs.writeFile(jpBlogPath, result.jpBlog);
        console.log(`✅ Saved JP Blog -> ${jpBlogPath}`);

        // 2. Save EN Blog MDX
        const enBlogDir = path.join(process.cwd(), 'src/content/blog/en');
        await fs.mkdir(enBlogDir, { recursive: true });
        const enBlogPath = path.join(enBlogDir, `${result.slug}-en.mdx`);
        await fs.writeFile(enBlogPath, result.enBlog);
        console.log(`✅ Saved EN Blog -> ${enBlogPath}`);

        console.log("🎉 Automated content generated successfully!");

    } catch (err: any) {
        console.error("❌ Error generating content:");
        console.error(err);
        process.exit(1);
    }
}

main();
