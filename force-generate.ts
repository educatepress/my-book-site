import { getThemeSchedule, updateThemeScheduleStatus, addQueueItem, getReelsFactoryEnv } from './src/lib/sheets';
import { GoogleGenAI } from '@google/genai';

async function main() {
  process.env.NODE_ENV = 'development';
  const reelsEnv = getReelsFactoryEnv();
  const geminiKey = process.env.GEMINI_API_KEY || reelsEnv.GEMINI_API_KEY;
  const ai = new GoogleGenAI({ apiKey: geminiKey });

  const dt = new Date(new Date().getTime() + 9 * 3600 * 1000);
  const todayStr = dt.toISOString().split('T')[0];
  const pendingTopic = await getThemeSchedule(todayStr, 'book');

  if (!pendingTopic) {
      console.log('No topic found today.');
      return;
  }
  console.log(`Forcing Visual Generation for: ${pendingTopic.theme}`);
  
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + 3);
  const postDateStr = targetDate.toISOString().split('T')[0];

  const visualPrompt = `
あなたは、生殖医療専門医（産婦人科医）である佐藤琢磨医師の専属AIコンテンツクリエイターです。
指定されたテーマに基づき、「Instagramショート動画（Reels）用の台本」と「スワイプ投稿（Carousel）用のJSONスライド構成」を同時生成してください。

【指定テーマ】
${pendingTopic.theme}
【関連キーワード】
${pendingTopic.searchKeywords}
【エビデンス情報】
- 参考URL/PMID: ${pendingTopic.referenceUrl}
- 情報のTier: ${pendingTopic.evidenceTier || '不明'}
- 情報の限界(Limitations): ${pendingTopic.limitations || '特になし'}

【ブランドトーン】
${pendingTopic.brand === 'atelier' ? '美容皮膚科の専門医として、信頼感がありつつも親しみやすく、洗練されたトーン。' : '産婦人科専門医として、医学的根拠に基づき、客観的・中立的なスタンスで解説するトーン。感情的になりすぎないこと。'}

【医療的正確性・エビデンス・配慮に関する厳格なルール】
- 【階層別エビデンスの明示とトーンの徹底（必須）】情報のTierが「マウス/細胞などの基礎研究段階（Tier C/D等）」を示す場合、動画全体および各スライドのトーンを「可能性が示唆される」「今後の研究が待たれる」程度に留め、「〜が原因」「〜であることが判明」といった一般的な事実であるかのような断定は絶対に避けること。また、必ず動画の随所やスライド面に「※まだ細胞/動物実験の段階です」「※ヒトでの有効性は未確立です」と注記を入れること。
- 【ハルシネーションと偽りの権威付けの絶対禁止】提供された主論文（PMID/URL）「以外」のガイドライン（例：JSOGやWHOなど）を、動画やカルーセル内でAIの推測によって勝手に引用・言及してはならない。
- 【中立性と非推奨の徹底】動画・スライド内で食事療法やサプリメントに言及する際、「これを食べれば妊娠率が上がる」といった論理的飛躍は避け、「健康維持には良いが、直接的な効果は今後の課題」というスタンスを取ること。
- 【断定表現の禁止】「確実に改善する」「保証する」等の煽り表現は絶対に禁止。慎重な表現を貫くこと。

以下の2つのアセットをJSON形式で出力してください。

1. "reelScript": リール動画用の英語台本データ
   - "hookText": 最初の3秒間で画面中央に出す強烈なフックテキスト（行動経済学を意識した煽り）。
   - "englishAudio": 15〜45秒で読まれるリズムの良い英語のナレーション台本。
   - "englishSubtitles": 動画全体を通して画面に出す英語字幕の配列。
   - CTAには必ず「Comment 'GUIDE' below to get my recommended link!」を含めること。

2. "carouselJson": カルーセル形式の画像スライド用の構成データ（JSON配列。最大8枚）。
   - 各配列要素は以下の形式のオブジェクトであること:
     { "slideNumber": 1, "type": "Cover", "headline": "...", "subheadline": "..." }
   - スライドの "type" は、Cover, Agitation, Intro, Content, Infographic, Summary のいずれかを使用すること。
   - 構成の例:
     1. Cover (タイトル "headline", "subheadline")
     2. Agitation (問題提起・共感 "headline", "body")
     3. Intro (これから解説する内容 "headline", "points": ["...", "..."])
     4-6. Content または Infographic ("headline", "body", "highlightKeyword")
     7. Summary ("headline", "summaryItems": ["...", "..."])

CRITICAL: ONLY OUTPUT RAW VALID JSON. DO NOT INCLUDE MARKDOWN CODE BLOCKS.
CRITICAL: ALL string values MUST properly escape newlines as \\n and double quotes as \\". DO NOT output raw newline characters inside the JSON strings.
CRITICAL: NEVER use double quotes ("...") inside the JSON string properties (like headlines or body). Use single quotes ('...') if you need to quote something to prevent JSON parse errors.
Expected JSON Schema:
{
  "slug": "url-friendly-slug",
  "reelScript": {
    "hookText": "string",
    "englishAudio": "string",
    "englishSubtitles": ["string", "string"]
  },
  "carouselJson": [
    { "slideNumber": 1, "type": "Cover", "headline": "...", "subheadline": "..." }
  ]
}
`;

  console.log('🤖 Firing Gemini API...');
  const visualResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: visualPrompt,
      config: { 
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            slug: { type: "STRING" },
            reelScript: {
              type: "OBJECT",
              properties: {
                hookText: { type: "STRING" },
                englishAudio: { type: "STRING" },
                englishSubtitles: {
                  type: "ARRAY",
                  items: { type: "STRING" }
                }
              },
              required: ["hookText", "englishAudio", "englishSubtitles"]
            },
            carouselJson: {
              type: "ARRAY",
              items: {
                type: "OBJECT",
                properties: {
                  slideNumber: { type: "INTEGER" },
                  type: { type: "STRING" },
                  headline: { type: "STRING" },
                  subheadline: { type: "STRING", nullable: true },
                  body: { type: "STRING", nullable: true },
                  points: { type: "ARRAY", items: { type: "STRING" }, nullable: true },
                  highlightKeyword: { type: "STRING", nullable: true },
                  summaryItems: { type: "ARRAY", items: { type: "STRING" }, nullable: true }
                },
                required: ["slideNumber", "type", "headline"]
              }
            }
          },
          required: ["slug", "reelScript", "carouselJson"]
        }
      }
    });

  const rawVisual = visualResponse.text || '{}';
  const { slug, reelScript, carouselJson } = JSON.parse(rawVisual);
  const nowStr = new Date().toISOString();
  const ts = nowStr.replace(/\D/g, '').substring(0, 14);
  const brandPrefix = pendingTopic.brand ? `${pendingTopic.brand}-` : 'book-';
  const evidenceStr = `Tier: ${pendingTopic.evidenceTier || 'Unknown'} | Limitations: ${pendingTopic.limitations || 'None'} | Source: ${pendingTopic.referenceUrl}`;

  console.log(`Adding Reel: ${brandPrefix}reel-${ts}`);
  await addQueueItem({
      content_id: `${brandPrefix}reel-${ts}`,
      brand: pendingTopic.brand || 'book',
      type: 'reel',
      title: `Reel Script for ${slug}`,
      generation_recipe: JSON.stringify({ slug, reelScript }),
      status: 'waiting_for_render',
      patrol_pre_result: 'waiting',
      scheduled_date: postDateStr,
      ymyl_evidence: evidenceStr
  });

  console.log(`Adding Carousel: ${brandPrefix}carousel-${ts}`);
  await addQueueItem({
      content_id: `${brandPrefix}carousel-${ts}`,
      brand: pendingTopic.brand || 'book',
      type: 'carousel',
      title: `Carousel Format for ${slug}`,
      generation_recipe: JSON.stringify({ slug, title: slug, slides: carouselJson }),
      status: 'waiting_for_render',
      patrol_pre_result: 'waiting',
      scheduled_date: postDateStr,
      ymyl_evidence: evidenceStr
  });

  console.log(`✅ Test generation completed successfully!`);
}
main();
