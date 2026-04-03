import 'dotenv/config';
import { GoogleGenAI, Type } from '@google/genai';
import fs from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { getThemeSchedule } from '../../src/lib/sheets';
import { enqueueBlog, enqueueXPost } from '../patrol/draft-to-queue';

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

// Safety: strip inner double-quotes from YAML frontmatter values to prevent build failures
function sanitizeFrontmatter(mdx: string): string {
    if (!mdx.startsWith('---')) return mdx;
    const endIdx = mdx.indexOf('---', 3);
    if (endIdx === -1) return mdx;

    const fm = mdx.slice(0, endIdx);
    const body = mdx.slice(endIdx);

    const fixedFm = fm.replace(/^((?:title|excerpt|x_post):\s*)"(.*)"\s*$/gm, (_match, prefix, value) => {
        const cleaned = value.replace(/"/g, "'");
        return `${prefix}"${cleaned}"`;
    });

    return fixedFm + body;
}

async function main() {
    console.log("🚀 Starting Automatic Blog Generation from ThemeSchedule...");

    // Determine target date (JST usually)
    const dt = new Date(new Date().getTime() + 9 * 3600 * 1000);
    const todayStr = process.env.TARGET_DATE || dt.toISOString().split('T')[0];
    const brand = process.env.BRAND || 'book';

    console.log(`📅 Target Date: ${todayStr} | Brand: ${brand}`);

    const item = await getThemeSchedule(todayStr, brand);
    if (!item) {
        console.log(`🟢 The ThemeSchedule has no data for Date: ${todayStr} / Brand: ${brand}.`);
        process.exit(0);
    }

    console.log(`\n📋 Processing Theme Area: [${item.themeArea}]`);
    console.log(`🌟 Theme: ${item.theme}`);
    console.log(`🔑 Keywords: ${item.searchKeywords}`);

    // Generate posting date string for frontmatter (usually today + 3 days in earlier logic, keeping default logic)
    const postDateObj = new Date(todayStr);
    postDateObj.setDate(postDateObj.getDate() + 3);
    const postDateStr = postDateObj.toISOString().split('T')[0];

    const prompt = `
あなたは、生殖医療専門医（産婦人科医）である佐藤琢磨医師の専属AIコンテンツクリエイターです。
医療情報サイトの編集基準として、「信頼性（E-E-A-T）」と「わかりやすさ」を最優先に記事を作成してください。

【提供された発信テーマ情報】
- 日本語テーマ: ${item.theme}
- SEOキーワード: ${item.searchKeywords}

【ターゲット読者層】
将来の妊娠・出産、キャリアプランなどに漠然とした不安を抱える20代〜30代の女性（およびそのパートナー）。

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【医療コンテンツ品質ガイドライン（厳守）】
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. 日本産科婦人科学会など、エビデンスレベルの高い情報源に基づき執筆すること。クリニック等の低いエビデンス源からの引用はしない。
2. 煽り表現・恐怖喚起表現は使用禁止。「知っておくと選択肢が増える事実」としてエンパワーメントなトーンで。

記事の投稿日（フロントマター用）: ${postDateStr}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【出力フォーマット（厳守）】
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

以下の4つのアセットをJSON形式で出力してください。

1. "jpBlog": 完全な日本語版のMDXブログ記事（1500〜2000文字程度）。
   - フロントマター（title, date, excerpt, author）から始めること。タイトルはダブルクォーテーションで囲む。
   - 【YAML安全ルール（CRITICAL）】フロントマターの title, excerpt の値の中にダブルクォーテーション（"）を絶対に含めないこと。強調したい語句には「」や『』を使用すること。これに違反するとビルドが壊れます。
   - author は必ず「佐藤琢磨」と記載。date は "${postDateStr}" を指定。
   - 記事の構成: リード文 → 本文（見出し付き） → FAQ。
   - 記事の最後（CTA）には必ず **Amazon.co.jpの書籍リンク** を以下のように挿入すること。
     📖 **効率的な妊活・不妊症予防・ライフプランについてより深く知りたい方は書籍もご覧ください**
     [『20代で考える 将来妊娠で困らないための選択』の詳細・購入はこちら（Amazon）](https://amzn.to/3NcOWBl)
   - "slug" キーには短い英語のスラッグを指定すること。

2. "enBlog": 日本語版と同内容の英語版MDXブログ記事。
   - フロントマターには英語で title, date, excerpt, author("Takuma Sato, MD")を含める。date は "${postDateStr}" を指定。
   - 記事の最後（CTA）には必ず **Amazon.comの書籍リンク** を以下のように挿入すること。
     📖 **Want to learn more? Check out the book.**
     [Dr. Sato's Guide to Women's Health (Amazon US)](https://amzn.to/47BuEbQ)

3. "noteBlog": Note.com用の日本語ブログ原稿（Markdown不要プレーンテキスト寄りのフォーマット）。
   - MDX用のフロントマターは不要です。一番上に大タイトルを配置し、すぐ本文を始めてください。
   - URLリンクはMarkdown (\`[テキスト](URL)\`) ではなく、地の文でURLを直接記載するか、テキストの後にURLをそのまま挿入するスタイルにしてください。
   - 記事の最後（CTA）には必ず **公式ブログ「ttcguide.co」へのリンク** を以下のように挿入すること。
     📖 効率的な妊活・不妊症予防・ライフプランについてより深く知りたい方は、
     以下の公式ブログのより詳しい最新記事一覧もぜひご覧ください。
     https://ttcguide.co

4. "xPost": Blog投稿に紐づくX用の告知テキスト（100〜120文字程度）。記事内容から有益なファクトを1つ抽出。

---
CRITICAL INSTRUCTION: You are a JSON-only API. You MUST output ONLY a raw JSON object. 
DO NOT output markdown code blocks like \`\`\`json or \`\`\`mdx.
Your entire response must start with '{' and end with '}' and be perfectly parseable by JSON.parse().
To successfully put text into the JSON strings, you MUST properly escape all newlines as \\n and double quotes as \\".

Expected JSON Schema:
{
  "slug": "url-friendly-english-slug",
  "jpBlog": "markdown formatted string...",
  "enBlog": "markdown formatted string...",
  "noteBlog": "formatted text string...",
  "xPost": "tip text for x post here..."
}
`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                maxOutputTokens: 8192,
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        slug: { type: Type.STRING },
                        jpBlog: { type: Type.STRING },
                        enBlog: { type: Type.STRING },
                        noteBlog: { type: Type.STRING },
                        xPost: { type: Type.STRING },
                    },
                    required: ["slug", "jpBlog", "enBlog", "noteBlog", "xPost"]
                }
            }
        });

        let resultText = response.text || '{}';
        // Strip markdown code block if present
        const codeBlockMatch = resultText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        if (codeBlockMatch) {
            resultText = codeBlockMatch[1].trim();
        }
        
        let result = JSON.parse(resultText);

        const safeXPost = result.xPost ? result.xPost : "";

        // URL Verification could be added here if needed

        // Save JP Blog MDX
        const jpBlogDir = path.join(process.cwd(), 'src/content/blog/jp');
        await fs.mkdir(jpBlogDir, { recursive: true });
        const jpBlogPath = path.join(jpBlogDir, `${result.slug}.mdx`);
        const jpSanitized = sanitizeFrontmatter(result.jpBlog);
        const finalJpBlog = injectXPostFrontmatter(jpSanitized, safeXPost);
        await fs.writeFile(jpBlogPath, finalJpBlog);
        console.log(`✅ Saved JP Blog -> ${jpBlogPath}`);

        // Save EN Blog MDX
        const enBlogDir = path.join(process.cwd(), 'src/content/blog/en');
        await fs.mkdir(enBlogDir, { recursive: true });
        const enBlogPath = path.join(enBlogDir, `${result.slug}-en.mdx`);
        const enSanitized = sanitizeFrontmatter(result.enBlog);
        const finalEnBlog = injectXPostFrontmatter(enSanitized, safeXPost);
        await fs.writeFile(enBlogPath, finalEnBlog);
        console.log(`✅ Saved EN Blog -> ${enBlogPath}`);

        // Save Note Article as .txt to ~/Desktop/note/
        // Expanding homedir manually
        const userHome = process.env.HOME || '/Users/satoutakuma';
        const noteDir = path.join(userHome, 'Desktop', 'note');
        await fs.mkdir(noteDir, { recursive: true });
        const notePath = path.join(noteDir, `${result.slug}.txt`);
        await fs.writeFile(notePath, result.noteBlog);
        console.log(`✅ Saved Note Article -> ${notePath}`);

        console.log(`📝 Generated xPost Tip: ${safeXPost}`);

        // Slack承認キューに追加
        const jpTitleMatch = finalJpBlog.match(/^title:\s*["']?(.+?)["']?$/m);
        const enTitleMatch = finalEnBlog.match(/^title:\s*["']?(.+?)["']?$/m);
        const jpTitle = jpTitleMatch?.[1] || item.theme;
        const enTitle = enTitleMatch?.[1] || item.theme;
        await enqueueBlog({
            theme: item.theme,
            slug: result.slug,
            jpTitle,
            jpExcerpt: (result.jpBlog || '').slice(0, 200),
            enTitle,
            enTitleJa: `（英語版）${enTitle}`,
            postDate: postDateStr,
        });

        console.log("🎉 ThemeSchedule Blog Generation complete!");

    } catch (err: any) {
        console.error("❌ Error generating content from ThemeSchedule:");
        console.error(err);
        process.exit(1);
    }
}

main();
