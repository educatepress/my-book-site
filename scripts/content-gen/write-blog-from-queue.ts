import 'dotenv/config';
import { GoogleGenAI } from '@google/genai';
import fs from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { getNextPendingItem, markItemStatus } from './queue-manager';
import { extractAndVerifySourceUrl } from './url-verifier';
import { enqueueBlog } from '../patrol/draft-to-queue';

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
あなたは、生殖医療専門医（産婦人科医）である佐藤琢磨医師の専属AIコンテンツクリエイターです。
医療情報サイトの編集基準として、「信頼性（E-E-A-T）」と「わかりやすさ」を最優先に記事を作成してください。

【提供された発信テーマ情報（MUST）】
- 日本語テーマ: ${item.theme}
- 英語テーマ: ${item.themeEn}
- 記事の方向性/目的 (JP): ${item.direction}
- 記事の方向性/目的 (EN): ${item.directionEn}
- エビデンスとなるソースURL（2〜3件）: 
${item.sourceUrls.join('\n')}

【ターゲット読者層】
将来の妊娠・出産、キャリアプランなどに漠然とした不安を抱える20代〜30代の女性（およびそのパートナー）。

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【医療コンテンツ品質ガイドライン（厳守）】
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. 事実と意見の分離（CRITICAL）
   - 医学的に確立された事実と、佐藤医師個人の臨床経験に基づく意見を明確に区別すること。
   - 事実: 「現在の標準治療では〜とされている」「〇〇の研究（発表年）によると〜」
   - 意見: 「診察室での経験から感じるのは〜」（臨床経験を語る場合のみ使用）

2. 断定の回避（Hedging）
   - 100%の保証ができない内容には必ず「〜の可能性がある」「〜が示唆されている」「個人差がある」を付ける。
   - NG例: 「科学的に証明されています」「必ず〜できます」
   - OK例: 「複数の研究で〜との報告があります」「一般的に〜とされています」

3. 患者主体から医療事象主体へ（主語の最適化）
   - 「あなた」を主語にするのは共感を示す場合のみ（記事全体で3回以内）。
   - 知識解説では「データでは」「臨床研究では」「生殖科学の観点から」などを主語にする。
   - 「私（筆者）」を主語にするのは個人の臨床経験を語る際のみ。
   - NG例: 「あなたは今すぐ〜すべきです」
   - OK例: 「臨床現場では〜が推奨されています」

4. 煽り表現の禁止
   - 「後悔する前に」「手遅れ」「医者が教えない秘密」などの恐怖喚起表現は使用禁止。
   - 「知っておくと選択肢が増える事実」というポジティブな文脈で情報を提供する。

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【Smart Brevity 2.0（厳守）】
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. 結論ファースト（煽らない）: 冒頭で医学的妥当性のある結論を提示。読者の誤解を解く切り口が有効。
2. 段落の短さ: 2〜3文ごとに改行。スマホ表示を最優先。壁のようなテキストは禁止。
3. 太字の活用: 最も重要な1文のみ太字。太字の乱用は禁止。
4. 箇条書き: 並列情報は必ずリスト形式。
5. 文字数: 日本語版は1800〜2200文字程度。

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【医療的正確性・エビデンス確認ルール（CRITICAL）】
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. 提供された【エビデンスとなるソースURL】を必ず読み込み、そのファクトに基づいて執筆すること。
2. クリニックのホームページや医師個人ブログからの内容は引用禁止。
3. 文中のエビデンスは「WHO（2023年）によると」「ASRM Practice Committee（2021年）では」のようにインラインで明記すること。

記事の投稿日（フロントマター用）: ${postDateStr}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【出力フォーマット（厳守）】
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

以下の3つのアセットをJSON形式で出力してください。

1. "jpBlog": 完全な日本語版のMDXブログ記事（1800〜2200文字）。
   - フロントマター（title, date, excerpt, author）から始めること。タイトルはダブルクォーテーションで囲む。
   - author は必ず「佐藤琢磨」と記載すること（肩書き・スペース・括弧は不要）。
   - "date" の値には必ず「${postDateStr}」を指定すること。
   - ${item.direction} に沿った構成にすること。
   - 記事の構成は必ず以下の順番とすること:
     ① リード文（結論ファースト）
     ② 本文（見出し付きセクション）
     ③ 参考（References）: Author/Journal/Year/URL形式で3件以上
     ④ よくある質問（FAQ）: 各回答は20文字以内の結論1文から始め、その後詳細を解説（AEO対策）
     ⑤ 書籍CTA（以下の定型文のみ使用、独自のセールス文は追加禁止）:
        📖 **この記事の内容をより深く知りたい方は書籍もご覧ください**
        [『20代で考える 将来妊娠で困らないための選択』の詳細・購入はこちら（Amazon）](https://amzn.to/3NcOWBl)
   - "slug" キーには短い英語のスラッグを指定すること。

2. "enBlog": 日本語版と同内容の英語版MDXブログ記事。
   - 英語圏の読者に自然な表現（Evidence-basedな選択を強調）。
   - author は必ず「Takuma Sato, MD」と記載すること。
   - "date" は「${postDateStr}」を指定すること。
   - ${item.directionEn} に沿った構成にすること。
   - 記事の構成は日本語版と同じ順番（References → FAQ → CTA）。
   - References は [Author. "Title." Journal, Year. PMID/DOI] 形式で3件以上。
   - FAQ の各回答はAIが引用しやすい簡潔かつ正確な表現で（AEO最適化）。
   - 書籍CTA: 📖 **Want to learn more? Check out the book.**
     [Dr. Sato's Guide to Women's Health (Amazon)](https://www.amazon.co.jp/Doctor%E2%80%99s-Guide-Womens-Health-Preconception/dp/B0F7XTWJ3X/ref=tmm_pap_swatch_0)

3. "xPost": Blog投稿に紐づくX用の告知テキスト（100〜120文字程度）。
   - 記事の内容から有益なファクトを1つ抽出。
   - 恐怖喚起の言葉（「後悔」「手遅れ」等）は使用禁止。
   - 「知っておくと選択肢が増える事実」というポジティブな文脈で書くこと。
   - 確定した事実は「〜です」、議論がある内容は「〜という報告もあります」と使い分けること。

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
                // Note: responseMimeType cannot be used with Google Search tools
                tools: [{ googleSearch: {} }],
            }
        });

        let resultText = response.text || '{}';
        // Strip markdown code block if present (handles various Gemini output formats)
        const codeBlockMatch = resultText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        if (codeBlockMatch) {
            resultText = codeBlockMatch[1].trim();
        }

        // Save raw response for debugging
        const debugPath = path.join(process.cwd(), 'scripts', 'content-gen', 'out-daily-x', `debug-blog-${Date.now()}.txt`);
        await fs.writeFile(debugPath, resultText);
        
        // Robust JSON parsing with multi-level repair
        let result: any;
        try {
            result = JSON.parse(resultText);
        } catch {
            console.log("⚠️ JSON直接パース失敗 — 修復を試行中...");
            try {
                // Strategy: find each field's value boundaries using key markers
                const slugMatch = resultText.match(/"slug"\s*:\s*"([^"]+)"/);
                const slug = slugMatch?.[1] || 'untitled-blog';
                
                // Extract multi-line fields by finding boundaries between keys
                const jpStart = resultText.indexOf('"jpBlog"');
                const enStart = resultText.indexOf('"enBlog"');
                const xStart = resultText.indexOf('"xPost"');
                
                function extractField(text: string, fieldStart: number, nextFieldStart: number): string {
                    if (fieldStart < 0) return '';
                    const colonPos = text.indexOf(':', fieldStart);
                    // Find the opening quote after the colon
                    const openQuote = text.indexOf('"', colonPos + 1);
                    // For the closing boundary, look backwards from the next field
                    let endPos: number;
                    if (nextFieldStart > 0) {
                        // Find last quote before the comma/newline preceding next field
                        endPos = text.lastIndexOf('"', nextFieldStart - 1);
                    } else {
                        // Last field - find last quote before closing brace
                        endPos = text.lastIndexOf('"', text.lastIndexOf('}'));
                    }
                    if (openQuote < 0 || endPos <= openQuote) return '';
                    return text.substring(openQuote + 1, endPos);
                }
                
                const jpBlog = extractField(resultText, jpStart, enStart);
                const enBlog = extractField(resultText, enStart, xStart);
                const xPost = extractField(resultText, xStart, -1);
                
                result = {
                    slug,
                    jpBlog: jpBlog.replace(/\\n/g, '\n').replace(/\\"/g, '"'),
                    enBlog: enBlog.replace(/\\n/g, '\n').replace(/\\"/g, '"'),
                    xPost: xPost.replace(/\\n/g, '\n').replace(/\\"/g, '"'),
                };
                
                if (!result.jpBlog) throw new Error('jpBlog field extraction failed');
                console.log("✅ フィールド境界抽出成功!");
            } catch (finalErr) {
                console.error("❌ JSON修復失敗。Raw response saved to:", debugPath);
                throw finalErr;
            }
        }

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

        // ── Slack承認キューに追加（承認が出るまで自動投稿しない） ──
        // 英語タイトルの日本語訳はAI生成物を流用（フロントマターから取得）
        const jpTitleMatch = finalJpBlog.match(/^title:\s*["']?(.+?)["']?$/m);
        const enTitleMatch = finalEnBlog.match(/^title:\s*["']?(.+?)["']?$/m);
        const jpTitle = jpTitleMatch?.[1] || item.theme;
        const enTitle = enTitleMatch?.[1] || item.themeEn;
        await enqueueBlog({
            theme: item.theme,
            slug: result.slug,
            jpTitle,
            jpExcerpt: (result.jpBlog || '').slice(0, 200),
            enTitle,
            enTitleJa: `（英語版）${enTitle}`, // 今後Claude APIで翻訳化可能
            postDate: postDateStr,
        });
        console.log('📬 Slack承認通知を送りました！');

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
