import 'dotenv/config';
import { GoogleGenAI, Type } from '@google/genai';
import fs from 'fs/promises';
import path from 'path';
import ExtractZip from 'extract-zip';
import * as cheerio from 'cheerio'; // Ensure we can parse HTML

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

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
    console.log("🚀 Starting Book Batch Generation Script...");

    const epubPath = path.resolve('./_legacy/book-japaniese-all.epub');
    const outDir = path.resolve('/tmp/epub-book-text');

    // Clear & Extract
    await fs.rm(outDir, { recursive: true, force: true }).catch(() => { });
    await fs.mkdir(outDir, { recursive: true });

    console.log("📦 Extracting EPUB...");
    await ExtractZip(epubPath, { dir: outDir });

    const textDir = path.join(outDir, 'OEBPS', 'text');
    const files = await fs.readdir(textDir);
    const xhtmlFiles = files.filter(f => f.endsWith('.xhtml')).sort();

    let fullText = "";
    for (const file of xhtmlFiles) {
        const content = await fs.readFile(path.join(textDir, file), 'utf8');
        // Simple regex or cheerio to strip HTML
        const cleanContent = content.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
        fullText += cleanContent + "\n";
    }

    console.log(`📖 Extracted book text length: ${fullText.length} characters.`);
    if (fullText.length > 300000) {
        console.log("⚠️ Text is very long, truncating to 300,000 chars for API limits (if necessary)...");
        fullText = fullText.slice(0, 300000);
    }

    const todayDateObj = new Date();

    console.log("🧠 Asking Gemini to extract 10 key topics from the book...");

    const factPrompt = `
You are an expert editor reading a book.
Extract 10 distinct and important "facts/topics" from the following book text.
These topics will be used to generate independent blog posts summarizing the book's knowledge.
Output a JSON array of 10 objects, each with strings "title", "summary", and a short url-friendly english "slug".

Focus on actionable advice, preconception care, and women's health.
Return ONLY raw valid JSON array.

Book Text:
${fullText}
    `;

    const factResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: factPrompt,
    });

    let factResultText = factResponse.text || '';
    if (factResultText.startsWith('\`\`\`json')) {
        factResultText = factResultText.replace(/^\`\`\`json\n/, '').replace(/\n\`\`\`$/, '');
    }
    const topics = JSON.parse(factResultText);
    console.log(`✅ Extracted ${topics.length} topics! Starting generation...`);

    // Helper to format date
    const formatDate = (date: Date) => date.toISOString().split('T')[0];

    for (let i = 0; i < topics.length; i++) {
        const topic = topics[i];

        // Calculate the future date: 3 days apart for each post
        // Example: post 0 is today + 3 days, post 1 is today + 6 days
        const futureDateObj = new Date(todayDateObj);
        futureDateObj.setDate(todayDateObj.getDate() + ((i + 1) * 3));
        const postDateStr = formatDate(futureDateObj);

        console.log(`\n⏳ Generating Post ${i + 1}/10 for Date: ${postDateStr} -> Theme: ${topic.title}`);

        const blogPrompt = `
あなたは、生殖医療専門医（産婦人科医）である佐藤琢磨医師の専属AIコンテンツクリエイター兼、Webマーケティング/SEOの達人です。
あなたのタスクは、以下の「書籍から抽出されたテーマ」に基づいたブログ記事を作成することです。

【テーマ】
タイトル案: ${topic.title}
要約: ${topic.summary}

【ターゲット読者層】
将来の妊娠・出産、キャリアプラン、晩婚化などに漠然とした不安を抱える、20代〜30代の女性（およびそのパートナー）。

【執筆のトーン＆マナー】
- 信頼できる専門家として、冷静かつ論理的に、しかし読者の未来を心から応援する愛情深いトーン。
- 専門用語を避け、一般読者にも理解しやすい平易な言葉遣い。
- 読者の悩みに寄り添い、「確かな知識によって人生の選択肢を広げる」ことを後押しするEmpowermentな文体。

記事の投稿日（フロントマター用）: ${postDateStr}

以下の2つのアセットをJSON形式で出力してください。

1. "jpBlog": 完全な日本語版のMDXブログ記事（2000文字程度）。
   - Markdownのフロントマター（title, date, excerpt, author）から始めること。YAMLエラーを防ぐためタイトルはダブルクォーテーションで囲む。
   - "date" の値には必ず「${postDateStr}」を指定すること。
   - 記事内には、このテーマに関する本質的な事実と解決策を盛り込むこと。
   - 記事の最後には、必ず以下の【書籍紹介CTA】のいずれか1つを挿入し、書籍リンク（ https://amzn.to/3NcOWBl ）へ誘導すること。
     [CTA案1] 漠然とした未来の不安は、確かな知識で一つずつ解消できます。専門医である著者が、あなたの人生の選択をサポートするために厳選した知恵の数々。あなたらしい理想のライフプランを描く第一歩を、ぜひこの一冊から始めてみませんか？
     [CTA案2] 「自分を知り、大切にする」――それは将来を見据えたライフプランのヒントであり、最高の自己投資となるでしょう。この本で、あなたの未来と大切な人々の健康を守るための知識を身につけてください。
     [CTA案3] 産婦人科医として多くの患者さんの未来と向き合ってきた著者が、あなたの“知りたい”に寄り添い、望む人生を自由に選択できる力を与えてくれます。さあ、あなたの未来を自信を持ってデザインするための伴走者を、ぜひ手にとってみてください。
   - "slug" キーには、ファイル名として使えるURLフレンドリーな短い英語の文字列（例: ${topic.slug}）を指定すること。

2. "enBlog": 日本語版と同内容の、英語に翻訳・ローカライズされたMDXブログ記事。
   - 英語圏の読者にとって自然で響く表現にすること。
   - 英語のフロントマターを含めること。"date" の値には「${postDateStr}」を指定すること。
   - 記事の最後には必ず以下のURLで英語版書籍へのCTAを含めること: https://amzn.to/4tRV6qk

---
CRITICAL: ONLY OUTPUT RAW VALID JSON. DO NOT INCLUDE MARKDOWN CODE BLOCKS. DO NOT INCLUDE ANY OTHER TEXT.
Expected JSON Schema:
{
  "slug": "url-friendly-slug",
  "jpBlog": "markdown formatted string...",
  "enBlog": "markdown formatted string..."
}
        `;

        try {
            const blogResponse = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: blogPrompt,
            });

            let blogResultText = blogResponse.text || '';
            if (blogResultText.startsWith('\`\`\`json')) {
                blogResultText = blogResultText.replace(/^\`\`\`json\n/, '').replace(/\n\`\`\`$/, '');
            }

            const blogResult = JSON.parse(blogResultText);

            // Save JP Blog
            const jpBlogDir = path.join(process.cwd(), 'src/content/blog/jp');
            await fs.mkdir(jpBlogDir, { recursive: true });
            const jpBlogPath = path.join(jpBlogDir, `${blogResult.slug}.mdx`);
            await fs.writeFile(jpBlogPath, sanitizeFrontmatter(blogResult.jpBlog));

            // Save EN Blog
            const enBlogDir = path.join(process.cwd(), 'src/content/blog/en');
            await fs.mkdir(enBlogDir, { recursive: true });
            const enBlogPath = path.join(enBlogDir, `${blogResult.slug}-en.mdx`);
            await fs.writeFile(enBlogPath, sanitizeFrontmatter(blogResult.enBlog));

            console.log(`✅ Saved: ${jpBlogPath}`);
        } catch (e) {
            console.error(`❌ Failed to generate post ${i + 1}:`, e);
        }
    }

    console.log("🎉 Book Batch Generation Completed!");
}

main().catch(console.error);
