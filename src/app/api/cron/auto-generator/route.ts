import { NextResponse } from 'next/server';
import { getThemeSchedule, updateThemeScheduleStatus, addQueueItem, getReelsFactoryEnv } from '@/lib/sheets';
import { GoogleGenAI } from '@google/genai';

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

  console.log('🤖 Auto Generator Cron Job Started.');

  const geminiKey = process.env.GEMINI_API_KEY || reelsEnv.GEMINI_API_KEY;
  if (!geminiKey) {
    return NextResponse.json({ error: 'GEMINI_API_KEY is not configured.' }, { status: 500 });
  }

  try {
    const dt = new Date(new Date().getTime() + 9 * 3600 * 1000);
    const todayStr = dt.toISOString().split('T')[0];
    const targetBrand = 'book'; // 指定によりbookのみ対象

    const pendingTopic = await getThemeSchedule(todayStr, targetBrand);

    if (!pendingTopic) {
      console.log(`ℹ️ No ThemeSchedule found for date: ${todayStr} / brand: ${targetBrand}.`);
      return NextResponse.json({ success: true, message: 'No more topics to generate.' });
    }
    
    if (pendingTopic.status !== 'pending' && pendingTopic.status !== '') {
      console.log(`ℹ️ Topic already generated or skipped (status: ${pendingTopic.status}).`);
      return NextResponse.json({ success: true, message: 'Topic already processed.' });
    }

    console.log(`📝 Found topic to generate: [${pendingTopic.themeArea}] ${pendingTopic.theme.substring(0, 30)}...`);

    const ai = new GoogleGenAI({ apiKey: geminiKey });
    
    // 3日後を公開予定日として計算
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 3);
    const postDateStr = targetDate.toISOString().split('T')[0];

    // ==========================================
    // PROMPT 1: テキストアセット (Blog & X)
    // ==========================================
    const textPrompt = `
あなたは、生殖医療専門医（産婦人科医）である佐藤琢磨医師の専属AIコンテンツクリエイター兼、Webマーケティング/SEOの達人です。
あなたのタスクは、以下のテーマと「配信先ブランド」に関する「トレンド感のあるブログ記事と、X用のTips」を自動で考案し、作成することです。

【配信先ブランド】
${pendingTopic.brand || 'book'} (book=出版・執筆関連 / atelier=美容皮膚科・クリニック関連)
※指定されたブランドにふさわしいトーン＆マナーで執筆してください。

【指定テーマ】
${pendingTopic.theme}
【関連キーワード】
${pendingTopic.searchKeywords}
【エビデンス情報】
- 参考URL/PMID: ${pendingTopic.referenceUrl}
- 情報のTier: ${pendingTopic.evidenceTier || '不明（必要に応じて推測してください）'}
- 情報の限界(Limitations): ${pendingTopic.limitations || '特になし'}

【ターゲット読者層】
将来の妊娠・出産、キャリアプラン、晩婚化などに漠然とした不安を抱える、20代〜30代の女性（およびそのパートナー）、または美容医療・スキンケアに関心のある女性。

【執筆のトーン＆マナー】
- ${pendingTopic.brand === 'atelier' ? '美容皮膚科の専門医として、信頼感がありつつも親しみやすく、洗練されたトーン。' : '産婦人科専門医として、冷静かつ客観的・中立的な立場で、読者に正確な情報を提供するトーン。過度に感情的（「愛情を込めて」等）な表現は避ける。'}
- 専門用語を避け、一般読者にも理解しやすい平易な言葉遣い。
- 【重要】英語圏TTC界隈の「Toxic Positivity」は絶対に排除し、「Your feelings are valid」という感情の肯定（Validation）スタンスを貫くこと。

【医療的正確性・エビデンス・配慮に関する厳格なルール】
1. 【階層別エビデンスの明示（必須）】
   情報のTierが「マウス/細胞実験の段階（ティアC相当）」等、ヒトでの臨床エビデンスが未確立である場合、必ずリード文の直後（冒頭）に太字で「**この記事で紹介する内容は、細胞・動物実験の段階であり、ヒトでの有効性が確立されたものではありません**」という旨の免責文を挿入すること。これを怠ることは重大な規約違反である。
2. 【参考文献の厳格化】
   記事の最後に出力する参考文献は、提供された主論文（PMIDや指定URL）のみを記載すること。「日本産科婦人科学会 (JSOG) ガイドライン」や「WHO」など、記事内容と直接関係のない権威ある組織名を安易に列挙する（偽りの権威付け）ことは絶対に禁止する。
3. 【食事・サプリメント推奨の禁止（トーンダウン）】
   「〜を食べて妊活をサポートしましょう」等、食品やサプリが直接生殖能力を向上させるような論理的飛躍と断定は避けること。「一般的な健康維持に役立つ食品ですが、生殖機能への直接的効果は今後の研究課題です」という慎重なスタンスを維持すること。
4. 【中立性の徹底】
   過度な期待を抱かせる「新作用」「確実に改善する」「保証する」等の煽り表現や断定表現は絶対に禁止。
5. 必ずトリガーワーニング（TW: Pregnancy等）を適切な場合のみ明記すること。

記事の投稿日: ${postDateStr}

以下の3つのアセットをJSON形式で出力してください。

1. "jpBlog": 完全な日本語版のMDXブログ記事（2000文字程度）。
   - Markdownのフロントマター（title, date, excerpt, author）から始める。（titleはシングルクォートで囲むこと。例: title: '...'）
   - "date" の値には必ず「${postDateStr}」を指定。
   - 【SEO】: LPトップ（ \`/\` ）へのテキストリンクを文脈に合わせて2箇所以上挿入。
   - 【CTA】: 記事の最後には必ず書籍へのリンク（ https://amzn.to/3NcOWBl ）を挿入すること。ただし、「妊活全般についてさらに深く学びたい場合」という一般的な文脈でのみ紹介し、今回のブログテーマ（特定のサプリや治療法等）が書籍に書いてあるかのような誤解を与える宣伝文句は絶対に禁止。
   - "slug" キーには、ファイル名として使えるURLフレンドリーな短い英語文字列を指定。

2. "enBlog": 日本語版と同内容の、英語に翻訳・ローカライズされたMDXブログ記事。
   - TTCのLingo（2WW, DPO, BFP, AF, Baby dust等）を活用すること。
   - 最後のCTAには英語版書籍のリンク（ https://www.amazon.co.jp/Doctor%E2%80%99s-Guide-Womens-Health-Preconception/dp/B0F7XTWJ3X/ref=tmm_pap_swatch_0 ）を明記すること。ここでも「To learn more about fertility journey in general...」と汎用的な文脈とし、特定トピックと結びつけないこと。

3. "xPost": X（旧Twitter）向けの英語圏TTCコミュニティ用ポスト。
   - 【役割】不妊治療専門医による妊活ガイドの温かいAIサポーター。
   - 【禁止】"Just relax"等のToxic Positivityフレーズ。
   - 【締めくくり】"Sending baby dust! ✨🍍" などで締め、ハッシュタグ（#TTCcommunity等）を含める。

CRITICAL: ONLY OUTPUT RAW VALID JSON. DO NOT INCLUDE MARKDOWN CODE BLOCKS.
CRITICAL: ALL string values MUST properly escape newlines as \\n and double quotes as \\". DO NOT output raw newline characters inside the JSON strings. 
CRITICAL: HTML attributes (e.g. href) and Markdown frontmatter MUST use single quotes ('...'). NEVER use double quotes ("...") inside the blog text to prevent JSON parse errors.
Expected JSON Schema:
{
  "slug": "url-friendly-slug",
  "jpBlog": "markdown string...",
  "enBlog": "markdown string...",
  "xPost": "x post string..."
}
`;

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
${pendingTopic.brand === 'atelier' ? '美容皮膚科の専門医として、信頼感がありつつも親しみやすく、洗練されたトーン。' : '産婦人科専門医として、医学的根拠に基づき、客観的・中立的なスタンスで解説するトーン。感情的になりすぎないこと。'}

【医療的正確性・エビデンス・配慮に関する厳格なルール】
- 【エビデンスティアの明示】Tier情報がマウス/細胞など初期段階を示す場合は、必ず動画・画像内に「※まだ研究段階のデータです」と注記を入れること。
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

    console.log('🤖 Firing Parallel Gemini API tasks for generation...');
    
    // 2つのAPI呼び出しを並列実行
    const [textResponse, visualResponse] = await Promise.all([
      ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: textPrompt,
        config: { 
          responseMimeType: "application/json",
          responseSchema: {
            type: "OBJECT",
            properties: {
              slug: { type: "STRING" },
              jpBlog: { type: "STRING" },
              enBlog: { type: "STRING" },
              xPost: { type: "STRING" }
            },
            required: ["slug", "jpBlog", "enBlog", "xPost"]
          }
        }
      }),
      ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: visualPrompt,
        config: { 
          responseMimeType: "application/json",
          responseSchema: {
            type: "OBJECT",
            properties: {
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
            required: ["reelScript", "carouselJson"]
          }
        }
      })
    ]);

    // JSONパース処理
    const rawText = textResponse.text || '{}';
    const rawVisual = visualResponse.text || '{}';
    
    let textResult: any;
    let visualResult: any;
    try {
        try {
            textResult = JSON.parse(rawText.replace(/^```json?\s*\n?/i, '').replace(/\n?```\s*$/i, '').trim());
        } catch(e) {
            console.error('Failed to parse textResult:', rawText);
            throw e;
        }
        try {
            visualResult = JSON.parse(rawVisual.replace(/^```json?\s*\n?/i, '').replace(/\n?```\s*$/i, '').trim());
        } catch(e) {
            console.error('Failed to parse visualResult:', rawVisual);
            throw e;
        }
    } catch (e: any) {
        throw new Error('Invalid JSON format from AI response: ' + (e.message || ''));
    }

    const { slug, jpBlog, enBlog, xPost } = textResult;
    const { reelScript, carouselJson } = visualResult;
    
    if (!slug) throw new Error('Generation failed: Slug is missing.');

    const nowStr = new Date().toISOString();
    const ts = nowStr.replace(/\D/g, '').substring(0, 14);
    const brandPrefix = pendingTopic.brand ? `${pendingTopic.brand}-` : 'book-';

    const evidenceStr = `Tier: ${pendingTopic.evidenceTier || 'Unknown'} | Limitations: ${pendingTopic.limitations || 'None'} | Source: ${pendingTopic.referenceUrl}`;

    // 1. キューにブログ原案を登録
    await addQueueItem({
        content_id: `${brandPrefix}blog-${ts}`,
        brand: pendingTopic.brand || 'book',
        type: 'blog',
        title: slug,
        generation_recipe: JSON.stringify({ slug, jpBlog, enBlog }),
        status: 'pending',
        patrol_pre_result: 'pending',
        scheduled_date: postDateStr,
        ymyl_evidence: evidenceStr
    });

    // 2. キューにX投稿原案を登録
    await addQueueItem({
        content_id: `${brandPrefix}x-${ts}`,
        brand: pendingTopic.brand || 'book',
        type: 'x',
        title: `X Post for ${slug}`,
        generation_recipe: JSON.stringify({ slug, xPost }),
        status: 'pending',
        patrol_pre_result: 'pending',
        scheduled_date: postDateStr,
        ymyl_evidence: evidenceStr
    });

    // 3. キューにReel原案を登録
    await addQueueItem({
        content_id: `${brandPrefix}reel-${ts}`,
        brand: pendingTopic.brand || 'book',
        type: 'reel',
        title: `Reel Script for ${slug}`,
        generation_recipe: JSON.stringify({ slug, reelScript }),
        status: 'pending',
        patrol_pre_result: 'pending',
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
        status: 'pending',
        patrol_pre_result: 'pending',
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
    console.error('❌ Auto Generator Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
