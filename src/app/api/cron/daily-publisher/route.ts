import { NextResponse } from 'next/server';
import { getQueueItems, updateQueueItem, QueueItem, getReelsFactoryEnv } from '@/lib/sheets';
import { TwitterApi } from 'twitter-api-v2';

export async function GET(req: Request) {
  // Cron Authenticity
  const reelsEnv = getReelsFactoryEnv();
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET || reelsEnv.CRON_SECRET || 'dev-secret';
  
  if (authHeader !== `Bearer ${cronSecret}` && process.env.NODE_ENV !== 'development') {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  console.log('🚀 Daily Publisher Cron Job Started.');

  try {
    const allItems = await getQueueItems();
    const today = new Date().toISOString().split('T')[0];

    // 対象のアイテム： status = 'approved' & scheduled_date <= today (or empty)
    // 予定日が古いもの順にソート（最古のものを優先）
    const eligibleItems = allItems
        .filter(item => item.status === 'approved' && (!item.scheduled_date || item.scheduled_date <= today))
        .sort((a, b) => (a.scheduled_date || '').localeCompare(b.scheduled_date || ''));

    // 設計要件「1日1投稿」を満たすため、最古の1件のみ（または各プラットフォーム最古1件）を取得
    // Architecture v3.0: "LIMIT 1とすることで自動担保"
    const targetItems = eligibleItems.length > 0 ? [eligibleItems[0]] : [];

    if (targetItems.length === 0) {
      console.log('ℹ️ No approved items found to publish for today.');
      return NextResponse.json({ success: true, message: 'No items to publish.' });
    }

    const processedResults = [];

    for (const item of targetItems) {
      console.log(`📡 Publishing [${item.type}] ${item.title}...`);
      let postUrl = '';
      let isSuccess = false;
      let errorDetail = '';

      try {
        if (item.type === 'x') {
          // Twitter V2 API で投稿
          const apiKey = process.env.TWITTER_API_KEY || reelsEnv.TWITTER_API_KEY || '';
          const apiSecret = process.env.TWITTER_API_SECRET || reelsEnv.TWITTER_API_SECRET || '';
          const accessToken = process.env.TWITTER_ACCESS_TOKEN || reelsEnv.TWITTER_ACCESS_TOKEN || '';
          const accessSecret = process.env.TWITTER_ACCESS_SECRET || reelsEnv.TWITTER_ACCESS_SECRET || '';

          if (apiKey && accessToken) {
            const client = new TwitterApi({
              appKey: apiKey,
              appSecret: apiSecret,
              accessToken: accessToken,
              accessSecret: accessSecret
            });

            // generation_recipe内に xPost 等があればそれを本文とする
            let textToPost = '';
            try {
              const recipe = JSON.parse(item.generation_recipe || '{}');
              textToPost = recipe.xPost || recipe.text || '';
            } catch (e) {
              textToPost = item.title;
            }

            if (!textToPost) throw new Error('投稿用テキストが空です');

            // 自動付与するリンクやハッシュタグ（設定が必要であれば追加）
            const finalTweet = `${textToPost}\n\n👇詳細はこちら\nhttps://www.google.com\n\n#プレコンセプションケア #不妊予防`;

            const tweetResult = await client.v2.tweet(finalTweet);
            postUrl = `https://twitter.com/user/status/${tweetResult.data.id}`;
            isSuccess = true;
          } else {
            throw new Error('Twitter API Keys are missing in Vercel environment.');
          }

        } else if (item.type === 'blog') {
          // ブログは Sheets の status を posted にするだけで
          // Next.js (mdx.ts) がそれを動的CMSとしてロードする仕様
          postUrl = `https://your-domain.com/blog/${item.title}`;
          isSuccess = true;

        } else if (item.type === 'carousel' || item.type === 'reel') {
          // MakeのWebhookへ発射してInstagram投稿を行う
          const makeWebhookUrl = process.env.MAKE_IG_PUBLISH_WEBHOOK_URL || reelsEnv.MAKE_IG_PUBLISH_WEBHOOK_URL;
          if (!makeWebhookUrl) {
            console.log(`⏭️ MAKE_IG_PUBLISH_WEBHOOK_URL not set. Skipping Instagram post for ${item.title} (Marking as posted for now).`);
            postUrl = 'https://instagram.com/pending';
            isSuccess = true;
          } else {
            console.log(`📡 Sending [${item.type}] to Make.com for Instagram publishing...`);
            
            let captionText = '';
            try {
              const recipe = JSON.parse(item.generation_recipe || '{}');
              captionText = recipe.captionText || recipe.text || item.title;
            } catch (e) {
              captionText = item.title;
            }

            const payload = {
              type: item.type,
              title: item.title,
              brand: item.brand || 'book',
              cloudinary_url: item.cloudinary_url,
              captionText: captionText
            };

            const response = await fetch(makeWebhookUrl, {
               method: 'POST',
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify(payload)
            });

            if (!response.ok) {
               throw new Error(`Make Webhook failed with status ${response.status}`);
            }

            postUrl = 'https://instagram.com/published_via_make';
            isSuccess = true;
          }
        }

        if (isSuccess) {
          await updateQueueItem(item.rowNumber, {
            status: 'posted',
            posted_at: new Date().toISOString(),
            post_url: postUrl
          });
          processedResults.push({ id: item.content_id, status: 'success', url: postUrl });
          console.log(`✅ Passed [${item.type}] ${item.title}`);
        }

      } catch (e: any) {
        console.error(`❌ Failed to publish ${item.title}:`, e.message);
        await updateQueueItem(item.rowNumber, {
          error_detail: e.message
        });
        processedResults.push({ id: item.content_id, status: 'error', reason: e.message });
      }
    }

    return NextResponse.json({
      success: true,
      processed: processedResults
    });

  } catch (error: any) {
    console.error('❌ Daily Publisher Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
