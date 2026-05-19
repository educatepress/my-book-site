import 'dotenv/config';
import { GoogleGenAI, Type } from '@google/genai';
import fs from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { getNextPendingItem, markItemStatus } from './queue-manager';
import { extractAndVerifySourceUrl } from './url-verifier';
import { enqueueBlog } from '../patrol/draft-to-queue';
import { generateInfographic, type InfographicData } from '../generate-infographic';
import { researchTheme, formatReferencesForPrompt, type VerifiedReference } from './lib/pubmed-research';
import { verifyBlogReferences, removeReferencesSection, checkContentAlignment, checkCitationRelevance } from './lib/verify-references';

// Configure Gemini API
if (!process.env.GEMINI_API_KEY) {
    console.error("❌ Error: GEMINI_API_KEY is missing in .env");
    process.exit(1);
}
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Retry helper for transient Gemini failures (503 overload, 429 quota, network blips).
// Infrastructure only — does not alter prompts or model parameters.
async function generateWithRetry<T>(fn: () => Promise<T>, maxAttempts = 5): Promise<T> {
    let lastErr: any;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            return await fn();
        } catch (err: any) {
            lastErr = err;
            const status = err?.status ?? err?.code;
            const retriable = status === 503 || status === 429 || status === 500 || status === 'UNAVAILABLE';
            if (!retriable || attempt === maxAttempts) throw err;
            const backoffMs = Math.min(60000, 2000 * Math.pow(2, attempt - 1)) + Math.floor(Math.random() * 1000);
            console.warn(`  ⏳ Gemini ${status} (attempt ${attempt}/${maxAttempts}) — retry in ${(backoffMs / 1000).toFixed(1)}s`);
            await new Promise((r) => setTimeout(r, backoffMs));
        }
    }
    throw lastErr;
}

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

// Safety: strip inner double-quotes from YAML frontmatter values to prevent MDX build failures.
// Post-processing only — does not alter the generation prompt.
function sanitizeFrontmatter(mdx: string): string {
    if (!mdx.startsWith('---')) return mdx;
    const endIdx = mdx.indexOf('---', 3);
    if (endIdx === -1) return mdx;

    const fm = mdx.slice(0, endIdx);
    const body = mdx.slice(endIdx);

    const fixedFm = fm.replace(/^((?:title|excerpt|x_post):\s*)"(.*)"\s*$/gm, (_m, prefix, value) => {
        const cleaned = value.replace(/"/g, "'");
        return `${prefix}"${cleaned}"`;
    });

    return fixedFm + body;
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

    // ── Agent 1: PubMed Research ──
    console.log('\n🔬 Agent 1: PubMedで論文を検索中...');
    let references: VerifiedReference[] = [];
    try {
        references = await researchTheme(item.themeEn, item.sourceUrls, 3, item.searchKeywords);
        console.log(`  📚 ${references.length}件の検証済み論文を取得`);
        for (const r of references) {
            console.log(`    PMID:${r.pmid} | ${r.firstAuthor} | ${r.journal} ${r.year}`);
        }
    } catch (err) {
        console.warn(`  ⚠️ PubMed検索失敗（Referencesなしで続行）:`, err);
    }
    const referencesBlock = formatReferencesForPrompt(references);

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

5. 誇大表現・断定表現の禁止（薬機法・景表法・YMYL対応）
   以下のワードは日本語記事・英語記事ともに使用禁止:
   【日本語禁止ワード】絶対, 必ず, 確実に, 劇的に, 奇跡, 画期的, 革命的, 驚異的, 治る, 完治, 根治, 100%, 飛躍的に, 究極の, 最強の, 万能
   【英語禁止ワード】guarantee, cure, miracle, dramatic, revolutionary, definitely, certainly, proven to, 100%, ultimate, magic, game-changer, breakthrough
   - 代替表現: 「〜の可能性が示唆されている」「〜に寄与する可能性がある」「〜をサポートする」
   - 英語: "may help", "research suggests", "has been associated with", "appears to support"

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
3. 文中のエビデンスは以下の【PubMed検証済み論文リスト】の情報のみを使用し、インラインで引用すること。
   自分でPMIDや論文情報を生成・推測することは絶対に禁止。提供された論文以外の文献を追加しないこと。
4. 本文中で学会・ガイドライン・組織の推奨に言及する場合のルール（CRITICAL）:
   - 「WHOは〜を推奨している」「ASRMのガイドラインでは〜」「ACOGによると〜」等の記述は、
     【PubMed検証済み論文リスト】にその学会の文献が含まれている場合のみ許可する。
   - 論文リストに含まれていない学会・組織の推奨を本文中に記載することは絶対に禁止。
   - 「一般的に〜とされている」「臨床現場では〜が推奨される傾向がある」等の非特定引用に言い換えること。
   - これはハルシネーション防止のための最重要ルールである。

【PubMed検証済み論文リスト（この論文のみ引用可能）】
${referencesBlock}

記事の投稿日（フロントマター用）: ${postDateStr}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【出力フォーマット（厳守）】
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

以下の3つのアセットをJSON形式で出力してください。

1. "jpBlog": 完全な日本語版のMDXブログ記事（1800〜2200文字）。
   - フロントマター（title, date, excerpt, author, category）から始めること。タイトルはダブルクォーテーションで囲む。
   - "category" には必ず以下の5つの中から最も適切なものを1つ選び、そのまま指定すること:
     ['プレコンセプションケア', '女性の健康', '男性不妊・ケア', '不妊治療・生殖医療', 'ニュース・制度・助成金']
   - author は必ず「佐藤琢磨」と記載すること（肩書き・スペース・括弧は不要）。
   - "date" の値には必ず「${postDateStr}」を指定すること。
   - ${item.direction} に沿った構成にすること。
   - 記事の構成は必ず以下の順番とすること:
     ① リード文（結論ファースト）
     ② 本文（見出し付きセクション）
     ③ 参考（References）: 上記【PubMed検証済み論文リスト】の情報をそのまま転記すること。
        形式: Author, et al. Title. Journal. Year. [PMID: XXXXX](https://pubmed.ncbi.nlm.nih.gov/XXXXX/)
        ※ 論文リストが空の場合、Referencesセクションは省略すること
     ④ よくある質問（FAQ）: 各回答は20文字以内の結論1文から始め、その後詳細を解説（AEO対策）
     ⑤ 書籍CTA（以下の定型文のみ使用、独自のセールス文は追加禁止）:
        📖 **同じ著者による、妊活・プレコンセプションケアの基礎知識をまとめた書籍はこちら**
        [『20代で考える 将来妊娠で困らないための選択』（Amazon）](https://amazon.co.jp/dp/B0F7XTWJ3X?tag=ttcguide-blog-22)
   - "slug" キーには短い英語のスラッグを指定すること。

2. "enBlog": 日本語版と同内容の英語版MDXブログ記事。
   - 英語圏の読者に自然な表現（Evidence-basedな選択を強調）。
   - 抽出した同じ "category"（**日本語のまま**）をフロントマターに必ず追加すること。
   - author は必ず「Takuma Sato, MD」と記載すること。
   - "date" は「${postDateStr}」を指定すること。
   - ${item.directionEn} に沿った構成にすること。
   - 記事の構成は日本語版と同じ順番（References → FAQ → CTA）。
   - References は【PubMed検証済み論文リスト】の情報をそのまま転記。形式: Author. "Title." Journal, Year. [PMID: XXXXX](URL)。論文リストが空の場合は省略。
   - FAQ の各回答はAIが引用しやすい簡潔かつ正確な表現で（AEO最適化）。
   - 書籍CTA: 📖 **Want to learn more? Check out the book.**
     [Dr. Sato's Guide to Women's Health (Amazon)](https://amazon.com/dp/B0F7XTWJ3X?tag=ttcguide-enblog-22)

3. "xPost": Blog投稿に紐づくX用の告知テキスト（100〜120文字程度）。
   - 記事の内容から有益なファクトを1つ抽出。
   - 恐怖喚起の言葉（「後悔」「手遅れ」等）は使用禁止。
   - 「知っておくと選択肢が増える事実」というポジティブな文脈で書くこと。
   - 確定した事実は「〜です」、議論がある内容は「〜という報告もあります」と使い分けること。

4. "infographic": 【PubMed検証済み論文リスト】から最も重要なアウトカムを1つ選び、グラフ化するためのデータ。
   ビジュアルチャートはブログの説得力を大幅に向上させるため、可能な限り生成すること。

   【インフォグラフィック生成ルール】
   - "type" フィールドを必ず指定すること。許可値: "comparison"（2群比較）/ "single_value"（単一指標）/ "list"（リスト形式）。デフォルトは "comparison"。
   - group1Value / group2Value は【PubMed検証済み論文リスト】の論文に記載されたデータのみ使用すること。数値を推測・捏造することは絶対に禁止。
   - source フィールドには、データの出典となる論文の「著者名, 雑誌名, 年. PMID: XXXXX」を記載すること。【PubMed検証済み論文リスト】の情報をそのまま使うこと。
   - 情報のTierがC（動物実験/細胞実験）の場合、タイトルに必ず「（基礎研究）」「(Lab Study)」を付記すること。
   - 論文に数値データが明記されていない場合のみ infographic を null にすること。それ以外では積極的に生成すること。

   必ず以下のJSON構造で出力すること:
   {
     "type": "comparison",
     "title": "（日本語）グラフのタイトル",
     "titleEn": "（英語）グラフのタイトル",
     "group1Label": "（日本語）介入群ラベル",
     "group1LabelEn": "（英語）介入群ラベル",
     "group1Value": 68,
     "group2Label": "（日本語）対照群ラベル",
     "group2LabelEn": "（英語）対照群ラベル",
     "group2Value": 48,
     "unit": "%",
     "metric": "（日本語）評価指標名",
     "metricEn": "（英語）評価指標名",
     "source": "First Author et al., Journal Name, Year. PMID: XXXXXXXX",
     "captionJp": "（日本語）グラフの1行説明",
     "captionEn": "（英語）グラフの1行説明"
   }

---
CRITICAL INSTRUCTION: You are a JSON-only API. You MUST output ONLY a raw JSON object. 
DO NOT output markdown code blocks like \`\`\`json or \`\`\`mdx.
Your entire response must start with '{' and end with '}' and be perfectly parseable by JSON.parse().
To successfully put MDX into the "jpBlog" and "enBlog" strings, you MUST properly escape all newlines as \\n and double quotes as \\".

Expected JSON Schema:
{
  "slug": "url-friendly-english-slug",
  "jpBlog": "markdown formatted string...",
  "enBlog": "markdown formatted string...",
  "xPost": "tip text for x post here...",
  "infographic": { ... } or null
}
`;

    try {
        const response = await generateWithRetry(() => ai.models.generateContent({
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
                        xPost: { type: Type.STRING },
                        infographic: {
                            type: Type.OBJECT,
                            nullable: true,
                            properties: {
                                title: { type: Type.STRING },
                                titleEn: { type: Type.STRING },
                                group1Label: { type: Type.STRING },
                                group1LabelEn: { type: Type.STRING },
                                group1Value: { type: Type.NUMBER },
                                group2Label: { type: Type.STRING },
                                group2LabelEn: { type: Type.STRING },
                                group2Value: { type: Type.NUMBER },
                                unit: { type: Type.STRING },
                                metric: { type: Type.STRING },
                                metricEn: { type: Type.STRING },
                                source: { type: Type.STRING },
                                captionJp: { type: Type.STRING },
                                captionEn: { type: Type.STRING }
                            }
                        }
                    },
                    required: ["slug", "jpBlog", "enBlog", "xPost"]
                }
            }
        }));

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

                // infographic フィールドの抽出（ベストエフォート）
                let infographic = null;
                try {
                    const infMatch = resultText.match(/"infographic"\s*:\s*(\{[\s\S]*?\}|null)/);
                    if (infMatch && infMatch[1] !== 'null') infographic = JSON.parse(infMatch[1]);
                } catch { /* silent */ }
                
                result = {
                    slug,
                    jpBlog: jpBlog.replace(/\\n/g, '\n').replace(/\\"/g, '"'),
                    enBlog: enBlog.replace(/\\n/g, '\n').replace(/\\"/g, '"'),
                    xPost: xPost.replace(/\\n/g, '\n').replace(/\\"/g, '"'),
                    infographic,
                };
                
                if (!result.jpBlog) throw new Error('jpBlog field extraction failed');
                console.log("✅ フィールド境界抽出成功!");
            } catch (finalErr) {
                console.error("❌ JSON修復失敗。Raw response saved to:", debugPath);
                throw finalErr;
            }
        }

        const safeXPost = result.xPost ? result.xPost : "";

        // ── インフォグラフィック生成 ─────────────────────────────────
        let infographicInsertJp = '';
        let infographicInsertEn = '';

        if (result.infographic && result.infographic.group1Value && result.infographic.group2Value) {
            console.log('\n📊 インフォグラフィックを生成中...');
            try {
                const infData: InfographicData = {
                    ...result.infographic,
                    slug: result.slug,
                };
                const infPaths = await generateInfographic(infData);

                // MDXに挿入するMarkdown文字列を組み立て
                const capJp = result.infographic.captionJp || '主要アウトカムデータ';
                const capEn = result.infographic.captionEn || 'Key outcome data';
                const imgWebPathJp = `/infographics/${result.slug}-jp.png`;
                const imgWebPathEn = `/infographics/${result.slug}-en.png`;

                infographicInsertJp = `\n\n![${capJp}](${imgWebPathJp})\n*図: ${capJp}（出典: ${result.infographic.source}）*\n`;
                infographicInsertEn = `\n\n![${capEn}](${imgWebPathEn})\n*Figure: ${capEn} (Source: ${result.infographic.source})*\n`;

                console.log(`  ✅ PNG 生成完了 → ${infPaths.blogJp}`);
            } catch (infErr: any) {
                console.warn(`  ⚠️ インフォグラフィック生成スキップ: ${infErr.message}`);
            }
        }

        // ── インフォグラフィックをMDX本文に挿入（Referencesセクション直前）──
        function injectInfographic(mdx: string, insert: string): string {
            if (!insert) return mdx;
            // 「## 参考」または「## References」の直前に挿入
            const jpRef = mdx.indexOf('\n## 参考');
            const enRef = mdx.indexOf('\n## References');
            const insertPos = jpRef !== -1 ? jpRef : enRef !== -1 ? enRef : -1;
            if (insertPos === -1) {
                // フォールバック: FAQの直前に挿入
                const faqPos = mdx.indexOf('\n## よくある質問');
                if (faqPos !== -1) return mdx.slice(0, faqPos) + insert + mdx.slice(faqPos);
                return mdx + insert; // 末尾に追加
            }
            return mdx.slice(0, insertPos) + insert + mdx.slice(insertPos);
        }

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

        // ══════════════════════════════════════════════════
        // 3層文献検証パイプライン
        // ══════════════════════════════════════════════════
        let pmidVerificationFailed = false;
        if (references.length > 0) {
            const pmidsInArticle = references.map(r => r.pmid);

            // ── Checker 1a: 実在確認（コード — PubMed API照合）──
            console.log('\n🔍 Checker 1a: PMID実在確認...');
            try {
                const jpVerification = await verifyBlogReferences(jpBlogContent);
                const enVerification = await verifyBlogReferences(enBlogContent);

                if (jpVerification.passed && enVerification.passed) {
                    console.log(`  ✅ Checker 1a 合格 (JP: ${jpVerification.checkedCount}件, EN: ${enVerification.checkedCount}件)`);
                } else {
                    const failures = [...jpVerification.failures, ...enVerification.failures];
                    console.error(`  🚨 Checker 1a 不合格 — .draft化`);
                    failures.forEach(f => console.error(`     🔴 ${f}`));
                    pmidVerificationFailed = true;
                }
            } catch (verifyErr) {
                console.error('  🚨 Checker 1a エラー — 安全のため .draft化:', verifyErr);
                pmidVerificationFailed = true;
            }

            // ── Checker 1b: 内容整合（AI — abstract vs 記事内引用）──
            if (!pmidVerificationFailed) {
                console.log('\n🔍 Checker 1b: 内容整合チェック（論文abstract vs 記事の引用）...');
                try {
                    const jpAlignment = await checkContentAlignment(jpBlogContent, pmidsInArticle);
                    if (!jpAlignment.passed) {
                        console.error(`  🚨 Checker 1b 不合格(JP) — .draft化`);
                        jpAlignment.failures.forEach(f => console.error(`     🔴 ${f}`));
                        pmidVerificationFailed = true;
                    } else {
                        console.log(`  ✅ Checker 1b 合格(JP)`);
                        if (jpAlignment.warnings.length > 0) {
                            jpAlignment.warnings.forEach(w => console.warn(`     🟡 ${w}`));
                        }
                    }

                    if (!pmidVerificationFailed) {
                        const enAlignment = await checkContentAlignment(enBlogContent, pmidsInArticle);
                        if (!enAlignment.passed) {
                            console.error(`  🚨 Checker 1b 不合格(EN) — .draft化`);
                            enAlignment.failures.forEach(f => console.error(`     🔴 ${f}`));
                            pmidVerificationFailed = true;
                        } else {
                            console.log(`  ✅ Checker 1b 合格(EN)`);
                        }
                    }
                } catch (alignErr) {
                    console.warn('  ⚠️ Checker 1b エラー（続行）:', alignErr);
                }
            }

            // ── Checker 1c: 引用の適切性（AI — 警告のみ、公開は止めない）──
            if (!pmidVerificationFailed) {
                console.log('\n🔍 Checker 1c: 引用の適切性チェック...');
                try {
                    const relevance = await checkCitationRelevance(jpBlogContent);
                    if (relevance.warnings.length > 0) {
                        console.warn(`  🟡 Checker 1c 注意点あり:`);
                        relevance.warnings.forEach(w => console.warn(`     ${w}`));
                    } else {
                        console.log(`  ✅ Checker 1c 合格`);
                    }
                } catch (relErr) {
                    console.warn('  ⚠️ Checker 1c エラー（続行）:', relErr);
                }
            }
        } else {
            console.log('\n📝 PubMed論文なし — Referencesセクションなしで出力');
        }

        // Save JP Blog MDX
        const jpBlogDir2 = path.join(process.cwd(), 'src/content/blog/jp');
        await fs.mkdir(jpBlogDir2, { recursive: true });
        const jpBlogPath = path.join(jpBlogDir2, `${result.slug}.mdx`);
        const jpWithInfographic = injectInfographic(jpBlogContent, infographicInsertJp);
        const jpSanitized = sanitizeFrontmatter(jpWithInfographic);
        const finalJpBlog = injectXPostFrontmatter(jpSanitized, safeXPost);

        // ── JP Pre-publish validator ──
        const jpValidation = validateJapaneseMdx(finalJpBlog, result.slug);
        const jpShouldDraft = !jpValidation.ok || pmidVerificationFailed;
        if (jpShouldDraft) {
            console.error(`❌ JP Blog → DRAFT for ${result.slug}:`);
            if (pmidVerificationFailed) console.error(`   🔴 PMID検証不合格`);
            jpValidation.errors.forEach(e => console.error(`   🔴 ${e}`));
            await fs.writeFile(jpBlogPath + '.draft', finalJpBlog);
            console.log(`⚠️ Saved as DRAFT (not published) -> ${jpBlogPath}.draft`);
        } else {
            if (jpValidation.warnings.length > 0) {
                console.warn(`⚠️ JP Blog warnings for ${result.slug}:`);
                jpValidation.warnings.forEach(w => console.warn(`   🟡 ${w}`));
            }
            await fs.writeFile(jpBlogPath, finalJpBlog);
            console.log(`✅ Saved JP Blog -> ${jpBlogPath}`);
        }

        // Save EN Blog MDX (with pre-publish validation)
        const enBlogDir = path.join(process.cwd(), 'src/content/blog/en');
        await fs.mkdir(enBlogDir, { recursive: true });
        const enBlogPath = path.join(enBlogDir, `${result.slug}-en.mdx`);
        const enWithInfographic = injectInfographic(enBlogContent, infographicInsertEn);
        const enSanitized = sanitizeFrontmatter(enWithInfographic);
        const finalEnBlog = injectXPostFrontmatter(enSanitized, safeXPost);

        // ── EN Pre-publish validator ──
        const enValidation = validateEnglishMdx(finalEnBlog, result.slug);
        const enShouldDraft = !enValidation.ok || pmidVerificationFailed;
        if (enShouldDraft) {
            console.error(`❌ EN Blog → DRAFT for ${result.slug}:`);
            if (pmidVerificationFailed) console.error(`   🔴 PMID検証不合格`);
            enValidation.errors.forEach(e => console.error(`   🔴 ${e}`));
            await fs.writeFile(enBlogPath + '.draft', finalEnBlog);
            console.log(`⚠️ Saved as DRAFT (not published) -> ${enBlogPath}.draft`);
        } else {
            if (enValidation.warnings.length > 0) {
                console.warn(`⚠️ EN Blog warnings for ${result.slug}:`);
                enValidation.warnings.forEach(w => console.warn(`   🟡 ${w}`));
            }
            await fs.writeFile(enBlogPath, finalEnBlog);
            console.log(`✅ Saved EN Blog -> ${enBlogPath}`);
        }

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

// ── Pre-publish validator (code-only quality gate — no prompt changes) ──
interface ValidationResult {
    ok: boolean;
    errors: string[];
    warnings: string[];
}

function validateEnglishMdx(mdx: string, slug: string): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // 1. 空ファイルチェック
    const bodyStartIdx = mdx.indexOf('---', 3);
    const body = bodyStartIdx > 0 ? mdx.slice(bodyStartIdx + 3).trim() : '';
    if (body.length < 800) {
        errors.push(`本文が短すぎる(${body.length}字)。生成失敗の可能性`);
    }

    // 2. frontmatter の日本語混入
    const frontmatter = mdx.slice(0, bodyStartIdx + 3);
    const cjkRegex = /[\u3040-\u30ff\u3400-\u9fff]/;
    const fmLines = frontmatter.split('\n');
    for (const line of fmLines) {
        const m = line.match(/^(category|author|x_post|tags):\s*(.+)$/);
        if (m && cjkRegex.test(m[2])) {
            errors.push(`frontmatter ${m[1]} に日本語混入: ${m[2].slice(0, 30)}`);
        }
    }

    // 3. References セクションの有無
    if (!/^#{1,4}\s*References/im.test(body)) {
        warnings.push('References セクションが見つからない');
    } else {
        const refSection = body.split(/^#{1,4}\s*References/im)[1] || '';
        if (/\]\(\s*\)/.test(refSection)) {
            errors.push('References に空リンク `]()` が混入');
        }
        if (/no information provided|no provided references|n\/a/i.test(refSection)) {
            errors.push('References がプレースホルダで埋まっている');
        }
    }

    // 4. 重複AIフレーズ
    const overusedPhrases = ['Your feelings are valid', "It's crucial to", "It's important to"];
    for (const phrase of overusedPhrases) {
        const count = (body.match(new RegExp(phrase, 'gi')) || []).length;
        if (count >= 4) {
            warnings.push(`「${phrase}」が${count}回出現(4回以上は単調)`);
        }
    }

    // 5. 内部リンク形式の不統一
    if (/\]\(\/blog\//.test(body) && !/\]\(\/en\/blog\//.test(body)) {
        warnings.push('内部リンクが /blog/ 形式(英語記事は /en/blog/ 推奨)');
    }

    // 6. 未置換テンプレ変数
    if (/\$\{[^}]+\}|\{\{[^}]+\}\}/.test(body)) {
        errors.push('未置換のテンプレ変数が残存');
    }

    // 7. 禁止ワードチェック（英語）
    const enBannedHits = checkBannedWords(body, 'en');
    for (const hit of enBannedHits) {
        errors.push(`禁止ワード検出(EN): 「${hit.word}」 — ${hit.context}`);
    }

    return { ok: errors.length === 0, errors, warnings };
}

// ── 禁止ワードチェッカー（JP/EN共通） ──

const BANNED_WORDS_JP = [
    '絶対に治', '絶対治', '必ず治', '必ず効', '確実に治', '確実に効',
    '劇的に', '奇跡の', '画期的な', '革命的', '驚異的',
    '完治', '根治させ', '100%', '飛躍的に',
    '究極の', '最強の', '万能',
];

const BANNED_WORDS_EN = [
    'guarantee', 'cure ', 'cures ', 'cured',
    'miracle', 'dramatic', 'revolutionary',
    'definitely', 'certainly', 'proven to',
    '100%', 'ultimate', 'magic', 'game-changer', 'breakthrough',
];

interface BannedWordHit {
    word: string;
    context: string;
}

function checkBannedWords(text: string, lang: 'jp' | 'en'): BannedWordHit[] {
    const hits: BannedWordHit[] = [];
    const wordList = lang === 'jp' ? BANNED_WORDS_JP : BANNED_WORDS_EN;
    const lowerText = text.toLowerCase();

    for (const word of wordList) {
        const idx = lowerText.indexOf(word.toLowerCase());
        if (idx !== -1) {
            const start = Math.max(0, idx - 20);
            const end = Math.min(text.length, idx + word.length + 20);
            hits.push({
                word,
                context: `...${text.slice(start, end)}...`,
            });
        }
    }
    return hits;
}

function validateJapaneseMdx(mdx: string, slug: string): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // 1. 空ファイルチェック
    const bodyStartIdx = mdx.indexOf('---', 3);
    const body = bodyStartIdx > 0 ? mdx.slice(bodyStartIdx + 3).trim() : '';
    if (body.length < 500) {
        errors.push(`本文が短すぎる(${body.length}字)。生成失敗の可能性`);
    }

    // 2. References セクションの有無
    if (!/^#{1,4}\s*(参考|References)/im.test(body)) {
        warnings.push('参考文献セクションが見つからない');
    } else {
        const refSection = body.split(/^#{1,4}\s*(参考|References)/im)[1] || '';
        if (/\]\(\s*\)/.test(refSection)) {
            errors.push('参考文献に空リンク `]()` が混入');
        }
        if (/情報が見つかりません|論文が見つかりませんでした|N\/A/i.test(refSection)) {
            errors.push('参考文献がプレースホルダで埋まっている');
        }
    }

    // 3. 未置換テンプレ変数
    if (/\$\{[^}]+\}|\{\{[^}]+\}\}/.test(body)) {
        errors.push('未置換のテンプレ変数が残存');
    }

    // 4. 禁止ワードチェック（日本語）
    const jpBannedHits = checkBannedWords(body, 'jp');
    for (const hit of jpBannedHits) {
        errors.push(`禁止ワード検出(JP): 「${hit.word}」 — ${hit.context}`);
    }

    return { ok: errors.length === 0, errors, warnings };
}
