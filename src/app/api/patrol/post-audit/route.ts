import { NextResponse } from 'next/server';
import { TwitterApi } from 'twitter-api-v2';
import fs from 'fs';

// Helper to extract env vars directly from reels-factory during transition phase
function getReelsFactoryEnv() {
  const envPath = '/Users/satoutakuma/Desktop/reels-factory/.env';
  if (!fs.existsSync(envPath)) return {};
  const content = fs.readFileSync(envPath, 'utf8');
  const env: Record<string, string> = {};
  content.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      env[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, '');
    }
  });
  return env;
}

// --- Helpers ---

async function sendSlackAlert(message: string, SLACK_BOT_TOKEN: string, ALERT_CHANNEL: string) {
  if (!SLACK_BOT_TOKEN) {
    console.error('[Patrol] Slack Token missing. Alert:', message);
    return;
  }
  try {
    await fetch('https://slack.com/api/chat.postMessage', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SLACK_BOT_TOKEN}`
      },
      body: JSON.stringify({
        channel: ALERT_CHANNEL,
        text: `🚨 *【AIパトロール警告: 稼働異常検知】*\n${message}`
      })
    });
  } catch (e) {
    console.error('[Patrol] Failed to send Slack alert:', e);
  }
}

// ============================================================================
// Main Patrol Route
// ============================================================================
export async function GET(req: Request) {
  const reelsEnv = getReelsFactoryEnv();
  const SLACK_BOT_TOKEN = process.env.SLACK_BOT_TOKEN || reelsEnv.SLACK_BOT_TOKEN || '';
  const ALERT_CHANNEL = '#post-alerts';
  
  const apiKey = process.env.TWITTER_API_KEY || '';
  const apiSecret = process.env.TWITTER_API_SECRET || '';
  const accessToken = process.env.TWITTER_ACCESS_TOKEN || '';
  const accessSecret = process.env.TWITTER_ACCESS_SECRET || '';

  // Ensure Cron request authenticity (only allow Vercel or authorized keys)
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET || 'dev-secret';
  
  if (authHeader !== `Bearer ${cronSecret}` && process.env.NODE_ENV !== 'development') {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const reports: string[] = [];
  let isHealthy = true;

  console.log('🕵️‍♂️ Starting Post-Post Patrol Audit...');

  // ---------------------------------------------------------
  // 1. Audit Blog (Webpage status check)
  // ---------------------------------------------------------
  try {
    const host = req.headers.get('host') || 'localhost:3000';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    
    // DEV環境での自己Fetchによるデッドロックを回避
    if (host.includes('localhost')) {
      reports.push('✅ Blog Site: 稼働中 (ローカルスキップ)');
    } else {
      const blogUrl = `${protocol}://${host}/blog`;
      const blogRes = await fetch(blogUrl, { method: 'HEAD' });
      if (!blogRes.ok) {
        throw new Error(`Blog returned status ${blogRes.status}`);
      }
      reports.push('✅ Blog Site: 稼働中 (200 OK)');
    }
  } catch (error: any) {
    isHealthy = false;
    reports.push(`❌ Blog Site: アクセスエラー - ${error.message}`);
  }

  // ---------------------------------------------------------
  // 2. Audit Twitter (X) - Check for recent post
  // ---------------------------------------------------------
  if (apiKey && accessToken) {
    try {
      const client = new TwitterApi({
        appKey: apiKey,
        appSecret: apiSecret,
        accessToken: accessToken,
        accessSecret: accessSecret
      });
      
      const me = await client.v2.me();
      if (!me?.data?.id) throw new Error('Twitter Auth failed (No User ID)');

      const timeline = await client.v2.userTimeline(me.data.id, {
        max_results: 5,
        'tweet.fields': ['created_at']
      });

      const tweets = timeline.data.data;
      if (!tweets || tweets.length === 0) {
        throw new Error('アカウントに投稿が一件も見つかりません。');
      }

      // Check if the latest tweet is within the last 28 hours (to be safe with cron jobs)
      const latestTweet = tweets[0];
      const tweetDate = new Date(latestTweet.created_at || '');
      const now = new Date();
      const diffHours = (now.getTime() - tweetDate.getTime()) / (1000 * 60 * 60);

      if (diffHours > 28) {
        isHealthy = false;
        reports.push(`❌ X (Twitter): 最終投稿から ${Math.round(diffHours)} 時間経過しています（投稿失敗の可能性）`);
      } else {
        reports.push(`✅ X (Twitter): 稼働中（最新投稿: ${Math.round(diffHours)} 時間前）`);
      }
    } catch (error: any) {
      isHealthy = false;
      reports.push(`❌ X (Twitter): API取得エラー - ${error.message}`);
    }
  } else {
    reports.push(`⚠️ X (Twitter): API Key未設定のためスキップ`);
  }

  // ---------------------------------------------------------
  // 3. Audit Instagram via Make.com Webhook
  // ---------------------------------------------------------
  const makeWebhookUrl = process.env.MAKE_PATROL_WEBHOOK_URL || reelsEnv.MAKE_PATROL_WEBHOOK_URL;
  
  if (makeWebhookUrl) {
    try {
      console.log('Calling Make.com Webhook for Instagram patrol...');
      // タイムアウト設定付きでMakeを叩く（Make側で最新リールを取得して返す仕組み）
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10秒タイムアウト

      const makeRes = await fetch(makeWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action: 'check_latest_post' }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (!makeRes.ok) {
        throw new Error(`Make.com HTTP Error: ${makeRes.status}`);
      }
      
      const makeData = await makeRes.json();
      // 期待するレスポンス: { "status": "success", "latestPostDate": "2026-03-25T10:00:00Z" }
      
      if (makeData.status === 'success' && makeData.latestPostDate) {
        const postDate = new Date(makeData.latestPostDate);
        const diffHours = (new Date().getTime() - postDate.getTime()) / (1000 * 60 * 60);
        
        if (diffHours > 28) {
          isHealthy = false;
          reports.push(`❌ Instagram: 最終投稿から ${Math.round(diffHours)} 時間経過しています（投稿失敗の可能性）`);
        } else {
          reports.push(`✅ Instagram: 稼働中（最新投稿: ${Math.round(diffHours)} 時間前）`);
        }
      } else {
        isHealthy = false;
        reports.push(`❌ Instagram: Makeからの応答が不正です - ${JSON.stringify(makeData)}`);
      }
    } catch (error: any) {
      isHealthy = false;
      reports.push(`❌ Instagram: Makeとの通信エラー - ${error.message}`);
    }
  } else {
    reports.push(`⏳ Instagram: MAKE_PATROL_WEBHOOK_URL が未設定のためスキップ`);
  }

  // --- Final Evaluation & Alerting ---
  const summaryText = reports.join('\n');
  console.log(summaryText);

  if (!isHealthy) {
    console.error('🚨 Patrol detected errors! Alerting Slack...');
    await sendSlackAlert(summaryText, SLACK_BOT_TOKEN, ALERT_CHANNEL);
  }

  return NextResponse.json({
    status: isHealthy ? 'pass' : 'fail',
    timestamp: new Date().toISOString(),
    reports
  });
}
