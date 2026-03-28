import { NextResponse } from 'next/server';
import { TwitterApi } from 'twitter-api-v2';
import { GoogleGenAI } from '@google/genai';
import { getReelsFactoryEnv } from '@/lib/sheets';

async function sendSlackAlert(blocks: any[], SLACK_BOT_TOKEN: string, ALERT_CHANNEL: string) {
  if (!SLACK_BOT_TOKEN) return;
  try {
    await fetch('https://slack.com/api/chat.postMessage', {
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
      max_results: 20, // 最新20件を取得
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
あなたはTTCコミュニティの「見守り秘書」です。
以下の条件に合う投稿を見つけ、中の人（人間）が手動でリプライすべき案件として抽出・報告してください。

【抽出対象】
1. 「BFN（陰性）」でひどく落ち込んでいる、または「AF（生理）」が来て絶望している当事者。
2. 「TWW（判定待ち）」で不安が爆発しそうな当事者。
3. 医学的な疑問（例：このサプリどう思う？など）を投げかけている当事者。
※ 宣伝目的や、明らかにスパム・ニュースアカウントからの投稿は除外すること。

以下のJSONフォーマットで回答してください。抽出対象がない場合は空の配列を返してください。
{
  "matches": [
    {
      "tweetId": "12345",
      "username": "example_user",
      "summary": "日本語でポストの内容を要約",
      "reason": "日本語で反応すべき理由（なぜ今、人間が声をかけるべきか）",
      "suggestedReply": "英語でのリプライ案（温かく、パイナップル🍍やBaby Dust✨を含む）"
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
          text: { type: 'plain_text', text: '🚨 【AI秘書】TTC見守りレーダー🚨', emoji: true }
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*対象ユーザー*: @${match.username}\n*内容要約*: ${match.summary}\n*選定理由*: ${match.reason}`
          }
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `🔗 *元の投稿を見る*\n${tweetUrl}`
          }
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `📝 *リプライ案 (Copy & Paste)*:\n\`\`\`${match.suggestedReply}\`\`\``
          }
        },
        { type: 'divider' }
      ];

      await sendSlackAlert(blocks, slackToken, '#post-alerts');
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
