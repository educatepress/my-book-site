import { NextResponse } from 'next/server';
import { runPrePostAudit } from '@/lib/patrol/pre-audit';
import fs from 'fs';

import { getReelsFactoryEnv } from '@/lib/sheets';
import { brandBadge } from '@/lib/brand';

async function sendSlackAlert(message: string, SLACK_BOT_TOKEN: string, ALERT_CHANNEL: string) {
  if (!SLACK_BOT_TOKEN) {
    console.error('[Pre-Patrol] Slack Token missing. Alert:', message);
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
        text: `🚨 *【事前パトロール: コンプライアンス警告】*\n${message}`
      })
    });
  } catch (e) {
    console.error('[Pre-Patrol] Failed to send Slack alert:', e);
  }
}

// ============================================================================
// Pre-Post Patrol Route
// ============================================================================
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { content, title, type, brand } = body;

    if (!content) {
      return NextResponse.json({ error: 'Missing content field' }, { status: 400 });
    }

    console.log(`🕵️‍♂️ Running Pre-Post Patrol for: [${type}] ${title || 'Unnamed'}`);

    // Claude APIによるコンプライアンス監査
    const result = await runPrePostAudit(content);

    // 監査NGの場合、Slackへ警告を送信
    if (result.status === 'ng') {
      const reelsEnv = getReelsFactoryEnv();
      const SLACK_BOT_TOKEN = process.env.SLACK_BOT_TOKEN || reelsEnv.SLACK_BOT_TOKEN || '';
      const badge = brandBadge(brand);
      const targetChannel = brand === 'atelier' ? '#skin-atelier' : '#ttcpreconception_co';

      const alertMsg = `【配信先: ${badge}】\nコンテンツ: *${title || '名称未設定'}* (${type || '種別不明'})\n判定: ❌ ガイドライン違反\n理由:\n\`\`\`\n${result.reason}\n\`\`\``;
      await sendSlackAlert(alertMsg, SLACK_BOT_TOKEN, targetChannel);
      console.warn('❌ Pre-patrol failed:', result.reason);
    } else {
      console.log('✅ Pre-patrol passed!');
    }

    return NextResponse.json({
      success: true,
      auditResult: result
    });

  } catch (error: any) {
    console.error('Pre-Patrol Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
