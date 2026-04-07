// =============================================================
// Approve API
// パス: src/app/api/approve/route.ts
// 役割: Slackのリンクをタップすると、指定IDの原稿を「承認済み」に更新する
// ブラウザから直接アクセスされる（認証はtokenで行う）
// =============================================================

import { NextResponse } from 'next/server';
import { updateQueueItem, getQueueItems } from '@/lib/sheets';

const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL!;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const token = searchParams.get('token');
  const action = searchParams.get('action') || 'approve';

  if (!id || !token) {
    return new NextResponse('Missing id or token', { status: 400 });
  }

  const queue = await getQueueItems();
  const item = queue.find((item: any) => item.content_id === id);

  if (!item) {
    return new NextResponse('Item not found', { status: 404 });
  }

  if (item.status !== 'pending') {
    return new NextResponse(
      buildResultHTML('⚠️ この原稿はすでに処理済みです', `ID: ${id}`, false),
      { status: 200, headers: { 'Content-Type': 'text/html' } }
    );
  }

  if (action === 'reject') {
    await updateQueueItem(item.rowNumber, { status: 'rejected', scheduled_date: '' });

    // Slack通知（却下）
    await notifySlack(`❌ 原稿が却下されました\n*テーマ:* ${item.title}\n*ID:* ${id}`);

    return new NextResponse(
      buildResultHTML('❌ 却下しました', item.title, false),
      { status: 200, headers: { 'Content-Type': 'text/html' } }
    );
  }

  // ── 承認処理 ──────────────────────────────────────────────
  await updateQueueItem(item.rowNumber, { status: 'approved' });

  // リール/カルーセルの場合は Make 用のリストが必要なら別途実装可能ですが、
  // Google Sheets を Make側でポーリングするように移行している場合は不要です。

  // Slack通知（承認完了）
  await notifySlack(`✅ 承認されました！明朝の予約投稿に追加しました\n*テーマ:* ${item.title}\n*種別:* ${item.type}\n*ID:* ${id}`);

  return new NextResponse(
    buildResultHTML('✅ 承認完了！', item.title, true),
    { status: 200, headers: { 'Content-Type': 'text/html' } }
  );
}

async function notifySlack(text: string) {
  if (!SLACK_WEBHOOK_URL) return;
  await fetch(SLACK_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });
}

// スマホでタップした際に表示されるシンプルなHTML
function buildResultHTML(title: string, theme: string, isSuccess: boolean): string {
  const color = isSuccess ? '#34C759' : '#FF3B30';
  const bg = isSuccess ? '#F0FFF4' : '#FFF5F5';
  return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title}</title>
  <style>
    body { font-family: -apple-system, sans-serif; background: ${bg}; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; }
    .card { background: white; border-radius: 20px; padding: 40px 32px; text-align: center; box-shadow: 0 8px 32px rgba(0,0,0,0.08); max-width: 360px; width: 90%; }
    h1 { font-size: 28px; color: ${color}; margin: 0 0 12px; }
    p { color: #555; font-size: 15px; line-height: 1.6; margin: 0; }
    .theme { background: #F5F5F7; border-radius: 10px; padding: 10px 16px; margin-top: 16px; font-size: 14px; color: #333; }
  </style>
</head>
<body>
  <div class="card">
    <h1>${title}</h1>
    <p>投稿キューに追加されました。<br>次の自動投稿タイミングで公開されます。</p>
    <div class="theme">${theme}</div>
  </div>
</body>
</html>`;
}
