// =============================================================
// draft-to-queue.ts
// 役割: 生成した原稿をキューに登録し、Slackに承認依頼を送る
// 使い方: npx ts-node scripts/patrol/draft-to-queue.ts
// write-blog-from-queue.ts や write-x-from-queue.ts から
// 生成完了後に呼び出すことを想定
// =============================================================

import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const QUEUE_PATH = path.join(process.cwd(), 'content-approval-queue.json');
const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL || '';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://ttcguide.co';

// ブログ原稿をキューに追加
export async function enqueueBlog(params: {
  theme: string;
  slug: string;
  jpTitle: string;
  jpExcerpt: string;
  enTitle: string;
  enTitleJa: string; // Claudeが日本語訳したタイトル
  postDate: string;
}) {
  const item = {
    id: `blog-${params.slug}-${Date.now()}`,
    type: 'blog' as const,
    status: 'pending',
    createdAt: new Date().toISOString(),
    approvalToken: crypto.randomBytes(16).toString('hex'),
    ...params,
  };
  addToQueue(item);
  await sendSlackNotification(item);
  console.log(`📬 ブログ原稿をキューに追加: ${item.id}`);
  return item;
}

// X投稿原稿をキューに追加
export async function enqueueXPost(params: {
  theme: string;
  jpPost: string;
  enPost: string;
  enPostJa: string; // Claudeが日本語訳した英語投稿
}) {
  const item = {
    id: `x-${Date.now()}`,
    type: 'x' as const,
    status: 'pending',
    createdAt: new Date().toISOString(),
    approvalToken: crypto.randomBytes(16).toString('hex'),
    ...params,
  };
  addToQueue(item);
  await sendSlackNotification(item);
  console.log(`📬 X投稿原稿をキューに追加: ${item.id}`);
  return item;
}

// リール/カルーセル原稿をキューに追加
export async function enqueueReel(params: {
  type: 'reel' | 'carousel';
  title: string;
  summaryJa: string; // 日本語でのあらすじ
  filePath: string;  // ローカルパス（.mp4 or .png）
  captionPath: string;
  slackFileUrl?: string; // Slackにアップロードした後のURL
}) {
  const item = {
    id: `${params.type}-${Date.now()}`,
    status: 'pending',
    createdAt: new Date().toISOString(),
    approvalToken: crypto.randomBytes(16).toString('hex'),
    ...params,
  };
  addToQueue(item);
  await sendSlackNotification(item);
  console.log(`📬 ${params.type}原稿をキューに追加: ${item.id}`);
  return item;
}

// ──────────────────────────────────────────────────────────────
// 内部関数
// ──────────────────────────────────────────────────────────────

function addToQueue(item: any) {
  let queue: any[] = [];
  if (fs.existsSync(QUEUE_PATH)) {
    queue = JSON.parse(fs.readFileSync(QUEUE_PATH, 'utf8'));
  }
  queue.push(item);
  fs.writeFileSync(QUEUE_PATH, JSON.stringify(queue, null, 2), 'utf8');
}

async function sendSlackNotification(item: any) {
  if (!SLACK_WEBHOOK_URL) {
    console.warn('⚠️ SLACK_WEBHOOK_URL が未設定のため通知を省略');
    return;
  }

  const approveUrl = `${SITE_URL}/api/approve?id=${item.id}&token=${item.approvalToken}`;
  const rejectUrl = `${SITE_URL}/api/approve?id=${item.id}&token=${item.approvalToken}&action=reject`;

  const typeLabel = {
    blog: '📝 ブログ記事',
    x: '🐦 X投稿',
    reel: '🎞 リール動画',
    carousel: '🎠 カルーセル',
  }[item.type as string] || item.type;

  const blocks: any[] = [
    {
      type: 'header',
      text: { type: 'plain_text', text: `${typeLabel} — 承認をお願いします` },
    },
    { type: 'divider' },
    {
      type: 'section',
      fields: [
        { type: 'mrkdwn', text: `*テーマ:*\n${item.theme || item.title}` },
        { type: 'mrkdwn', text: `*生成日時:*\n${new Date().toLocaleString('ja-JP')}` },
      ],
    },
  ];

  // コンテンツのプレビュー
  if (item.type === 'blog') {
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*タイトル（JP）:* ${item.jpTitle}\n*英語版タイトル（日本語訳）:* ${item.enTitleJa}\n\n*📄 本文冒頭:*\n${(item.jpExcerpt || '').slice(0, 200)}…`,
      },
    });
  }
  if (item.type === 'x') {
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*JP投稿:*\n${item.jpPost}\n\n*英語版（日本語訳）:*\n${item.enPostJa}`,
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
  if (item.type === 'reel' || item.type === 'carousel') {
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*タイトル:* ${item.title}\n*内容（日本語）:*\n${item.summaryJa}${item.slackFileUrl ? `\n\n*👀 プレビュー:* ${item.slackFileUrl}` : ''}`,
      },
    });
  }

  // 承認ボタン（Interactive Block Kit）
  blocks.push({ type: 'divider' });
  blocks.push({
    type: 'actions',
    elements: [
      {
        type: 'button',
        text: { type: 'plain_text', text: '✅ この案で承認', emoji: true },
        style: 'primary',
        action_id: 'approve_content',
        value: JSON.stringify({ id: item.id, p: 'webpage.new' })
      },
      {
        type: 'button',
        text: { type: 'plain_text', text: '❌ 却下 / リライト指示', emoji: true },
        style: 'danger',
        action_id: 'reject_content',
        value: JSON.stringify({ id: item.id, p: 'webpage.new' })
      }
    ]
  });

  await fetch(SLACK_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ blocks }),
  });
}

// ──────────────────────────────────────────────────────────────
// CLI実行時のサンプル動作（テスト用）
// ──────────────────────────────────────────────────────────────
if (require.main === module) {
  (async () => {
    console.log('🧪 テスト通知を送信します...');
    await enqueueXPost({
      theme: '葉酸のプレコンセプションケアにおける重要性',
      jpPost: '妊娠を希望するなら、葉酸は妊娠前から毎日400μg。赤ちゃんの神経管形成は妊娠超初期に完了します。#プレコンセプションケア',
      enPost: 'Planning to conceive? Start folic acid 400μg daily—before pregnancy. Neural tube formation completes in early weeks. #PreconceptionCare',
      enPostJa: '（英語版の日本語訳）妊娠を計画しているなら、妊娠前から毎日葉酸を400μg飲みましょう。神経管の形成は妊娠初期の数週間で完了します。#プレコンセプションケア',
    });
    console.log('✅ テスト通知完了！Slackを確認してください');
  })();
}
