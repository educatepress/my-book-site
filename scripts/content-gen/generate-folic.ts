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

async function getNextReelsTheme(): Promise<string> {
    const calendarPath = '/Users/satoutakuma/Library/CloudStorage/GoogleDrive-gana.pati1201@gmail.com/マイドライブ/Instagram_Auto_Post/Reels_Content_Calendar.md';
    try {
        if (!existsSync(calendarPath)) {
             console.warn(`⚠️ Warning: Reels calendar not found at ${calendarPath}. Using default themes.`);
             return "プレコンセプションケア、不妊予防、ライフプランニングについて";
        }
        const content = await fs.readFile(calendarPath, 'utf8');
        const lines = content.split('\n');
        
        let foundUnchecked = false;
        let themeText = "";
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            // Look for the first unchecked item like "- [ ] **2. 2026/03/14..."
            if (line.match(/^- \[\s\]/)) {
                foundUnchecked = true;
                // Grab the next few lines for context
                for (let j = i + 1; j < i + 4; j++) {
                    if (lines[j] && (lines[j].includes('**テーマ**:') || lines[j].includes('**狙い**:'))) {
                        themeText += lines[j].trim() + "\n";
                    } else if (lines[j] && lines[j].match(/^- \[/)) {
                        break; // hit next item
                    }
                }
                break;
            }
        }
        
        if (foundUnchecked && themeText) {
             console.log("✅ Synced with Reels Calendar Theme:\n" + themeText);
             return themeText;
        } else {
             console.log("⚠️ No unchecked themes found in Reels calendar. Using default theme.");
             return "プレコンセプションケア、不妊予防、ライフプランニングについて";
        }
        
    } catch (e) {
        console.error("❌ Error reading Reels calendar:", e);
        return "プレコンセプションケア、不妊予防、ライフプランニングについて";
    }
}

// Helper to inject x_post into MDX frontmatter safely
function injectXPostFrontmatter(mdxText: string, xPostText: string): string {
    // Escape quotes in x_post
    const safeXPost = xPostText.replace(/"/g, '\\"');
    
    if (mdxText.startsWith('---')) {
        // Find the matching end of the frontmatter wrapper
        const firstMdxBoundary = mdxText.indexOf('---', 3);
        if (firstMdxBoundary !== -1) {
            const frontmatter = mdxText.slice(0, firstMdxBoundary);
            const body = mdxText.slice(firstMdxBoundary);
            return `${frontmatter}x_post: "${safeXPost}"\n${body}`;
        }
    }
    // Fallback if no clean frontmatter is found, just prepend one
    return `---\nx_post: "${safeXPost}"\n---\n${mdxText}`;
}

async function main() {
    console.log("🚀 Starting Automatic Blog Generation with Gemini AI...");

    // 0. Sync Theme with Reels Calendar
    const synchronizedTheme = "葉酸の大切さと摂取タイミング〜プレコンセプションケアにおける最重要栄養素〜";

    // 1. Calculate the next publishing date
    const postDateStr = "2026-03-20"; // Same as before or update to today's date if needed. Let's use 2026-03-20.

    console.log(`📅 Target Post Date calculated as: ${postDateStr}`);

    const prompt = `
あなたは、生殖医療専門医（産婦人科医）である佐藤琢磨医師の専属AIコンテンツクリエイター兼、Webマーケティング/SEOの達人です。
あなたのタスクは、以下のテーマに関する「トレンド感のあるブログ記事と、X用のTips」を最初から作成し直すことです。

【指定テーマ】
${synchronizedTheme}
※このテーマと狙いに完全に沿った形で、ブログ記事を構成してください。

【ターゲット読者層】
将来の妊娠・出産に不安を抱える20代〜30代の女性（およびそのパートナー）。

【執筆のトーン＆マナー】
- 信頼できる専門家として、冷静かつ論理的に、しかし読者の未来を心から応援する愛情深いトーン。
- 専門用語を避け、一般読者にも理解しやすい平易な言葉遣い。

【医療的正確性・エビデンス（CRITICAL）】
1. 必ず、エビデンスレベルの高い英語文献や、WHO・CDC・厚労省・日本産科婦人科学会などの公的情報を情報源として使用すること。
2. 記事の最後に必ず「参考（References）」という見出しを作成し、参考にした英語文献や公的ガイドラインの名称を出力すること。

【⚠️超重要事項：書籍タイトルの正確な記述】
記事の最後で必ず以下の書籍を紹介してください。以前の生成でタイトルを間違える事故がありました。絶対に以下のタイトルとURLを一字一句間違えずに使用してください。
- 日本語版書籍名：『20代で考える 将来妊娠で困らないための選択』
- 日本語版URL：https://amzn.to/3NcOWBl
- 英語版書籍名（EN版で使用）：『A Doctor's Guide to Women's Health & Preconception』
- 英語版URL：https://www.amazon.co.jp/Doctor%E2%80%99s-Guide-Womens-Health-Preconception/dp/B0F7XTWJ3X/ref=tmm_pap_swatch_0

記事の投稿日（フロントマター用）: 2026-03-20

以下の3つのアセットをJSON形式で出力してください。

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
   - 【SEO・内部リンクの必須ルール】: LPのトップページ（ \`/en\` ）へのテキストリンク（例: \`[Learnって more about our clinic](/en)\` ）を文脈に合わせて自然に組み込むこと。
   - 【AEO対策ルール】: 記事の最後に「FAQ」セクションを設け、英語で1〜2つのQ&Aを含めること。
   - 記事の最後には必ず以下のURLで英語版書籍へのCTAを含めること: https://www.amazon.co.jp/Doctor%E2%80%99s-Guide-Womens-Health-Preconception/dp/B0F7XTWJ3X/ref=tmm_pap_swatch_0

3. "xPost": X（旧Twitter）用の投稿文テキスト（100〜120文字程度）。
   - ブログ記事の内容から、読者が「なるほど！」と思えるような有益なTipsや学びを1つ抽出して文章化したもの。
   - 単なる「ブログ更新しました」という宣伝ではなく、これ自体が独立して価値のある発信になるようにしてください。
   - ハッシュタグ（#プレコンセプションケア など）は含めないでください（後でスクリプト側で付与します）。
   - 「詳しくはこちら👇」などのリンク誘導文は含めないでください（後でスクリプト側で付与します）。

---
CRITICAL: ONLY OUTPUT RAW VALID JSON. DO NOT INCLUDE MARKDOWN CODE BLOCKS. DO NOT INCLUDE ANY OTHER TEXT.
Expected JSON Schema:
{
  "slug": "url-friendly-english-slug",
  "jpBlog": "markdown formatted string...",
  "enBlog": "markdown formatted string...",
  "xPost": "tip text for x post here..."
}
  `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
            }
        });

        const rawText = response.text || '{}';
        
        // Robust JSON parsing: Gemini sometimes returns invalid JSON
        let result: any;
        try {
            result = JSON.parse(rawText);
        } catch (e1) {
            console.warn("⚠️ Initial JSON parse failed, attempting cleanup...");
            // Remove markdown code block markers if present
            let cleaned = rawText.replace(/^```json?\s*\n?/i, '').replace(/\n?```\s*$/i, '').trim();
            // Fix unescaped newlines inside string values
            cleaned = cleaned.replace(/(?<=": ")([\s\S]*?)(?="[,}])/g, (match) => {
                return match.replace(/\n/g, '\\n').replace(/\r/g, '\\r');
            });
            try {
                result = JSON.parse(cleaned);
            } catch (e2) {
                console.error("❌ JSON cleanup also failed. Raw response (first 500 chars):");
                console.error(rawText.substring(0, 500));
                throw e2;
            }
        }

        const safeXPost = result.xPost ? result.xPost : "";
        let rawJpBlog = result.jpBlog || "";
        let rawEnBlog = result.enBlog || "";

        // Remove markdown formatting wrappers if Gemini accidentally includes them
        rawJpBlog = rawJpBlog.replace(/^```(md|markdown)?\s*\n/i, '').replace(/\n```\s*$/i, '').trim();
        rawEnBlog = rawEnBlog.replace(/^```(md|markdown)?\s*\n/i, '').replace(/\n```\s*$/i, '').trim();

        // 🚨 Remove bold markdown (**) as per user request to avoid literal rendering issues
        rawJpBlog = rawJpBlog.replace(/\*\*/g, '');
        rawEnBlog = rawEnBlog.replace(/\*\*/g, '');

        // 1. Save JP Blog MDX
        const jpBlogDir = path.join(process.cwd(), 'src/content/blog/jp');
        await fs.mkdir(jpBlogDir, { recursive: true });
        const jpBlogPath = path.join(jpBlogDir, `${result.slug}.mdx`);
        // Inject xPost into frontmatter
        const finalJpBlog = injectXPostFrontmatter(rawJpBlog, safeXPost);
        await fs.writeFile(jpBlogPath, finalJpBlog);
        console.log(`✅ Saved JP Blog -> ${jpBlogPath}`);

        // 2. Save EN Blog MDX
        const enBlogDir = path.join(process.cwd(), 'src/content/blog/en');
        await fs.mkdir(enBlogDir, { recursive: true });
        const enBlogPath = path.join(enBlogDir, `${result.slug}-en.mdx`);
        // We only inject to JP, but let's make sure EN is clean
        const finalEnBlog = rawEnBlog;
        await fs.writeFile(enBlogPath, finalEnBlog);
        console.log(`✅ Saved EN Blog -> ${enBlogPath}`);

        console.log(`📝 Generated xPost Tip: ${safeXPost}`);
        console.log("🎉 Automated content generated successfully!");

    } catch (err: any) {
        console.error("❌ Error generating content:");
        console.error(err);
        process.exit(1);
    }
}

main();
