import { NextResponse } from 'next/server';
import { getEnvVar } from '@/lib/env-helper';
import { updateSheetRow } from '@/lib/sheets-rest';

const SLACK_BOT_TOKEN = getEnvVar('SLACK_BOT_TOKEN');
const MAKE_PUBLISH_WEBHOOK_URL = process.env.MAKE_PUBLISH_WEBHOOK_URL || '';

async function updateSlackMessage(channel: string, ts: string, text: string, blocks: any[]) {
  if (!SLACK_BOT_TOKEN) {
    console.error('[updateSlackMessage] No Slack Bot Token found.');
    return;
  }
  const res = await fetch('https://slack.com/api/chat.update', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SLACK_BOT_TOKEN}`
    },
    body: JSON.stringify({ channel, ts, text, blocks })
  });
  const data = await res.json();
  if (!data.ok) {
    console.error('[updateSlackMessage] Failed:', data.error);
  }
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const payloadStr = formData.get('payload');

    if (!payloadStr || typeof payloadStr !== 'string') {
      return NextResponse.json({ error: 'No payload' }, { status: 400 });
    }

    const payload = JSON.parse(payloadStr);

    // =========================================================================
    // 1. Handle Button Clicks (Block Actions)
    // =========================================================================
    if (payload.type === 'block_actions') {
      const action = payload.actions?.[0];
      if (!action) return NextResponse.json({ ok: true });

      // ✅ [Approve] -> Mark as approved in Google Sheets (for Daily Publisher)
      // ⚡ Slackは3秒以内の応答を要求するため、重い処理はバックグラウンドで実行
      if (action.action_id === 'approve_content') {
        const parsedValue = JSON.parse(action.value || '{}');
        const contentId = parsedValue.id;
        const project = parsedValue.p || '';
        const channel = payload.container?.channel_id;
        const ts = payload.container?.message_ts;
        const blocks = payload.message?.blocks;

        try {
          // Schedule for tomorrow (JST) so that the daily-publisher cron (runs 10:00 JST) picks it up.
          // Previously set to `today`, but the cron filters scheduled_date === today —
          // any approval after 10:00 JST would be orphaned. UI copy says "明朝の自動投稿キュー", so honor that.
          const tomorrowJst = new Date(Date.now() + 9 * 3600 * 1000 + 24 * 3600 * 1000)
            .toISOString()
            .split('T')[0];
          await updateSheetRow(contentId, {
            status: 'approved',
            scheduled_date: tomorrowJst
          });
          console.log(`[Slack API] ✅ Successfully approved ${contentId} (scheduled for ${tomorrowJst}).`);
        } catch (err) {
          console.error('[Slack API] Failed to update Google Sheets on approve:', err);
        }

        // reels-factory の場合、Make.com に公開トリガーを送信
        if (project === 'reels-factory' && MAKE_PUBLISH_WEBHOOK_URL) {
          try {
            await fetch(MAKE_PUBLISH_WEBHOOK_URL, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                content_id: contentId,
                action: 'publish',
                approved_at: new Date().toISOString()
              })
            });
            console.log(`[Slack API] 📤 Make.com publish webhook triggered for ${contentId}`);
          } catch (err) {
            console.error('[Slack API] Failed to trigger Make.com webhook:', err);
          }
        }

        if (channel && ts && blocks) {
          const actionBlockIndex = blocks.findIndex((b: any) => b.type === 'actions');
          if (actionBlockIndex !== -1) {
            const statusText = project === 'reels-factory'
              ? `✅ *承認済み* — Make.com 経由で Instagram 投稿キューに登録されました`
              : `✅ *承認済み* (明朝の自動投稿キューに登録されました)`;
            blocks[actionBlockIndex] = {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: statusText
              }
            };
            await updateSlackMessage(channel, ts, '承認されました', blocks);
          }
        }

        return NextResponse.json({ ok: true });
      }

      // ✅ [Approve Reply] -> Post reply to X
      if (action.action_id === 'approve_reply') {
        const parsedValue = JSON.parse(action.value || '{}');
        const tweetId = parsedValue.tweetId;
        const replyText = parsedValue.reply;
        const channel = payload.container?.channel_id;
        const ts = payload.container?.message_ts;
        const blocks = payload.message?.blocks;

        try {
          const twitterApiKey = process.env.EN_TWITTER_API_KEY || process.env.TWITTER_API_KEY || '';
          const twitterApiSecret = process.env.EN_TWITTER_API_SECRET || process.env.TWITTER_API_SECRET || '';
          const twitterAccessToken = process.env.EN_TWITTER_ACCESS_TOKEN || process.env.TWITTER_ACCESS_TOKEN || '';
          const twitterAccessSecret = process.env.EN_TWITTER_ACCESS_SECRET || process.env.TWITTER_ACCESS_SECRET || '';

          if (twitterApiKey && twitterAccessToken) {
            const { TwitterApi } = await import('twitter-api-v2');
            const twitterClient = new TwitterApi({
              appKey: twitterApiKey,
              appSecret: twitterApiSecret,
              accessToken: twitterAccessToken,
              accessSecret: twitterAccessSecret,
            });

            await twitterClient.v2.reply(replyText, tweetId);
            console.log(`[Slack API] 💬 Reply posted to tweet ${tweetId}`);
          }
        } catch (err) {
          console.error('[Slack API] Failed to post reply:', err);
        }

        if (channel && ts && blocks) {
          const actionBlockIndex = blocks.findIndex((b: any) => b.type === 'actions');
          if (actionBlockIndex !== -1) {
            blocks[actionBlockIndex] = {
              type: 'section',
              text: { type: 'mrkdwn', text: '✅ *Reply posted!*' },
            };
            await updateSlackMessage(channel, ts, 'Reply posted', blocks);
          }
        }
        return NextResponse.json({ ok: true });
      }

      // ❌ [Reject Reply] -> Just dismiss
      if (action.action_id === 'reject_reply') {
        const channel = payload.container?.channel_id;
        const ts = payload.container?.message_ts;
        const blocks = payload.message?.blocks;

        if (channel && ts && blocks) {
          const actionBlockIndex = blocks.findIndex((b: any) => b.type === 'actions');
          if (actionBlockIndex !== -1) {
            blocks[actionBlockIndex] = {
              type: 'section',
              text: { type: 'mrkdwn', text: '❌ *Skipped*' },
            };
            await updateSlackMessage(channel, ts, 'Skipped', blocks);
          }
        }
        return NextResponse.json({ ok: true });
      }

      // ❌ [Reject] -> Open Modal for reason
      // 🔄 [Request Revision] -> Same modal, different status outcome
      if (action.action_id === 'reject_content' || action.action_id === 'request_revision') {
        const parsedValue = JSON.parse(action.value || '{}');
        const contentId = parsedValue.id;
        const isRevision = action.action_id === 'request_revision';

        console.log(`[Slack API] Opening ${isRevision ? 'revision' : 'rejection'} modal for: ${contentId}`);

        const privateMetadata = JSON.stringify({
          id: contentId,
          p: parsedValue.p || '',
          isRevision,
          channel: payload.container?.channel_id,
          ts: payload.container?.message_ts,
          blocks: payload.message?.blocks
        });

        if (SLACK_BOT_TOKEN) {
          await fetch('https://slack.com/api/views.open', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${SLACK_BOT_TOKEN}`
            },
            body: JSON.stringify({
              trigger_id: payload.trigger_id,
              view: {
                type: 'modal',
                callback_id: 'reject_modal_submission',
                private_metadata: privateMetadata,
                title: { type: 'plain_text', text: isRevision ? '修正指示の入力' : '却下理由の入力' },
                submit: { type: 'plain_text', text: isRevision ? '修正依頼する' : '却下する', emoji: true },
                close: { type: 'plain_text', text: 'キャンセル', emoji: true },
                blocks: [
                  {
                    type: 'input',
                    block_id: 'reason_block',
                    label: {
                      type: 'plain_text',
                      text: isRevision
                        ? '修正指示を詳しく書いてください'
                        : '修正指示・却下理由を詳しく書いてください'
                    },
                    element: {
                      type: 'plain_text_input',
                      action_id: 'reason_input',
                      multiline: true,
                      placeholder: {
                        type: 'plain_text',
                        text: '例: フックが弱いです。「35歳以上」というキーワードを含めてリライトしてください。'
                      }
                    }
                  }
                ]
              }
            })
          });
        }
        return NextResponse.json({ ok: true });
      }
    }

    // =========================================================================
    // 2. Handle Modal Submission (View Submission)
    // =========================================================================
    if (payload.type === 'view_submission' && payload.view?.callback_id === 'reject_modal_submission') {
      const stateValues = payload.view.state.values;
      const reason = stateValues?.reason_block?.reason_input?.value || '理由なし';

      const privateMetadata = JSON.parse(payload.view.private_metadata || '{}');
      const contentId = privateMetadata.id;
      const isRevision = privateMetadata.isRevision || false;

      const newStatus = isRevision ? 'revision' : 'rejected';

      let success = false;
      try {
        await updateSheetRow(contentId, {
          status: newStatus,
          error_detail: reason
        });
        console.log(`[Slack API] Successfully recorded ${newStatus} for ${contentId}. Reason: ${reason}`);
        success = true;
      } catch (err) {
        console.error('[Slack API] Failed to update Google Sheets:', err);
      }

      // Update the original Slack message
      if (privateMetadata.channel && privateMetadata.ts && privateMetadata.blocks) {
        const blocks = privateMetadata.blocks;
        const actionBlockIndex = blocks.findIndex((b: any) => b.type === 'actions');

        if (actionBlockIndex !== -1) {
          const icon = isRevision ? '🔄' : '❌';
          const label = isRevision ? '修正依頼済み' : '却下済み';
          blocks[actionBlockIndex] = {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `${icon} *${label}*\n*理由:* ${reason}${!success ? ' (※Sheetsの更新に失敗)' : ''}`
            }
          };
          const statusText = isRevision ? '修正依頼されました' : '却下されました';
          await updateSlackMessage(privateMetadata.channel, privateMetadata.ts, statusText, blocks);
        }
      }

      return NextResponse.json({
        response_action: 'clear'
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error('[Slack API] Unhandled error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
