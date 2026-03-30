import { NextResponse } from 'next/server';
import { TwitterApi } from 'twitter-api-v2';
import { GoogleGenAI } from '@google/genai';
import { getReelsFactoryEnv } from '@/lib/sheets';

async function sendSlackAlert(blocks: any[], threadedText: string, SLACK_BOT_TOKEN: string, ALERT_CHANNEL: string) {
  if (!SLACK_BOT_TOKEN) return;
  try {
    const res = await fetch('https://slack.com/api/chat.postMessage', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SLACK_BOT_TOKEN}`
      },
      body: JSON.stringify({ channel: ALERT_CHANNEL, text: '🚨 TTCコミュニティ サポート要請', blocks })
    });
    const data = await res.json();
    if (!data.ok) return console.error('Slack alert failed:', data.error);

    if (threadedText && data.ts) {
      await fetch('https://slack.com/api/chat.postMessage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SLACK_BOT_TOKEN}`
        },
        body: JSON.stringify({ channel: ALERT_CHANNEL, thread_ts: data.ts, text: threadedText })
      });
    }
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

    // 検索クエリ: TTCコミュニティのSOSや幅広い妊活の悩み・過程を狙う
    const query = '(#TTC OR #TTCcommunity OR #IVFjourney OR TWW OR "two week wait" OR BFN OR BFP OR IVF OR IUI OR "egg retrieval" OR "Baby dust") -is:retweet -is:reply lang:en';
    
    console.log(`🔍 Searching X with query: ${query}`);
    const searchResult = await client.v2.search(query, {
      max_results: 100, // 英語圏からより広く母集団を集めるため最大化
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
以下のツイートリストから、中の人（専門医・サポーター）が手動でリプライし、温かく寄り添うべき案件を【必ず5件】抽出・報告してください。

【抽出対象】
1. ちょっとした妊活の悩みや、「TWW（判定待ち）」の不安、「AF（生理）」が来て落ち込んでいる当事者。絶望や緊急性がなくても、少し寄り添えば前向きになれそうなもの。
2. クリニック通いやサプリ、採卵(Egg retrieval)・移植(Transfer)・人工授精(IUI)・体外受精(IVF)などのプロセスについて医学的・一般的な疑問や進捗を呟いている人。
3. これから治療を始める、または結果を待つにあたって誰かの応援（Baby dust）を必要としている人。

【リプライの3原則】
1. 短文徹底（Short & Sweet）: 1〜2文、最大でも140文字以内に収めること。長々とした励ましや自己語りは「説教」に聞こえるためNGです。
2. 解決策を提示しない（Validation）: 相手が求めていない限り一切のアドバイス（このサプリがいい等）はせず、「今、あなたが辛いのは当然だ。私はそれを見ているよ（I see you）」という感情の肯定に徹すること。（Toxic Positivityの排除）
3. 専門用語（Lingo）と絵文字を活用: 🫂, 🍍, ✨, 🤍 などのTTC界隈で連帯を示す絵文字を短文の中に適切に混ぜること。

【状況別の返答テンプレート（AIへの指示）】
● 相手が「陰性（BFN）」や「生理（AF）」で落ち込んでいる時：
- 必須要素：謝罪（I'm sorry）、ハグ（🫂）、セルフケアの推奨。
- 案: "I'm so incredibly sorry. AF day is the absolute worst. 💔 Take some extra time for yourself today. Sending you a huge virtual hug. 🫂🍍"

● 相手が「判定待ち（TWW）」で不安な時：
- 必須要素：共感（TWW is brutal）、幸運の祈り（Baby dust）。
- 案: "The TWW is the ultimate test of patience. 🕰️ Distract yourself with something fun today! Sending you so much baby dust. ✨🍍🤍"

● 相手が「通院や注射」で疲れている時：
- 必須要素：賞賛（Warrior）、連帯（You've got this）。
- 案: "You are a total IVF warrior. 💉💪 Those shots are no joke. Hang in there, you've got this! 🍍✨"

【❌ 絶対に除外する条件・NGワード】
- 言葉遣いが悪すぎる、または攻撃的（Toxic）なポスト、他者への誹謗中傷、宣伝目的、スパム。
- 以下のワードは「Toxic Positivity（有害な前向きさ）」となるため絶対に使わないこと:
  "Don't worry"（心配しないで）
  "Just relax"（リラックスして）
  "Next time for sure"（次は確実だよ）
- 発信者は「男性の生殖医療専門医」という点も意識し、過度なハート絵文字（💕など）の乱用は避けること（ただし上記のテンプレート内の🤍や💔は使用可）。

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
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*🚨 @${match.username} がSOSを発信中*\n_${match.summaryJp}_\n\n🔗 <${tweetUrl}|元の投稿を開く>\n\n*👇 リプライ用英文 (Copy & Paste)*:\n\`\`\`${match.suggestedReplyEn}\`\`\`\n_(※選定理由や和訳はスレッドに記載)_`
          }
        }
      ];

      const threadedText = `*💡 選定理由*\n${match.reasonJp}\n\n*💬 返信案の和訳*\n${match.suggestedReplyJp}`;

      await sendSlackAlert(blocks, threadedText, slackToken, '#ttcpreconception_co');
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
