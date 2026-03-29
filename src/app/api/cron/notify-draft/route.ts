// =============================================================
// Draft Notification API
// パス: src/app/api/cron/notify-draft/route.ts
// 役割: 生成された原稿をSlackに通知し、承認待ち状態にする
// Vercel Cronから呼び出す（毎日1回）
// =============================================================

import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL!;
// Vercel KVを使う場合はここにKVクライアントを追加
// import { kv } from '@vercel/kv';

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  // approved-queue.json からペンディング中の原稿を取得
  // 本番ではVercel KVを使うが、まずファイルベースで実装
  const queuePath = path.join(process.cwd(), 'content-approval-queue.json');
  if (!fs.existsSync(queuePath)) {
    return NextResponse.json({ status: 'no_queue', message: 'キューファイルが存在しません' });
  }

  const queue = JSON.parse(fs.readFileSync(queuePath, 'utf8'));
  const pending = queue.filter((item: any) => item.status === 'pending');

  if (pending.length === 0) {
    return NextResponse.json({ status: 'no_pending', message: '承認待ちの原稿はありません' });
  }

  // 最も古い承認待ち原稿を選択
  const item = pending[0];

  const blocks = buildSlackBlocks(item);

  if (SLACK_WEBHOOK_URL) {
    await fetch(SLACK_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ blocks }),
    });
  }

  return NextResponse.json({ status: 'notified', item });
}

function buildSlackBlocks(item: any): any[] {
  const blocks: any[] = [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: `📋 新しい原稿が届きました（${item.type === 'blog' ? 'ブログ' : item.type === 'x' ? 'X投稿' : item.type}）`,
      },
    },
    { type: 'divider' },
    {
      type: 'section',
      fields: [
        { type: 'mrkdwn', text: `*テーマ:*\n${item.theme}` },
        { type: 'mrkdwn', text: `*生成日:*\n${item.createdAt}` },
        { type: 'mrkdwn', text: `*種別:*\n${item.type}` },
        { type: 'mrkdwn', text: `*ID:*\n${item.id}` },
      ],
    },
  ];

  // ブログ記事の場合
  if (item.type === 'blog') {
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*📝 記事タイトル:*\n${item.jpTitle}\n\n*🌐 英語版（日本語訳）:*\n${item.enTitleJa}\n\n*📄 本文プレビュー（冒頭300文字）:*\n${item.jpExcerpt}`,
      },
    });
  }

  // X投稿の場合
  if (item.type === 'x') {
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*🐦 JP投稿文:*\n${item.jpPost}\n\n*🌐 EN投稿文（日本語訳）:*\n${item.enPostJa}`,
      },
    });
    blocks.push({
      type: 'actions',
      elements: [
        {
          type: 'button',
          text: { type: 'plain_text', text: '✨ この案でそのままポストする (Xアプリ起動)', emoji: true },
          style: 'primary',
          url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(item.jpPost)}`
        }
      ]
    });
  }

  // リール/カルーセルの場合
  if (item.type === 'reel' || item.type === 'carousel') {
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*🎞 タイトル（英語）:*\n${item.title}\n\n*📌 内容（日本語訳）:*\n${item.summaryJa}\n\n*🔗 ファイルパス:*\n\`${item.filePath}\``,
      },
    });
    // Slackにmp4/画像をリンクとして添付（Slackからプレビュー可能）
    if (item.slackFileUrl) {
      blocks.push({
        type: 'section',
        text: { type: 'mrkdwn', text: `*👀 プレビュー:* ${item.slackFileUrl}` },
      });
    }
  }

  blocks.push({ type: 'divider' });
  blocks.push({
    type: 'section',
    text: {
      type: 'mrkdwn',
      text: `✅ 承認する場合は以下のリンクから：\nhttps://ttcguide.co/api/approve?id=${item.id}&token=${item.approvalToken}\n\n❌ 却下する場合：\nhttps://ttcguide.co/api/approve?id=${item.id}&token=${item.approvalToken}&action=reject`,
    },
  });
  blocks.push({
    type: 'context',
    elements: [{ type: 'mrkdwn', text: `承認リンクをクリックするだけで投稿予約が完了します 🚀` }],
  });

  return blocks;
}
