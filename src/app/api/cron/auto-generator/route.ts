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

    // プロンプト生成（既存のルールに準拠）
    const prompt = `
あなたは、生殖医療専門医（産婦人科医）である佐藤琢磨医師の専属AIコンテンツクリエイター兼、Webマーケティング/SEOの達人です。
あなたのタスクは、以下のテーマと「配信先ブランド」に関する「トレンド感のあるブログ記事と、X用のTips」を自動で考案し、作成することです。

【配信先ブランド】
${pendingTopic.brand || 'book'} (book=出版・執筆関連 / atelier=美容皮膚科・クリニック関連)
※指定されたブランドにふさわしいトーン＆マナーで執筆してください。

【指定テーマ】
${pendingTopic.theme_text}
※このテーマと狙いに完全に沿った形で、ブログ記事を構成してください。

【ターゲット読者層】
将来の妊娠・出産、キャリアプラン、晩婚化などに漠然とした不安を抱える、20代〜30代の女性（およびそのパートナー）、または美容医療・スキンケアに関心のある女性。

【執筆のトーン＆マナー】
- ${pendingTopic.brand === 'atelier' ? '美容皮膚科の専門医として、信頼感がありつつも親しみやすく、洗練されたトーン。' : '産婦人科専門医として、冷静かつ論理的に、しかし読者の未来を心から応援する愛情深いトーン。'}
- 専門用語を避け、一般読者にも理解しやすい平易な言葉遣い。
- 読者の悩みに寄り添い、「確かな知識によって人生の選択肢を広げる」ことを後押しするEmpowermentな文体。

【医療的正確性・エビデンスに関する厳格なルール】
1. 必ず、エビデンスレベルの高い英語文献や、WHO・CDC・厚労省・日本産科婦人科学会などの公的機関の情報・ガイドラインを情報源として使用すること。
2. 日英両方の記事の最後に、必ず「参考（References）」という見出しを作成し、参考にした英語文献や公的ガイドラインの名称（可能ならURLも）を箇条書きで出力すること。

記事の投稿日（フロントマター用）: ${postDateStr}

以下の3つのアセットをJSON形式で出力してください。

1. "jpBlog": 完全な日本語版のMDXブログ記事（2000文字程度）。
   - Markdownのフロントマター（title, date, excerpt, author）から始めること。（YAMLエラーを防ぐためtitleはダブルクォートで囲む）
   - "date" の値には必ず「${postDateStr}」を指定すること。
   - 【SEO】: LPトップ（ \`/\` ）へのテキストリンクを文脈に合わせて2箇所以上挿入すること。※「来院予約」や「当院」は使用しない。
   - 【CTA】: 最後には必ず書籍への誘導リンク（ https://amzn.to/3NcOWBl ）を魅力的な文脈と共に挿入すること。
   - "slug" キーには、ファイル名として使えるURLフレンドリーな短い英語文字列を指定すること。

2. "enBlog": 日本語版と同内容の、英語に翻訳・ローカライズされたMDXブログ記事。
   - 英語のフロントマターを含めること。
   - 最後のCTAには英語版書籍のリンク（ https://www.amazon.co.jp/Doctor%E2%80%99s-Guide-Womens-Health-Preconception/dp/B0F7XTWJ3X/ref=tmm_pap_swatch_0 ）を明記すること。

3. "xPost": X（旧Twitter）向けの英語圏TTC（Trying To Conceive）コミュニティ用ポスト。
   【役割】あなたは不妊治療専門医による妊活ガイド（TTC Guide）の温かいAIサポーターです。
   【ミッション】1.医学的根拠の提供 2.感情の肯定(Validation)と共感 3.誠実なトーンの維持
   【必須文化】パイナップル(🍍)を多用。専門用語(TWW, BFN, AF, DPO, Baby dust, REI等)を自然に混ぜる。
   【絶対禁止】"Just relax" "Everything happens for a reason" 等のToxic Positivityフレーズ。代わりに "Your feelings are valid" 等を使用。
   【コンテンツ】ブログ記事の内容に沿って「Science Tips」「Emotional Validation」「Relatable Humor」「Interactive Polls」のいずれかのアプローチで作成（英語）。
   【締めくくり】"Sending baby dust! ✨🍍" や "You've got this. 💛" で締め、ハッシュタグ #TTCcommunity #TTCtwitter #IVFwarrior を必ず含める。

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

    console.log('🤖 Firing Gemini API for generation...');
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
          responseMimeType: "application/json",
      }
    });

    const rawText = response.text || '{}';
    let result: any;
    try {
        result = JSON.parse(rawText.replace(/^```json?\s*\n?/i, '').replace(/\n?```\s*$/i, '').trim());
    } catch (e) {
        console.error('Failed to parse Gemini output:', rawText.substring(0, 300));
        throw new Error('Invalid JSON format from AI response.');
    }

    const { slug, jpBlog, enBlog, xPost } = result;
    if (!slug) throw new Error('Generation failed: Slug is missing.');

    const nowStr = new Date().toISOString();

    const brandPrefix = pendingTopic.brand ? `${pendingTopic.brand}-` : 'book-';

    // 1. キューにブログ原案を登録（事前パトロール対象として status='review'）
    await addQueueItem({
        content_id: `${brandPrefix}blog-${nowStr.replace(/\D/g, '').substring(0, 14)}`,
        brand: pendingTopic.brand || 'book',
        type: 'blog',
        title: slug, // slugをタイトル代わりに使用
        generation_recipe: JSON.stringify({ slug, jpBlog, enBlog }),
        status: 'review',
        patrol_pre_result: 'pending',
        scheduled_date: postDateStr
    });

    // 2. キューにX投稿原案を登録
    await addQueueItem({
        content_id: `${brandPrefix}x-${nowStr.replace(/\D/g, '').substring(0, 14)}`,
        brand: pendingTopic.brand || 'book',
        type: 'x',
        title: `X Post for ${slug}`,
        generation_recipe: JSON.stringify({ slug, xPost }),
        status: 'review',
        patrol_pre_result: 'pending',
        scheduled_date: postDateStr
    });

    // 3. TopicsのステータスをUsedに更新し、brand列（空欄の場合）も上書きする
    await updateTopicStatus(pendingTopic.rowNumber, 'used', new Date().toISOString().split('T')[0], pendingTopic.brand || 'book');

    console.log(`✅ Generation completed and queued successfully: ${slug}`);

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
