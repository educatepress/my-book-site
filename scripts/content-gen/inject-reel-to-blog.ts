import 'dotenv/config';
import { GoogleGenAI } from '@google/genai';
import fs from 'fs/promises';
import path from 'path';
import { ContentQueue, getQueue, saveQueue } from './queue-manager';

// ── Config ──
const REEL_BANK_PATH = path.join(__dirname, '../../../reels-factory/scripts/topics-bank.json');
const GEMINI_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_KEY) {
    console.error("❌ GEMINI_API_KEY is missing in .env");
    process.exit(1);
}

const ai = new GoogleGenAI({ apiKey: GEMINI_KEY });

// ── Types ──
interface ReelTopic {
    id: string;
    status: string;
    title: string;
    themeArea: string;
    text: string;
    hook: string;
    type: string;
    blogStatus?: string;
    evidence?: {
        summary: string;
        paperTitle?: string;
        pmidOrDoi?: string;
        source?: string;
    };
    trend?: {
        platform: string;
        description: string;
        evidenceBacked: boolean;
    };
    keyTakeaway?: string;
}

// ── Helpers ──

/** Convert PMID/DOI to a usable URL */
function evidenceToUrl(evidence?: ReelTopic['evidence']): string[] {
    if (!evidence?.pmidOrDoi) return [];
    const raw = evidence.pmidOrDoi;

    // PMID: 28697256
    const pmidMatch = raw.match(/PMID:\s*(\d+)/i);
    if (pmidMatch) return [`https://pubmed.ncbi.nlm.nih.gov/${pmidMatch[1]}/`];

    // DOI: 10.xxxx/yyyy
    const doiMatch = raw.match(/DOI:\s*(10\.[^\s]+)/i);
    if (doiMatch) return [`https://doi.org/${doiMatch[1]}`];

    return [];
}

/** Generate Japanese blog theme + Smart Brevity direction from a reel topic via AI */
async function generateBlogMeta(topic: ReelTopic): Promise<{
    jpTheme: string;
    direction: string;
    directionEn: string;
    seoKeywords: string;
}> {
    const prompt = `You are a bilingual medical content strategist. Generate a blog article plan from a short-form Reel video topic.

REEL TOPIC:
- Title (EN): ${topic.title}
- Theme Area: ${topic.themeArea}
- Script: ${topic.text}
- Evidence: ${topic.evidence?.summary || 'None'}
- Key Takeaway: ${topic.keyTakeaway || topic.hook}
${topic.trend ? `- Trend: ${topic.trend.description} (${topic.trend.platform})` : ''}

TASK:
1. Create a compelling Japanese blog title (30-50 chars) that would rank on Google Japan for this topic
2. Create a Smart Brevity blog outline (4-5 sections as H2 headings in Japanese)
3. Suggest 4-5 Japanese SEO keywords
4. Write the English direction for the blog

SMART BREVITY BLOG RULES:
- Lead with the conclusion (結論ファースト)
- Each section: 1 big thing → why it matters → what's next
- Short paragraphs (2-3 sentences max → line break)
- Mobile-optimized readability
- Evidence-backed with hedging ("may", "research suggests")
- Empowerment tone, NOT fear-mongering

OUTPUT FORMAT (JSON only, no markdown):
{
  "jpTheme": "Japanese article title",
  "direction": "Smart Brevity構成案:\\n\\n- H2: セクション1タイトル\\n- H2: セクション2タイトル\\n...\\n\\nSEOキーワード: ...\\n\\nSmart Brevity原則: 結論ファースト、各セクション3文以内、モバイルファースト",
  "directionEn": "English blog direction...",
  "seoKeywords": "keyword1, keyword2, keyword3"
}`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { responseMimeType: "application/json" },
    });

    const text = response.text || '{}';
    return JSON.parse(text);
}

// ── Main ──
async function main() {
    console.log("🚀 Reel → Blog 注入スクリプト開始...\n");

    // 1. Read reel topics-bank
    let reelBank: ReelTopic[];
    try {
        const raw = await fs.readFile(REEL_BANK_PATH, 'utf8');
        reelBank = JSON.parse(raw);
        console.log(`📄 topics-bank.json 読み込み完了: ${reelBank.length} 件`);
    } catch (e: any) {
        console.error(`❌ topics-bank.json が見つかりません: ${REEL_BANK_PATH}`);
        console.error(`   reels-factory プロジェクトへのパスを確認してください`);
        process.exit(1);
    }

    // 2. Filter: rendered topics that haven't been queued for blog yet
    const candidates = reelBank.filter(t =>
        t.status === 'rendered' && (!t.blogStatus || t.blogStatus === 'pending')
    );

    if (candidates.length === 0) {
        console.log("🟢 ブログ未注入のレンダリング済みトピックはありません。");
        process.exit(0);
    }

    console.log(`\n📋 ブログ候補: ${candidates.length} 件\n`);

    // 3. Load content-queue
    let queue: ContentQueue;
    try {
        queue = await getQueue();
    } catch {
        queue = {
            lastUpdated: new Date().toISOString(),
            sourceReport: "",
            queue: []
        };
    }

    // 4. Check existing to prevent duplicate injection
    const existingIds = new Set(queue.queue.map(q => q.id));

    let injectedCount = 0;

    for (const topic of candidates) {
        const blogId = `reel-blog-${topic.id}`;

        if (existingIds.has(blogId)) {
            console.log(`  ⏭️ スキップ（注入済み）: ${topic.title}`);
            continue;
        }

        console.log(`  🔄 [${injectedCount + 1}/${candidates.length}] 処理中: ${topic.title}`);

        // Generate blog metadata via AI
        const meta = await generateBlogMeta(topic);
        console.log(`    📝 日本語テーマ: ${meta.jpTheme}`);

        // Build source URLs from evidence
        const sourceUrls = evidenceToUrl(topic.evidence);

        // Inject into queue
        queue.queue.push({
            id: blogId,
            theme: meta.jpTheme,
            themeEn: topic.title,
            sourceUrls,
            direction: meta.direction,
            directionEn: meta.directionEn,
            type: "blog",
            status: "pending",
        });

        // Update topics-bank blogStatus
        topic.blogStatus = 'queued';

        injectedCount++;
        console.log(`    ✅ content-queue に注入完了`);
    }

    if (injectedCount === 0) {
        console.log("\n🟢 新たに注入するトピックはありませんでした。");
        process.exit(0);
    }

    // 5. Save updated queue
    queue.lastUpdated = new Date().toISOString();
    await saveQueue(queue);
    console.log(`\n📦 content-queue.json 更新完了 (${injectedCount} 件追加)`);

    // 6. Save updated topics-bank
    await fs.writeFile(REEL_BANK_PATH, JSON.stringify(reelBank, null, 2), 'utf8');
    console.log(`📦 topics-bank.json 更新完了 (blogStatus → queued)`);

    // 7. Summary
    console.log(`
════════════════════════════════════════════════════════════
🎉 Reel → Blog 注入完了！
════════════════════════════════════════════════════════════
  注入件数: ${injectedCount}
  
  次のステップ:
  1. [推奨] 手動 Deep Research で追加エビデンスを収集
  2. content-queue.json の sourceUrls に追加ソースを追加
  3. npm run blog:gen → ブログ MDX 生成
  4. npm run x:gen → X スレッド投稿
`);
}

main().catch(console.error);
