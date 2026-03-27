import { NextResponse } from 'next/server';
import { getSheetsRows, updateSheetRow } from '@/lib/sheets-rest';
import { getEnvVar } from '@/lib/env-helper';

const MAKE_PUBLISH_WEBHOOK_URL = getEnvVar('MAKE_PUBLISH_WEBHOOK_URL');

export async function GET(req: Request) {
  // 1. Cron セキュリティ認証（Vercelからしか実行できないようにする設定）
  const authHeader = req.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    // ローカルテスト用の一時的なパススルー
    if (process.env.NODE_ENV !== 'development') {
      return new Response('Unauthorized', { status: 401 });
    }
  }

  try {
    console.log('[Daily Publisher] Starting Vercel Cron execution...');
    
    // 2. Google Sheets からコンテンツを取得
    const rows = await getSheetsRows();

    // 3. 今日の日付より前の "approved" なコンテンツをフィルタリング
    // 今日より前の予定日、あるいはスケジュール空欄のものを取得
    const today = new Date().toISOString().split('T')[0];
    
    const candidates = rows.filter((row: any) => {
      const isApproved = row.status === 'approved';
      const isScheduledOrPast = !row.scheduled_date || row.scheduled_date <= today;
      return isApproved && isScheduledOrPast;
    });

    if (candidates.length === 0) {
      console.log('[Daily Publisher] 投稿すべきコンテンツがありませんでした');
      return NextResponse.json({ message: 'No content to publish today.' });
    }

    // 一番古いもの（リストの一番上）を1つだけ選ぶ
    const target = candidates[0];
    console.log(`[Daily Publisher] Target selected: ${target.content_id} (${target.title}) - Type: ${target.type}`);

    // 4. コンテンツごとの Make(Instagram) トリガー送信
    let captionText = '投稿テスト\n#プレコンセプションケア'; // デフォルト
    try {
      const recipe = JSON.parse(target.generation_recipe || '{}');
      if (recipe.captionText) captionText = recipe.captionText;
    } catch (e) {}

    // Make に飛ばすデータを構築（軽めのテキストだけを飛ばす！ファイルはMakeに送らない）
    const publishPayload = {
      content_id: target.content_id,
      type: target.type,
      cloudinary_url: target.cloudinary_url,     // 1つのURL、またはカルーセルならJSON文字列
      cloudinary_public_id: target.cloudinary_public_id,
      caption: captionText
    };

    if (MAKE_PUBLISH_WEBHOOK_URL) {
      const res = await fetch(MAKE_PUBLISH_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(publishPayload)
      });
      if (!res.ok) {
        throw new Error(`Make Webhook Error: ${await res.text()}`);
      }
      console.log(`[Daily Publisher] ✅ Make Webhookの発火に成功しました`);
    } else {
      console.warn('[Daily Publisher] ⚠️ MAKE_PUBLISH_WEBHOOK_URL が未設定のため、Makeへの通知をスキップしました');
    }

    // 5. データベース（Google Sheets）の更新
    // ステータスを 'posted' にし、投稿時間を打刻する
    await updateSheetRow(target.content_id, {
      status: 'posted',
      posted_at: new Date().toISOString()
    });
    
    console.log(`[Daily Publisher] 行を "posted" に更新しました: ${target.content_id}`);

    return NextResponse.json({ 
      success: true, 
      published: target.content_id,
      message: 'Successfully deployed daily post to Make and Google Sheets'
    });

  } catch (error: any) {
    console.error('[Daily Publisher] 致命的なエラー:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
