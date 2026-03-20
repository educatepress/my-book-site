import 'dotenv/config';
import { GoogleGenAI } from '@google/genai';
import fs from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { getNextPendingItem, markItemStatus } from './queue-manager';
import { extractAndVerifySourceUrl } from './url-verifier';

// Configure Gemini API
if (!process.env.GEMINI_API_KEY) {
    console.error("❌ Error: GEMINI_API_KEY is missing in .env");
    process.exit(1);
}
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Helper to inject x_post into MDX frontmatter safely
function injectXPostFrontmatter(mdxText: string, xPostText: string): string {
    const safeXPost = xPostText.replace(/"/g, '\\"');
    if (mdxText.startsWith('---')) {
        const firstMdxBoundary = mdxText.indexOf('---', 3);
        if (firstMdxBoundary !== -1) {
            const frontmatter = mdxText.slice(0, firstMdxBoundary);
            const body = mdxText.slice(firstMdxBoundary);
            return `${frontmatter}x_post: "${safeXPost}"\n${body}`;
        }
    }
    return `---\nx_post: "${safeXPost}"\n---\n${mdxText}`;
}

async function main() {
    console.log("🚀 Starting Automatic Blog Generation from Queue...");

    const item = await getNextPendingItem("blog");
    if (!item) {
        console.log("🟢 The Queue is empty. No pending Blog posts to process today.");
        process.exit(0);
    }

    console.log(`\n📋 Processing Item [${item.id}]: ${item.theme}`);
    console.log(`🔗 Primary Source URLs:\n${item.sourceUrls.join('\n')}`);

    // Calculate the next publishing date
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

    const prompt = `
あなたは、生殖医療専門医（産婦人科医）である佐藤琢磨医師の専属AIコンテンツクリエイター兼、Webマーケティング/SEOの達人です。
あなたのタスクは、Deep Researchによって裏付けられた以下のテーマに関する「トレンド感のあるブログ記事」を作成することです。

【提供された発信テーマ情報（MUST）】
- 日本語テーマ: ${item.theme}
- 英語テーマ: ${item.themeEn}
- 記事の方向性/目的 (JP): ${item.direction}
- 記事の方向性/目的 (EN): ${item.directionEn}
- エビデンスとなるソースURL（2〜3件）: 
${item.sourceUrls.join('\n')}

【ターゲット読者層】
将来の妊娠・出産、キャリアプラン、などに漠然とした不安を抱える、20代〜30代の女性（およびそのパートナー）。

【執筆のトーン＆マナー】
- 信頼できる専門家として、冷静かつ論理的に、しかし読者の未来を心から応援する愛情深いトーン。
- 読者の悩みに寄り添い、「確かな知識によって人生の選択肢を広げる」ことを後押しするEmpowermentな文体。

【医療的正確性・エビデンス確認ルール（CRITICAL）】
1. 必ず、提供された【エビデンスとなるソースURL】の内容を読み込み（Google Search等を利用）、そのファクトに基づいて執筆してください。
2. クリニックのホームページや、医師個人の見解などからの借用は一切行わないこと。
3. 日英両方の記事の最後（FAQブロックの直前）に、必ず「参考（References）」という見出しを作成し、提供されたソースURL（可能ならリンク付きで）を出力すること。

記事の投稿日（フロントマター用）: ${postDateStr}

以下の3つのアセットをJSON形式で出力してください。

1. "jpBlog": 完全な日本語版のMDXブログ記事（2000文字程度）。
   - Markdownのフロントマター（title, date, excerpt, author）から始めること。YAMLエラーを防ぐためタイトルはダブルクォーテーションで囲む。
   - "date" の値には必ず「${postDateStr}」を指定すること。
   - ${item.direction} に沿った構成にすること。
   - 【AEO対策ルール】: 記事の最後に「よくある質問（FAQ）」を含めること。
   - 【内部リンクルール】: LPのトップページ（ \`/\` ）や関連テーマへのリンクを文脈に合わせて2箇所以上挿入。
   - 記事の最後には、書籍リンク（ https://amzn.to/3NcOWBl ）へ誘導するCTA（Call To Action）を含めること。
   - "slug" キーには、ファイル名として使える短い英語の文字列を指定すること。

2. "enBlog": 日本語版と同内容の、英語に翻訳・ローカライズされたMDXブログ記事。
   - 英語圏の読者にとって自然で響く表現（EmpowermentとEvidence-basedな選択を強調）にすること。
   - 英語のフロントマターを含め、"date" は「${postDateStr}」を指定すること。
   - ${item.directionEn} に沿った構成にすること。
   - 【AEO対策ルール】: FAQセクションを英語で設ける。
   - 記事の最後には必ず英語版書籍へのCTAを含めること: https://www.amazon.co.jp/Doctor%E2%80%99s-Guide-Womens-Health-Preconception/dp/B0F7XTWJ3X/ref=tmm_pap_swatch_0

3. "xPost": Blog投稿に紐づくX用の告知テキスト（100〜120文字程度）。
   - ブログ記事の内容から有益なTipsを1つ抽出。

---
CRITICAL: ONLY OUTPUT RAW VALID JSON. DO NOT INCLUDE MARKDOWN CODE BLOCKS.
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
                tools: [{ googleSearch: {} }],
            }
        });

        const resultText = response.text || '{}';
        const result = JSON.parse(resultText);

        const safeXPost = result.xPost ? result.xPost : "";

        // --- URL Verification Phase ---
        console.log("\n🔍 Verifying URLs in generated blog content...");
        
        let jpBlogContent: string = result.jpBlog || "";
        let enBlogContent: string = result.enBlog || "";

        try {
            console.log("\n  [Checking JP Blog]");
            jpBlogContent = await extractAndVerifySourceUrl(jpBlogContent);
        } catch (e: any) {
            console.warn(`  ⚠️ JP Blog URL issue: ${e.message}`);
            // Don't abort — save the blog but warn
        }

        try {
            console.log("\n  [Checking EN Blog]");
            enBlogContent = await extractAndVerifySourceUrl(enBlogContent);
        } catch (e: any) {
            console.warn(`  ⚠️ EN Blog URL issue: ${e.message}`);
        }

        // Save JP Blog MDX
        const jpBlogDir2 = path.join(process.cwd(), 'src/content/blog/jp');
        await fs.mkdir(jpBlogDir2, { recursive: true });
        const jpBlogPath = path.join(jpBlogDir2, `${result.slug}.mdx`);
        const finalJpBlog = injectXPostFrontmatter(jpBlogContent, safeXPost);
        await fs.writeFile(jpBlogPath, finalJpBlog);
        console.log(`✅ Saved JP Blog -> ${jpBlogPath}`);

        // Save EN Blog MDX
        const enBlogDir = path.join(process.cwd(), 'src/content/blog/en');
        await fs.mkdir(enBlogDir, { recursive: true });
        const enBlogPath = path.join(enBlogDir, `${result.slug}-en.mdx`);
        const finalEnBlog = injectXPostFrontmatter(enBlogContent, safeXPost);
        await fs.writeFile(enBlogPath, finalEnBlog);
        console.log(`✅ Saved EN Blog -> ${enBlogPath}`);

        console.log(`📝 Generated xPost Tip: ${safeXPost}`);
        
        // Mark the queue item as generated
        await markItemStatus(item.id, "generated");
        console.log("🎉 Queue Blog Generation complete!");

    } catch (err: any) {
        console.error("❌ Error generating content from queue:");
        console.error(err);
        process.exit(1);
    }
}

main();
