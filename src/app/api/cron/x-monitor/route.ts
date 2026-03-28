import { NextResponse } from 'next/server';
import { TwitterApi } from 'twitter-api-v2';
import { GoogleGenAI } from '@google/genai';
import { getReelsFactoryEnv } from '@/lib/sheets';

async function sendSlackAlert(blocks: any[], SLACK_BOT_TOKEN: string, ALERT_CHANNEL: string) {
  if (!SLACK_BOT_TOKEN) return;
  try {
    const res = await fetch('https://slack.com/api/chat.postMessage', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SLACK_BOT_TOKEN}`
      },
      body: JSON.stringify({
        channel: ALERT_CHANNEL,
        text: '🚨 TTCコミュニティ サポート要請',
        blocks
      })
    });
    const data = await res.json();
    if (!data.ok) console.error('Slack alert failed:', data.error);
  } catch (e) {
    console.error('Slack alert failed:', e);
  }
}

export async function GET(req: Request) {
  const reelsEnv = getReelsFactoryEnv();
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET || reelsEnv.CRON_SECRET || 'dev-secret';

  // Allow manual invocation in dev, but require cron secret in prod
  if (authHeader !== `Bearer ${cronSecret}` && process.env.NODE_ENV !== 'development') {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  console.log('🤖 X-Monitor (AI Secretary) Cron Job Started.');

  const apiKey = process.env.TWITTER_API_KEY || reelsEnv.TWITTER_API_KEY || '';
  const apiSecret = process.env.TWITTER_API_SECRET || reelsEnv.TWITTER_API_SECRET || '';
  const accessToken = process.env.TWITTER_ACCESS_TOKEN || reelsEnv.TWITTER_ACCESS_TOKEN || '';
  const accessSecret = process.env.TWITTER_ACCESS_SECRET || reelsEnv.TWITTER_ACCESS_SECRET || '';
  const geminiKey = process.env.GEMINI_API_KEY || reelsEnv.GEMINI_API_KEY || '';
  const slackToken = process.env.SLACK_BOT_TOKEN || reelsEnv.SLACK_BOT_TOKEN || '';

  if (!apiKey || !geminiKey) {
    return NextResponse.json({ error: 'Missing API Keys' }, { status: 500 });
  }

  try {
    // 1. Twitter Search API v2
    const client = new TwitterApi({
      appKey: apiKey,
      appSecret: apiSecret,
      accessToken,
      accessSecret
    });

    // 検索クエリ: TTCコミュニティのSOSや質問を狙う
    const query = '(TWW OR BFN OR "#TTCcommunity" OR "Baby dust") -is:retweet -is:reply lang:en';
    
    console.log(`🔍 Searching X with query: ${query}`);
    const searchResult = await client.v2.search(query, {
      max_results: 60, // より多くの母集団から最低1件を探すために拡張
      expansions: ['author_id'],
      'user.fields': ['username']
    });

    const tweets = searchResult.tweets;
    const includes = searchResult.includes;

    if (!tweets || tweets.length === 0) {
      console.log('ℹ️ No matching tweets found.');
      return NextResponse.json({ success: true, message: 'No target tweets found.' });
    }

    // ツイート情報をGeminiに渡すために整形
    const tweetListText = tweets.map(t => {
      const user = includes?.users?.find((u: any) => u.id === t.author_id);
      return `ID: ${t.id}\nUsername: ${user?.username || 'unknown'}\nText: ${t.text}\n---`;
    }).join('\n');

    // 2. Geminiによる判定
    const ai = new GoogleGenAI({ apiKey: geminiKey });
    const prompt = `
あなたはTTC（Trying To Conceive: 妊活・不妊治療）コミュニティの「見守り秘書」です。
以下のツイートリストから、中の人（専門医・サポーター）が手動でリプライし、温かく寄り添うべき案件を【必ず1件以上（最大3件）】抽出・報告してください。

【抽出対象】
1. ちょっとした妊活の悩みや、「TWW（判定待ち）」の不安、「AF（生理）」が来て落ち込んでいる当事者。絶望や緊急性がなくても、少し寄り添えば前向きになれそうなもの。
2. クリニック通いやサプリ、採卵・移植などのプロセスについて医学的・一般的な疑問を呟いている人。
3. これから治療を始める、または結果を待つにあたって誰かの応援（Baby dust）を必要としている人。

【❌ 絶対に除外する条件（NG）】
- 言葉遣いが悪すぎる、または攻撃的（Toxic）なもの。
- 単なる怒りの吐け口・ネガティブすぎる愚痴や他者への誹謗中傷。
- 宣伝目的や、スパム・ニュースアカウント。

【🎨 トーン＆マナー（重要）】
- 発信者は「男性の生殖医療専門医」です。そのため、ハート絵文字（💕, 💛, ❤️ 等）の使用は不自然になるため絶対に禁止してください。
- 代わりに、✨, 🍍, 🫂, 🙌, 💡 など、寄り添いと連帯を示す英語圏のTTCコミュニティで一般的な絵文字を使用してください。

以下のJSONフォーマットで回答してください。最も適したツイートを優先して選んでください。
{
  "matches": [
    {
      "tweetId": "12345",
      "username": "example_user",
      "summaryJp": "本人のツイートの日本語翻訳および要約",
      "reasonJp": "日本語での選定理由（なぜ今声をかけるべきか）",
      "suggestedReplyEn": "英語でのリプライ案（温かく寄り添い、パイナップル🍍やBaby Dust✨を含む。ハートは禁止）",
      "suggestedReplyJp": "上記英語リプライ案の日本語訳"
    }
  ]
}

【評価対象のツイートリスト】
${tweetListText}
`;

    console.log('🤖 Firing Gemini API for screening...');
    const aiResult = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
          responseMimeType: "application/json",
      }
    });

    const rawText = aiResult.text || '{}';
    let parsed: { matches: any[] };
    try {
      parsed = JSON.parse(rawText.replace(/^```json?\s*\n?/i, '').replace(/\n?```\s*$/i, '').trim());
    } catch (e) {
      throw new Error('Invalid JSON from Gemini');
    }

    const matches = parsed.matches || [];
    console.log(`✅ Found ${matches.length} target tweets requiring manual support.`);

    // 3. Slackへ通知
    for (const match of matches) {
      const tweetUrl = `https://twitter.com/${match.username}/status/${match.tweetId}`;
      const blocks = [
        {
          type: 'header',
          text: { type: 'plain_text', text: '🚨 【AI秘書】TTC見守りレーダー', emoji: true }
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*対象ユーザー*: @${match.username}\n\n*📝 ツイート内容（和訳）*\n${match.summaryJp}\n\n*💡 選定理由*\n${match.reasonJp}`
          }
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `🔗 *元の投稿（英語）を確認する*\n${tweetUrl}`
          }
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*💬 返信案の和訳*\n_${match.suggestedReplyJp}_`
          }
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*👇 リプライ用英文 (Copy & Paste)*:\n\`\`\`${match.suggestedReplyEn}\`\`\``
          }
        },
        { type: 'divider' }
      ];

      await sendSlackAlert(blocks, slackToken, '#ttcpreconception_co');
    }

    return NextResponse.json({
      success: true,
      matchesFound: matches.length,
      matches
    });

  } catch (error: any) {
    console.error('❌ X-Monitor Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
