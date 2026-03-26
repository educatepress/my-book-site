import { NextResponse } from 'next/server';
import fs from 'fs';

// Helper to extract env vars directly from reels-factory to avoid 
// requiring the user to duplicate their .env setup during this transition phase.
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

const reelsEnv = getReelsFactoryEnv();
const SLACK_BOT_TOKEN = process.env.SLACK_BOT_TOKEN || reelsEnv.SLACK_BOT_TOKEN || '';
const MAKE_WEBHOOK_URL = process.env.MAKE_WEBHOOK_URL || reelsEnv.MAKE_WEBHOOK_URL || '';

// Shared database path (local transition phase)
const QUEUE_PATH = '/Users/satoutakuma/Desktop/reels-factory/scripts/data/queue.json';

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

      // ✅ [Approve] -> Forward to Make
      if (action.action_id === 'approve_content') {
        if (MAKE_WEBHOOK_URL) {
          console.log(`[Slack API] Proxying Approve action to Make: ${MAKE_WEBHOOK_URL}`);
          const urlEncoded = new URLSearchParams();
          urlEncoded.append('payload', payloadStr);
          
          fetch(MAKE_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: urlEncoded.toString()
          }).catch(err => console.error('[Slack API] Make proxy failed:', err));
        } else {
          console.warn('[Slack API] MAKE_WEBHOOK_URL is not set. Cannot proxy to Make.');
        }

        // We can update the Slack message to show "Approved" immediately for better UX
        // (Assuming Make does not do this synchronously)
        const parsedValue = JSON.parse(action.value || '{}');
        const contentId = parsedValue.id;
        
        const channel = payload.container?.channel_id;
        const ts = payload.container?.message_ts;
        const blocks = payload.message?.blocks;

        if (channel && ts && blocks) {
          const actionBlockIndex = blocks.findIndex((b: any) => b.type === 'actions');
          if (actionBlockIndex !== -1) {
            blocks[actionBlockIndex] = {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `✅ *承認済み* (Makeで処理が開始されました)`
              }
            };
            await updateSlackMessage(channel, ts, '承認されました', blocks);
          }
        }
        
        return NextResponse.json({ ok: true });
      }

      // ❌ [Reject] -> Open Modal for reason
      if (action.action_id === 'reject_content') {
        const parsedValue = JSON.parse(action.value || '{}');
        const contentId = parsedValue.id;

        console.log(`[Slack API] Opening rejection modal for: ${contentId}`);

        // Save original message context to update it after submission
        const privateMetadata = JSON.stringify({
          id: contentId,
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
                title: { type: 'plain_text', text: '却下理由の入力' },
                submit: { type: 'plain_text', text: '却下する', emoji: true },
                close: { type: 'plain_text', text: 'キャンセル', emoji: true },
                blocks: [
                  {
                    type: 'input',
                    block_id: 'reason_block',
                    label: { type: 'plain_text', text: '修正指示・却下理由を詳しく書いてください' },
                    element: {
                      type: 'plain_text_input',
                      action_id: 'reason_input',
                      multiline: true,
                      placeholder: { type: 'plain_text', text: '例: フックが弱いです。「35歳以上」というキーワードを含めてリライトしてください。' }
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

      let success = false;
      try {
        if (fs.existsSync(QUEUE_PATH)) {
          const queue = JSON.parse(fs.readFileSync(QUEUE_PATH, 'utf8'));
          const item = queue.find((q: any) => q.id === contentId);
          if (item) {
            item.status = 'rejected';
            item.rejectionReason = reason;
            item.rejectedAt = new Date().toISOString();
            fs.writeFileSync(QUEUE_PATH, JSON.stringify(queue, null, 2));
            console.log(`[Slack API] Successfully recorded rejection for ${contentId}. Reason: ${reason}`);
            success = true;
          }
        }
      } catch (err) {
        console.error('[Slack API] Failed to update queue.json:', err);
      }

      // Update the original Slack message to show the rejection
      if (privateMetadata.channel && privateMetadata.ts && privateMetadata.blocks) {
        const blocks = privateMetadata.blocks;
        const actionBlockIndex = blocks.findIndex((b: any) => b.type === 'actions');
        
        if (actionBlockIndex !== -1) {
          blocks[actionBlockIndex] = {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `❌ *却下済み*\n*理由:* ${reason}${!success ? ' (※queue.jsonの更新に失敗)' : ''}`
            }
          };
          await updateSlackMessage(privateMetadata.channel, privateMetadata.ts, '却下されました', blocks);
        }
      }

      // Clear the modal
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
