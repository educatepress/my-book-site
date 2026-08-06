import { NextResponse } from 'next/server';
import { getThemeSchedule, updateThemeScheduleStatus, addQueueItem, getReelsFactoryEnv } from '@/lib/sheets';
import { GoogleGenAI } from '@google/genai';
import { withRetry, sendSlackErrorAlert } from '@/lib/retry';

export const maxDuration = 300;

/**
 * カルーセル原案の内容検品。プロンプトが要求する完成条件(8枚以上・数値入り
 * Infographic・末尾CTA)を満たすかコードで確認する。
 *
 * responseSchema での強制は不可能: minItems/maxItems や anyOf を足すと Gemini API が
 * "too many states for serving" (400) で拒否する(2026-07-06実測)。nullable フィールドは
 * Gemini が平気で省略するため、検品せずに通すと4〜5枚の尻切れカルーセル
 * (Infographic数値なし・CTAなし)がそのまま投稿される(2026-07-06 IG実機で発生)。
 * 不合格なら呼び出し側が再生成する。
 */
function auditCarouselRecipe(slides: any): string[] {
  const issues: string[] = [];
  if (!Array.isArray(slides) || slides.length < 8) {
    issues.push(`スライドが${Array.isArray(slides) ? slides.length : 0}枚 (最低8枚)`);
    return issues;
  }
  // reels-factory 側 validateInfographicSlide と同じ基準。
  // これを満たさない Infographic は下流でドロップされ枚数が減る。
  // 2026-08-06 取締役指示: Infographic は必須ではない（論文に実数値が無ければ作らない）。
  // ただし「作るなら」chartType別の数値妥当性＋source(短い実引用)を必須とする。
  const toNum = (v: any): number => {
    if (typeof v === 'number') return Number.isFinite(v) ? v : NaN;
    if (typeof v !== 'string') return NaN;
    const m = v.replace(/,/g, '').match(/-?\d+(\.\d+)?/);
    return m ? parseFloat(m[0]) : NaN;
  };
  slides.forEach((s: any, i: number) => {
    if (s?.type !== 'Infographic') return;
    const n = s?.slideNumber ?? i + 1;
    const ct = s.chartType || 'comparison';
    if (ct === 'comparison') {
      const g1 = toNum(s.group1Value);
      const g2 = toNum(s.group2Value);
      if (!(Number.isFinite(g1) && Number.isFinite(g2) && Math.max(g1, g2) > 0)) {
        issues.push(`slide${n}(Infographic/comparison): group1/2Valueが無効`);
      }
    } else if (ct === 'single_value') {
      const mv = toNum(s.mainValue);
      if (!(Number.isFinite(mv) && mv > 0)) issues.push(`slide${n}(Infographic/single_value): mainValueが無効`);
    } else if (ct === 'donut') {
      const segs = (Array.isArray(s.segments) ? s.segments : [])
        .filter((x: any) => Number.isFinite(toNum(x?.value)) && toNum(x?.value) > 0);
      if (segs.length < 2) issues.push(`slide${n}(Infographic/donut): 有効なsegmentが2件未満`);
    } else if (ct === 'trend') {
      const pts = (Array.isArray(s.points) ? s.points : [])
        .filter((x: any) => Number.isFinite(toNum(x?.value)));
      if (pts.length < 3) issues.push(`slide${n}(Infographic/trend): 有効なpointが3点未満`);
    } else {
      issues.push(`slide${n}(Infographic): 未知のchartType "${ct}"`);
    }
    if (typeof s.source !== 'string' || !s.source.trim()) {
      issues.push(`slide${n}(Infographic): source(短い引用)が空 — 引用無しのグラフは出荷しない`);
    }
  });
  const last = slides[slides.length - 1];
  if (last?.type !== 'CTA') {
    issues.push(`末尾スライドがCTAでない (${last?.type})`);
  } else if (!last.actionText || !last.commentTrigger) {
    issues.push('CTAにactionText/commentTriggerが無い');
  }

  // ── 各スライドの本文完全性（2026-07-07 追加） ──
  // Gemini は headline だけ返して body を省略することがあり、そのまま通すと
  // 「タイトルだけで本文が白紙のスライド」が投稿される(2026-07-04 IG実機で発生)。
  // 基準は reels-factory 側 carousel-recipe-audit.ts と揃えること(レンダラーが
  // 実際に描画するフィールドが埋まっているかだけを見る)。
  const isFilled = (v: any): boolean => typeof v === 'string' && v.trim().length > 0;
  const hasFilledItem = (arr: any): boolean =>
    Array.isArray(arr) && arr.some((x: any) => isFilled(x));
  slides.forEach((s: any, i: number) => {
    const n = s?.slideNumber ?? i + 1;
    switch (s?.type) {
      case 'Cover':
      case 'CTA':
        if (!isFilled(s.headline)) issues.push(`slide${n}(${s.type}): headlineが空`);
        break;
      case 'Agitation':
      case 'Message':
        if (!isFilled(s.body)) issues.push(`slide${n}(${s.type}): bodyが空(本文白紙になる)`);
        break;
      case 'Content':
      case 'Intro':
        if (!isFilled(s.headline)) issues.push(`slide${n}(${s.type}): headlineが空`);
        if (!isFilled(s.body) && !hasFilledItem(s.points)) {
          issues.push(`slide${n}(${s.type}): body/pointsが両方空(本文白紙になる)`);
        }
        break;
      case 'Summary':
        if (!Array.isArray(s.summaryItems) || s.summaryItems.filter((x: any) => isFilled(x)).length < 2) {
          issues.push(`slide${n}(Summary): summaryItemsが2件未満`);
        }
        break;
      case 'Evidence':
        if (!isFilled(s.keyStat) && !isFilled(s.body)) {
          issues.push(`slide${n}(Evidence): keyStat/bodyが両方空`);
        }
        break;
      case 'Infographic':
        break; // 数値妥当性は上の hasValidChart 判定と reels-factory 側の検証が担当
      default:
        issues.push(`slide${n}: 未知のtype "${s?.type}"(レンダラーが描画できない)`);
    }
  });
  return issues;
}

/**
 * 毎日未明（04:00 JST）に起動する自動原案作成エンドポイント
 * Architecture v4.0: ThemeSchedule連携 日次自動コンテンツジェネレーター
 */
export async function GET(req: Request) {
  // Ensure Cron request authenticity
  const reelsEnv = getReelsFactoryEnv();
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET || reelsEnv.CRON_SECRET || 'dev-secret';
  
  if (authHeader !== `Bearer ${cronSecret}` && process.env.NODE_ENV !== 'development') {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  console.log('🤖 Auto Generator (VISUAL) Cron Job Started.');

  const geminiKey = process.env.GEMINI_API_KEY || reelsEnv.GEMINI_API_KEY;
  if (!geminiKey) {
    return NextResponse.json({ error: 'GEMINI_API_KEY is not configured.' }, { status: 500 });
  }

  try {
    // 翌日（tomorrow）のテーマを取得する
    const dt = new Date(new Date().getTime() + 9 * 3600 * 1000);
    dt.setDate(dt.getDate() + 1);
    const tomorrowStr = dt.toISOString().split('T')[0];
    const targetBrand = 'book'; // 指定によりbookのみ対象

    const pendingTopic = await getThemeSchedule(tomorrowStr, targetBrand);

    if (!pendingTopic) {
      console.log(`ℹ️ No ThemeSchedule found for date: ${tomorrowStr} / brand: ${targetBrand}.`);
      return NextResponse.json({ success: true, message: 'No more topics to generate.' });
    }
    
    const allowedStatuses = ['text_generated', 'done', 'pending', 'generated'];
    if (!allowedStatuses.includes(pendingTopic.status)) {
      console.log(`ℹ️ Topic status '${pendingTopic.status}' not eligible for visual generation.`);
      return NextResponse.json({ success: true, message: 'Topic already processed.' });
    }

    console.log(`📝 Found topic to generate: [${pendingTopic.themeArea}] ${pendingTopic.theme.substring(0, 30)}...`);

    const ai = new GoogleGenAI({ apiKey: geminiKey });
    
    // 公開予定日は「明日の日付(tomorrowStr)」に正確に合わせる
    const postDateStr = tomorrowStr;

    

    // ==========================================
    // PROMPT 2: 動画・画像アセット (Reels & Carousel)
    // ==========================================
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
産婦人科専門医として、医学的根拠に基づき、客観的・中立的なスタンスで解説するトーン。感情的になりすぎないこと。

【医療的正確性・エビデンス・配慮に関する厳格なルール】
- 【階層別エビデンスの明示とトーンの徹底（必須）】情報のTierが「マウス/細胞などの基礎研究段階（Tier C/D等）」を示す場合、動画全体および各スライドのトーンを「可能性が示唆される」「今後の研究が待たれる」程度に留め、「〜が原因」「〜であることが判明」といった一般的な事実であるかのような断定は絶対に避けること。また、必ず動画の随所やスライド面に「※まだ細胞/動物実験の段階です」「※ヒトでの有効性は未確立です」と注記を入れること。
- 【ハルシネーションと偽りの権威付けの絶対禁止】提供された主論文（PMID/URL）「以外」のガイドライン（例：JSOGやWHOなど）を、動画やカルーセル内でAIの推測によって勝手に引用・言及してはならない。
- 【中立性と非推奨の徹底】動画・スライド内で食事療法やサプリメントに言及する際、「これを食べれば妊娠率が上がる」といった論理的飛躍は避け、「健康維持には良いが、直接的な効果は今後の課題」というスタンスを取ること。
- 【断定表現の禁止】「確実に改善する」「保証する」等の煽り表現は絶対に禁止。慎重な表現を貫くこと。

★★★ CRITICAL: ALL output text (headlines, body, subtitles, summaries, labels) MUST be in ENGLISH. This content targets the English-speaking TTC community. Do NOT output any Japanese text in the JSON values. ★★★

以下の2つのアセットをJSON形式で出力してください。

1. "reelScript": English reel script data
   - "hookText": A punchy 3-second hook text for screen center (use behavioral economics triggers).
   - "englishAudio": A 20-30 second English narration script with good rhythm. HARD LIMIT: maximum 70 words. Never exceed — longer scripts overrun the avatar credit budget and clutter subtitles.
   - "englishSubtitles": Array of English subtitle strings for the entire video.
   - CTA must include: "Comment 'GUIDE' below to get my recommended link!"

2. "carouselJson": Carousel slide data (JSON array, 8-10 slides total). ALL text in ENGLISH.
   - Slide "type" must be one of: Cover, Agitation, Intro, Content, Infographic, Summary, CTA.

   Slide structure and JSON properties:
   1. Cover (slide 1)
     { "slideNumber": 1, "type": "Cover", "headline": "Your Engaging Title", "subheadline": "A compelling subtitle" }

   2. Agitation / Intro / Content (multiple explanation slides)
     { "slideNumber": 2, "type": "Content", "headline": "Section Heading", "body": "Body text in English", "highlightKeyword": "keyword to emphasize" }

   3. Infographic (0-2 data slides in the middle — ONLY when the paper reports concrete numbers)

     ★★★ ABSOLUTE RULES ★★★
     - Use ONLY actual numbers reported in the referenced paper/guideline. NEVER estimate,
       extrapolate, or invent values. If the paper does not report concrete usable numbers,
       DO NOT create an Infographic slide at all — write a Content slide that explains the
       finding qualitatively instead. A missing chart is always better than a made-up chart.
     - "source" is REQUIRED and must be a short real citation of the referenced paper:
       "FirstAuthor et al., Journal abbrev., Year" (e.g. "Vitagliano et al., Fertil Steril, 2023").
       Do NOT cite any paper/organization other than the provided reference. No PMIDs.
     - title: clearly state what the chart shows. metricLabel: the metric (e.g. "Live Birth Rate").

     ★★★ CHOOSE chartType BY DATA SHAPE — do NOT default everything to a bar comparison ★★★
     - "comparison": ONLY for two comparable groups measured on the same metric (treatment vs control).
     - "single_value": one striking standalone number (a prevalence, a risk, an odds ratio).
     - "donut": parts of a whole for ONE population (2-4 segments that sum to ~100%).
     - "trend": change across 3+ ordered points (age groups, weeks, years).

     Examples (pick the ONE shape that matches the paper's data):

     { "slideNumber": 5, "type": "Infographic", "chartType": "comparison",
       "title": "Pregnancy Rate: Treatment vs Control", "source": "Vitagliano et al., Fertil Steril, 2023",
       "metricLabel": "Pregnancy Rate", "group1Label": "Natural FET", "group1Value": 55.4,
       "group2Label": "Programmed FET", "group2Value": 32.1, "unit": "%" }

     { "slideNumber": 5, "type": "Infographic", "chartType": "single_value",
       "title": "How Common Is It?", "source": "Bozdag et al., Hum Reprod, 2016",
       "metricLabel": "Prevalence", "mainValue": 10, "unit": "%",
       "subText": "of reproductive-age women are affected" }

     { "slideNumber": 5, "type": "Infographic", "chartType": "donut",
       "title": "Causes of Infertility", "source": "ASRM Committee Opinion, 2020",
       "metricLabel": "Share of Cases",
       "segments": [ { "label": "Female factor", "value": 35 }, { "label": "Male factor", "value": 30 },
                     { "label": "Combined / Unexplained", "value": 35 } ], "unit": "%" }

     { "slideNumber": 5, "type": "Infographic", "chartType": "trend",
       "title": "Live Birth Rate by Age", "source": "SART National Report, 2022",
       "metricLabel": "Live Birth Rate",
       "points": [ { "label": "<35", "value": 51 }, { "label": "35-37", "value": 38 },
                   { "label": "38-40", "value": 25 }, { "label": ">40", "value": 8 } ], "unit": "%" }

   4. Summary (near the end)
     { "slideNumber": 9, "type": "Summary", "headline": "Key Takeaways", "summaryItems": ["Point 1", "Point 2", "Pro Tip: A specialist perspective"] }

   5. CTA (MUST be the last slide, slide 8-10)
     {
       "slideNumber": 10,
       "type": "CTA",
       "headline": "Read the Full Guide",
       "actionText": "To get my exclusive guide, type the word below in the comments!",
       "commentTrigger": "GUIDE"
     }

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

    console.log('🤖 Firing Gemini API with retry for visual generation...');

    const generateVisualOnce = () => withRetry(
      () => ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: visualPrompt,
        config: {
          // responseMimeType のみ指定し、responseSchema は意図的に付けない。
          // スキーマを付けると Gemini が NUMBER 型フィールド(group1Value等)を系統的に
          // 省略し、Infographic の数値が常に欠落する(2026-07-06実測: schema有り0/3、
          // schema無し3/3合格)。minItems/anyOf での枚数・必須強制も "too many states"
          // (400)で不可。JSON形状はプロンプト内の仕様＋下記の検品ループで担保する。
          responseMimeType: "application/json"
        }
      }),
      'auto-generator-visual/Gemini',
      { maxAttempts: 3, baseDelayMs: 10000 }
    );

    // 生成 → JSONパース → 内容検品。不合格なら再生成(最大3回)。
    // 3回とも不合格なら throw → 外側の catch が Slack にエラー通知
    const QA_MAX_ATTEMPTS = 3;
    let visualResult: any = null;
    let lastIssues: string[] = [];
    for (let qaAttempt = 1; qaAttempt <= QA_MAX_ATTEMPTS; qaAttempt++) {
      const visualResponse = await generateVisualOnce();
      const rawVisual = visualResponse.text || '{}';
      let parsed: any = null;
      try {
        parsed = JSON.parse(rawVisual.replace(/^```json?\n?/i, '').replace(/\n?```s*$/i, '').trim());
        lastIssues = auditCarouselRecipe(parsed.carouselJson);
        // responseSchema を外したので reelScript の形状もここで担保する
        const rs = parsed.reelScript;
        if (!rs?.hookText || !rs?.englishAudio || !Array.isArray(rs?.englishSubtitles) || rs.englishSubtitles.length === 0) {
          lastIssues.push('reelScriptが不完全 (hookText/englishAudio/englishSubtitles)');
        }
      } catch (e) {
        lastIssues = ['Invalid JSON format from AI response'];
      }
      if (parsed && lastIssues.length === 0) {
        visualResult = parsed;
        break;
      }
      console.warn(`⚠️ カルーセル原案の検品NG (${qaAttempt}/${QA_MAX_ATTEMPTS}): ${lastIssues.join(' / ')}`);
    }
    if (!visualResult) {
      throw new Error(`Carousel recipe QA failed after ${QA_MAX_ATTEMPTS} attempts: ${lastIssues.join(' / ')}`);
    }
    const { slug, reelScript, carouselJson } = visualResult;
    
    if (!slug) throw new Error('Generation failed: Slug is missing.');

    const nowStr = new Date().toISOString();
    const ts = nowStr.replace(/\D/g, '').substring(0, 14);
    const brandPrefix = pendingTopic.brand ? `${pendingTopic.brand}-` : 'book-';

    const evidenceStr = `Tier: ${pendingTopic.evidenceTier || 'Unknown'} | Limitations: ${pendingTopic.limitations || 'None'} | Source: ${pendingTopic.referenceUrl}`;

    

    // 3. キューにReel原案を登録
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

    // 4. キューにCarousel原案を登録
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

    // 5. ThemeScheduleのステータスを更新
    await updateThemeScheduleStatus(pendingTopic.rowNumber, 'generated');

    console.log(`✅ Parallel generation completed and queued successfully: ${slug}`);

    return NextResponse.json({
      success: true,
      message: `Generated and queued content for slug: ${slug}`,
      slug
    });

  } catch (error: any) {
    console.error('❌ Auto Generator (VISUAL) Error:', error);
    const slackToken = process.env.SLACK_BOT_TOKEN || reelsEnv.SLACK_BOT_TOKEN || '';
    const slackChannel = process.env.SLACK_CHANNEL_ID || reelsEnv.SLACK_CHANNEL_ID || '';
    await sendSlackErrorAlert(slackToken, slackChannel, 'auto-generator-visual', error.message || String(error));
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
