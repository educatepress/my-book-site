import { NextResponse } from 'next/server';
import { getQueueItems, updateQueueItem, QueueItem, getReelsFactoryEnv } from '@/lib/sheets';
import { TwitterApi } from 'twitter-api-v2';
import { withRetry, sendSlackErrorAlert } from '@/lib/retry';

export const maxDuration = 300;

/**
 * GitHub APIを用いて指定リポジトリのパスにファイルをコミット（作成・更新）する
 */
async function pushToGithub(token: string, owner: string, repo: string, path: string, content: string, message: string) {
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github.v3+json',
  };

  let sha = undefined;
  // Check if file exists to get its SHA for updating
  const getRes = await fetch(url, { headers });
  if (getRes.ok) {
    const data = await getRes.json();
    sha = data.sha;
  }

  // To support UTF-8 strings accurately in Base64
  const utf8Buffer = Buffer.from(content, 'utf8');
  const base64Content = utf8Buffer.toString('base64');

  const payload = {
    message,
    content: base64Content,
    sha
  };

  const putRes = await fetch(url, {
    method: 'PUT',
    headers,
    body: JSON.stringify(payload)
  });

  if (!putRes.ok) {
    const errorText = await putRes.text();
    throw new Error(`GitHub API Error (${putRes.status}): ${errorText}`);
  }
}

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
    const dt = new Date(new Date().getTime() + 9 * 3600 * 1000);
    const today = dt.toISOString().split('T')[0];

    // 対象のアイテム： status = 'approved' & scheduled_date === today 
    // 古い「エラーで詰まっていた未処理データ」を無視して「今日のテーマ」だけを狙い撃ちする
    const eligibleItems = allItems
        .filter(item => item.status === 'approved' && item.scheduled_date === today && (!item.brand || item.brand === 'book'));

    // 設計要件「1日につき X(1件) + Blog(1件) + Instagram(リールかカルーセル1件) を並行して一気に同時投稿する」
    const targetItems: typeof eligibleItems = [];
    
    const xItem = eligibleItems.find(item => item.type === 'x');
    if (xItem) targetItems.push(xItem);
    
    const blogItem = eligibleItems.find(item => item.type === 'blog');
    if (blogItem) targetItems.push(blogItem);
    
    const igItem = eligibleItems.find(item => item.type === 'reel' || item.type === 'carousel');
    if (igItem) targetItems.push(igItem);

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

            // リンクなどを付与する場合（省略可能・AIが生成済みならそのまま使用）
            const blogUrl = 'https://ttcguide.co/blog';
            const finalTweet = textToPost.includes('http') ? textToPost : `${textToPost}\n\n👇Read More\n${blogUrl}`;

            const tweetResult = await withRetry(
              () => client.v2.tweet(finalTweet),
              'daily-publisher/Twitter',
              { maxAttempts: 2, baseDelayMs: 5000 }
            );
            postUrl = `https://twitter.com/user/status/${tweetResult.data.id}`;
            isSuccess = true;
          } else {
            throw new Error('Twitter API Keys are missing in Vercel environment.');
          }

        } else if (item.type === 'blog') {
          // --- Phase 6: GitHub Auto-Commit ---
          const githubToken = process.env.GITHUB_TOKEN || reelsEnv.GITHUB_TOKEN;
          
          if (!githubToken) {
            throw new Error('GITHUB_TOKEN not set. Cannot push blog to GitHub.');
          } else {
            console.log(`🐙 Pushing [blog] ${item.title} to GitHub...`);
            
            let jpContent = '';
            let enContent = '';
            try {
              const recipe = JSON.parse(item.generation_recipe || '{}');
              jpContent = recipe.jpBlog || '';
              enContent = recipe.enBlog || '';
            } catch (e) {
              console.error('Failed to parse generation_recipe for blog:', e);
            }

            if (!jpContent && !enContent) {
              throw new Error('ブログのコンテンツ(jpBlog/enBlog)が空です。');
            }

            const commitMessage = `Auto-publish: ${item.title}`;
            let pushedTo = '';
            const owner = 'educatepress';
            const repo = 'my-book-site';

            if (jpContent) {
               const targetPath = `src/content/blog/jp/${item.title}.mdx`;
               await withRetry(
                 () => pushToGithub(githubToken, owner, repo, targetPath, jpContent, commitMessage),
                 'daily-publisher/GitHub-JP',
                 { maxAttempts: 2, baseDelayMs: 3000 }
               );
               pushedTo = `https://github.com/${owner}/${repo}/blob/main/${targetPath}`;
            }

            if (enContent) {
               const targetPath = `src/content/blog/en/${item.title}.mdx`;
               await withRetry(
                 () => pushToGithub(githubToken, owner, repo, targetPath, enContent, commitMessage),
                 'daily-publisher/GitHub-EN',
                 { maxAttempts: 2, baseDelayMs: 3000 }
               );
               if (!pushedTo) pushedTo = `https://github.com/${owner}/${repo}/blob/main/${targetPath}`;
            }

            postUrl = pushedTo || 'https://github.com/published';
            isSuccess = true;
          }

        } else if (item.type === 'carousel' || item.type === 'reel') {
          // MakeのWebhookへ発射してInstagram投稿を行う
          const makeWebhookUrl = process.env.MAKE_IG_PUBLISH_WEBHOOK_URL || process.env.MAKE_PUBLISH_WEBHOOK_URL || reelsEnv.MAKE_IG_PUBLISH_WEBHOOK_URL || reelsEnv.MAKE_PUBLISH_WEBHOOK_URL;

          if (!makeWebhookUrl) {
            throw new Error('MAKE_PUBLISH_WEBHOOK_URL not set. Cannot post to Instagram.');
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

            await withRetry(
              async () => {
                const response = await fetch(makeWebhookUrl, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(payload)
                });
                if (!response.ok) {
                  const err: any = new Error(`Make Webhook failed with status ${response.status}`);
                  err.status = response.status;
                  throw err;
                }
              },
              'daily-publisher/Make.com',
              { maxAttempts: 2, baseDelayMs: 5000 }
            );

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
    const slackToken = process.env.SLACK_BOT_TOKEN || reelsEnv.SLACK_BOT_TOKEN || '';
    const slackChannel = process.env.SLACK_CHANNEL_ID || reelsEnv.SLACK_CHANNEL_ID || '';
    await sendSlackErrorAlert(slackToken, slackChannel, 'daily-publisher', error.message || String(error));
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
