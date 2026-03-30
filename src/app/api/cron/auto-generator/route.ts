import { NextResponse } from 'next/server';
import { getTopics, updateTopicStatus, addQueueItem, getReelsFactoryEnv } from '@/lib/sheets';
import { GoogleGenAI } from '@google/genai';

/**
 * 毎日未明（04:00 JST）に起動する自動原案作成エンドポイント
 * Architecture v3.0: 日次自動コンテンツジェネレーター（Daily Generator）
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
    const topics = await getTopics();
    const pendingTopic = topics.find(t => t.status !== 'used');

    if (!pendingTopic) {
      console.log('ℹ️ No pending topics found in the Topics sheet.');
      return NextResponse.json({ success: true, message: 'No more topics to generate.' });
    }

    console.log(`📝 Found topic to generate: [${pendingTopic.theme_id}] ${pendingTopic.theme_text.substring(0, 30)}...`);

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
${pendingTopic.theme_text}

【ターゲット読者層】
将来の妊娠・出産、キャリアプラン、晩婚化などに漠然とした不安を抱える、20代〜30代の女性（およびそのパートナー）、または美容医療・スキンケアに関心のある女性。

【執筆のトーン＆マナー】
- ${pendingTopic.brand === 'atelier' ? '美容皮膚科の専門医として、信頼感がありつつも親しみやすく、洗練されたトーン。' : '産婦人科専門医として、冷静かつ客観的・中立的な立場で、読者に正確な情報を提供するトーン。過度に感情的（「愛情を込めて」等）な表現は避ける。'}
- 専門用語を避け、一般読者にも理解しやすい平易な言葉遣い。
- 【重要】英語圏TTC界隈の「Toxic Positivity」は絶対に排除し、「Your feelings are valid」という感情の肯定（Validation）スタンスを貫くこと。

【医療的正確性・エビデンス・配慮に関する厳格なルール】
1. 必ず、エビデンスレベルの高い英語文献や公的機関の情報を元にすること。
2. 日英両方の記事の最後に「参考（References）」を箇条書きで出力すること。
3. 【超重要】妊娠成功の事例が含まれる場合は、必ずトリガーワーニング（TW: Pregnancy等）を明記すること。
4. 【中立性と非推奨の徹底】サプリメントや医薬品について言及する際、積極的な摂取を勧めるニュアンスは避けること。「医学的な情報提供」に徹し、具体的な用量や実践的な内服方法の指示は一切書かないこと。
5. 【断定表現の禁止】「確実に改善する」「保証する (confirm, guarantee, cure)」等の断定的な表現は絶対に避け、「可能性を示唆する (may support, suggests potential for)」等、過度な期待を抱かせない慎重かつ柔らかい表現を徹底すること。

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
${pendingTopic.theme_text}

【ブランドトーン】
${pendingTopic.brand === 'atelier' ? '美容皮膚科の専門医として、信頼感がありつつも親しみやすく、洗練されたトーン。' : '産婦人科専門医として、医学的根拠に基づき、客観的・中立的なスタンスで解説するトーン。感情的になりすぎないこと。'}

【医療的正確性・エビデンス・配慮に関する厳格なルール】
- 【中立性と非推奨の徹底】動画・スライド内でサプリメントや医薬品に言及する際、積極的な摂取を勧める見せ方は避けること。「客観的な情報提供」に徹し、実践的な内服方法や用量の解説は一切行わないこと。
- 【断定表現の禁止】動画やスライド内で「確実に改善する」「保証する (confirm, guarantee, cure)」等の断定的な表現は絶対に避け、「可能性を示唆する (may support, suggests potential for)」等、過度な期待を抱かせない慎重かつ柔らかな表現を徹底すること。

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

    // 1. キューにブログ原案を登録
    await addQueueItem({
        content_id: `${brandPrefix}blog-${ts}`,
        brand: pendingTopic.brand || 'book',
        type: 'blog',
        title: slug,
        generation_recipe: JSON.stringify({ slug, jpBlog, enBlog }),
        status: 'pending',
        patrol_pre_result: 'pending',
        scheduled_date: postDateStr
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
        scheduled_date: postDateStr
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
        scheduled_date: postDateStr
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
        scheduled_date: postDateStr
    });

    // 5. TopicsのステータスをUsedに更新
    await updateTopicStatus(pendingTopic.rowNumber, 'used', new Date().toISOString().split('T')[0], pendingTopic.brand || 'book');

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
