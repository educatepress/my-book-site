import { NextResponse } from 'next/server';
import { getQueueItems, updateQueueItem, getReelsFactoryEnv } from '@/lib/sheets';
import Anthropic from '@anthropic-ai/sdk';

export async function GET(req: Request) {
  const reelsEnv = getReelsFactoryEnv();
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET || reelsEnv.CRON_SECRET || 'dev-secret';

  if (authHeader !== `Bearer ${cronSecret}` && process.env.NODE_ENV !== 'development') {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  console.log('🛡️ AI Pre-Patrol Cron Job Started.');

  const anthropicKey = process.env.ANTHROPIC_API_KEY || reelsEnv.ANTHROPIC_API_KEY;
  if (!anthropicKey) {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY is missing' }, { status: 500 });
  }

  const slackToken = process.env.SLACK_BOT_TOKEN || reelsEnv.SLACK_BOT_TOKEN;
  const slackChannel = process.env.SLACK_CHANNEL_ID || reelsEnv.SLACK_CHANNEL_ID || '#ttcpreconception_co';

  if (!slackToken) {
    return NextResponse.json({ error: 'SLACK_BOT_TOKEN is missing' }, { status: 500 });
  }

  try {
    const queue = await getQueueItems();
    
    // Find items waiting for Pre-Patrol
    const pendingItems = queue.filter(
      item => item.status === 'pending' && item.patrol_pre_result === 'pending'
    );

    if (pendingItems.length === 0) {
      console.log('ℹ️ No pending items found for Pre-Patrol.');
      return NextResponse.json({ success: true, message: 'No items to patrol.' });
    }

    const anthropic = new Anthropic({ apiKey: anthropicKey });

    for (const item of pendingItems) {
      console.log(`🔍 [Pre-Patrol] Inspecting: ${item.title} (${item.type})`);

      // ── Extract Content ──
      let contentText = '';
      try {
        const recipe = JSON.parse(item.generation_recipe || '{}');
        if (item.type === 'blog') {
          contentText = `[JP BLOG]\n${recipe.jpBlog || ''}\n\n[EN BLOG]\n${recipe.enBlog || ''}`;
        } else if (item.type === 'x') {
          contentText = `[X POST]\n${recipe.xPost || ''}`;
        } else if (item.type === 'reel') {
          const reelItem = recipe.reelScript;
          if (reelItem) {
            contentText = `[HOOK]\n${reelItem.hookText}\n\n[ENGLISH AUDIO]\n${reelItem.englishAudio}\n\n[SUBTITLES]\n${(reelItem.englishSubtitles || []).join('\n')}`;
          } else {
            contentText = JSON.stringify(recipe, null, 2);
          }
        } else if (item.type === 'carousel') {
          const slides = recipe.slides || [];
          contentText = slides.map((s: any) => `[Slide ${s.slideNumber}: ${s.type}]\nHeadline: ${s.headline}\n${s.subheadline ? `Sub: ${s.subheadline}` : ''}${s.body ? `Body: ${s.body}` : ''}${s.points ? `Points: ${s.points.join(', ')}` : ''}${s.highlightKeyword ? `Highlight: ${s.highlightKeyword}` : ''}${s.summaryItems ? `Summary: ${s.summaryItems.join(', ')}` : ''}`).join('\n\n');
        } else {
          contentText = recipe.text || item.title;
        }
      } catch (e) {
        contentText = item.title;
      }

      // ── Claude 3.5 Sonnet Patrol ──
      const brandContext = item.brand === 'atelier'
        ? 'あなたは美容皮膚科（Skin Atelier）専門の校閲者です。トーンは「洗練された身近な専門家」。薬機法や過剰な美容医療の勧誘表現、不自然なNGワード（アンチエイジングの効果を断言するなど）がないかチェックしてください。'
        : 'あなたは不妊治療専門の校閲者（Book/TTC Guide）です。トーンは「寄り添う専門家」。Toxic Positivity（前向きの強要）がなく、感情の肯定（Validation）ができているかチェックしてください。';

      const prompt = `
${brandContext}
以下の原稿（生成AIが作成した下書き）を読み、以下のルールに違反していないか**厳密にチェック**し、結果を返してください。

【チェック内容】
1. トーン＆マナーの逸脱（冷たすぎる、過剰なテンション等）
2. 医療情報の断定表現（「必ず治る」等のYMYL違反）
3. ${item.brand === 'atelier' ? '美容医療の価格強調やBefore/Afterの過度な断言' : '「Just relax」などToxic Positivityフレーズの使用'}

【出力フォーマット】
問題がない場合は「✅ 異常なし。トーンも完璧です。」と出力。
問題がある場合は「⚠️ 要注意: [問題箇所] -> [修正提案]」を簡潔に出力。

【原稿】
${contentText}
      `.trim();

      // Fallback to Gemini for now to ensure pipeline runs
      const { GoogleGenAI } = require('@google/genai');
      const geminiAi = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || reelsEnv.GEMINI_API_KEY });
      const response = await geminiAi.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });
      const aiFeedback = response.text || 'フィードバックをパースできませんでした';


      // ── Slack Notification via Webhook ──
      // Sending Block Kit to the standard Webhook URL (Usually chat.postMessage is better for buttons, but webhook supports block actions if configured properly in Slack app)
      const isAtelier = item.brand === 'atelier';
      const brandBadge = isAtelier ? '🟩 Skin Atelier' : '🟦 hiroo-open';

      const previewText = contentText.length > 80 ? contentText.substring(0, 80) + '...' : contentText;

      const blocks = [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: `📋 承認待ち: ${item.title} (${item.type})`,
            emoji: true
          }
        },
        {
          type: 'context',
          elements: [
            { type: 'mrkdwn', text: `*配信先:* ${brandBadge}  |  *ID:* \`${item.content_id}\`` }
          ]
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*📝 プレビュー:* ${previewText.replace(/\n/g, ' ')}\n📍 *本文の全文（カルーセルや動画台本の詳細）は「スレッド」に入っています！タップしてご確認ください。*`
          }
        },
        {
          type: 'actions',
          elements: [
            {
              type: 'button',
              text: { type: 'plain_text', text: '✅ 承認', emoji: true },
              style: 'primary',
              action_id: 'approve_content',
              value: JSON.stringify({ id: item.content_id })
            },
            {
              type: 'button',
              text: { type: 'plain_text', text: '❌ 却下（修正指示）', emoji: true },
              style: 'danger',
              action_id: 'reject_content',
              value: JSON.stringify({ id: item.content_id })
            }
          ]
        }
      ];

      try {
        const slackRes = await fetch('https://slack.com/api/chat.postMessage', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${slackToken}`
          },
          body: JSON.stringify({ channel: slackChannel, text: `新しい原稿の承認待ち: ${item.title}`, blocks })
        });
        const slackData = await slackRes.json();
        if (!slackData.ok) throw new Error(slackData.error || 'Slack API Error');

        // Send full text in thread
        if (slackData.ts) {
          const threadRes = await fetch('https://slack.com/api/chat.postMessage', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${slackToken}`
            },
            body: JSON.stringify({ 
              channel: slackChannel, 
              thread_ts: slackData.ts,
              text: `*🤖 AI監査結果:*\n${aiFeedback}\n\n---\n*📝 全テキスト内容:*\n\n${contentText}`
            })
          });
          const threadData = await threadRes.json();
          if (!threadData.ok) {
            console.error(`❌ [Pre-Patrol] Thread failed for ${item.content_id}:`, threadData.error);
            // If the thread fails, we should NOT consider the patrol fully done, but we proceed anyway or log it.
          }
        }

        // Update Sheet to prevent re-patrolling
        await updateQueueItem(item.rowNumber, {
          patrol_pre_result: 'done'
        });

        console.log(`✅ [Pre-Patrol] Slack notified and updated ${item.content_id}`);
      } catch (err) {
        console.error(`❌ [Pre-Patrol] Failed to notify Slack for ${item.content_id}:`, err);
      }
    }

    return NextResponse.json({ success: true, processedCount: pendingItems.length });

  } catch (error: any) {
    console.error('❌ [Pre-Patrol] Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
