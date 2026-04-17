import 'dotenv/config';
import { GoogleGenAI, Type } from '@google/genai';
import { existsSync } from 'fs';
import path from 'path';
import { getThemeSchedule, addQueueItem, updateThemeScheduleStatus } from '../../src/lib/sheets';

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
- 参考URL/PMID: ${item.referenceUrl}
- 情報のTier: ${item.evidenceTier || '不明（必要に応じて推測してください）'}
- 情報の限界(Limitations): ${item.limitations || '特になし'}

【ターゲット読者層】
将来の妊娠・出産、キャリアプランなどに漠然とした不安を抱える20代〜30代の女性（およびそのパートナー）。

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【医療的正確性・エビデンス・配慮に関する厳格なルール】
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. 【階層別エビデンスの明示（必須）】
   情報のTierが「マウス/細胞実験の段階（ティアC相当）」などヒトでのエビデンスが未確立である場合、必ずリード文の直後（冒頭）に太字で「**この記事で紹介する内容は、細胞・動物実験の段階であり、ヒトでの有効性が確立されたものではありません**」という旨の免責文を挿入すること。これを怠ることは重大な規約違反である。
2. 【参考文献の厳格化】
   記事の最後に出力する参考文献は、提供された主論文（PMIDやURL）のみを記載すること。「日本産科婦人科学会 (JSOG) ガイドライン」や「WHO」など、記事内容と直接関係のない権威ある組織名を安易に列挙する（偽りの権威付け）ことは絶対に禁止。
3. 【食事・サプリメント推奨の禁止（トーンダウン）】
   「〜を食べて妊活をサポートしましょう」等、食品やサプリが直接生殖能力を向上させるような論理的飛躍と断定は避けること。「一般的な健康維持に役立つ食品ですが、生殖機能への直接的効果は今後の研究課題です」という慎重なスタンスを維持すること。
4. 【中立性の徹底】
   過度な期待を抱かせる「新作用」「確実に改善する」「保証する」等の煽り表現や断定表現は絶対に禁止。
5. 【トリガーワーニング】妊娠成功の事例が含まれる場合は、必ずトリガーワーニング（TW: Pregnancy等）を明記すること。

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
     📖 **同じ著者による、妊活・プレコンセプションケアの基礎知識をまとめた書籍はこちら**
     [『20代で考える 将来妊娠で困らないための選択』（Amazon）](https://amzn.to/3NcOWBl)
   - "slug" キーには短い英語のスラッグを指定すること。

2. "enBlog": 日本語版と同内容の英語版MDXブログ記事。
   - フロントマターには英語で title, date, excerpt, author("Takuma Sato, MD")を含める。date は "${postDateStr}" を指定。
   - 記事の最後（CTA）には必ず **Amazon.comの書籍リンク** を以下のように挿入すること。
     📖 **Want to learn more? Check out the book.**
     [Dr. Sato's Guide to Women's Health (Amazon US)](https://amzn.to/47BuEbQ)

3. "noteBlog": Note.com用の日本語ブログ原稿（Markdown不要プレーンテキスト寄りのフォーマット）。

   【構成ルール】
   - MDX用のフロントマター不要。
   - タイトルに「新常識」「革命」等の煽り言葉は使わず、誠実な内容にする。
   - 基礎研究（ティアC）の場合は「まだ研究段階であること」をリード文で必ず伝える。
   - 参考文献は、その記事で扱った特定の論文のみを記載し、学会ガイドライン等の無関係な権威付けを避ける。
   - URLリンクは地の文でURLを直接記載。

   【CTA（必須）】
   記事の最後に以下を必ず挿入すること。
   📖 同じ著者による最新の記事はこちらから：
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
        const jpSanitized = sanitizeFrontmatter(result.jpBlog);
        const finalJpBlog = injectXPostFrontmatter(jpSanitized, safeXPost);
        
        const enSanitized = sanitizeFrontmatter(result.enBlog);
        const finalEnBlog = injectXPostFrontmatter(enSanitized, safeXPost);

        const nowStr = new Date().toISOString();
        const ts = nowStr.replace(/\D/g, '').substring(0, 14);
        const brandPrefix = brand ? `${brand}-` : 'book-';
        const evidenceStr = `Tier: ${item.evidenceTier || 'Unknown'} | Limitations: ${item.limitations || 'None'} | Source: ${item.referenceUrl}`;

        // 1. キューにブログ原案を登録
        await addQueueItem({
            content_id: `${brandPrefix}blog-${ts}`,
            brand: brand,
            type: 'blog',
            title: result.slug,
            generation_recipe: JSON.stringify({ slug: result.slug, jpBlog: finalJpBlog, enBlog: finalEnBlog, noteBlog: result.noteBlog }),
            status: 'pending',
            patrol_pre_result: 'pending',
            scheduled_date: postDateStr,
            ymyl_evidence: evidenceStr
        });
        console.log(`✅ Queued Blog -> ${result.slug}`);

        // 2. キューにX投稿原案を登録
        await addQueueItem({
            content_id: `${brandPrefix}x-${ts}`,
            brand: brand,
            type: 'x',
            title: `X Post for ${result.slug}`,
            generation_recipe: JSON.stringify({ slug: result.slug, xPost: safeXPost }),
            status: 'pending',
            patrol_pre_result: 'pending',
            scheduled_date: postDateStr,
            ymyl_evidence: evidenceStr
        });
        console.log(`✅ Queued X Post -> ${safeXPost.substring(0, 30)}...`);

        // 3. ThemeScheduleのステータスを更新
        await updateThemeScheduleStatus(item.rowNumber, 'generated');
        
        console.log("🎉 ThemeSchedule Blog Generation complete and queued successfully!");

    } catch (err: any) {
        console.error("❌ Error generating content from ThemeSchedule:");
        console.error(err);
        process.exit(1);
    }
}

main();
