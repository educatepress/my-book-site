/**
 * X Reply Guard — Post-publish safety monitor
 *
 * Monitors auto-posted replies for signs of backlash and auto-deletes dangerous ones.
 *
 * Signals checked:
 *   1. Ratio'd: more replies/quotes than likes (negative attention)
 *   2. Negative quote tweets about our reply
 *   3. AI sentiment analysis of responses to our reply
 *
 * Runs via GitHub Actions every 4 hours after outreach.
 */

import * as dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.join(process.cwd(), '.env') });
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

import { TwitterApi } from 'twitter-api-v2';
import { GoogleGenAI } from '@google/genai';

// EN投稿もJPアカウント(@entu1201)で行う — ENアカウント廃止 (2026-04-24)
const apiKey = process.env.TWITTER_API_KEY;
const apiSecret = process.env.TWITTER_API_SECRET;
const accessToken = process.env.TWITTER_ACCESS_TOKEN;
const accessSecret = process.env.TWITTER_ACCESS_SECRET;

if (!apiKey || !apiSecret || !accessToken || !accessSecret) {
  console.error('❌ Twitter API credentials missing');
  process.exit(1);
}

const twitter = new TwitterApi({
  appKey: apiKey,
  appSecret: apiSecret,
  accessToken,
  accessSecret,
});

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
const slackToken = process.env.SLACK_BOT_TOKEN;
const slackChannel = process.env.SLACK_CHANNEL_ID;

// ── Thresholds ──
const RATIO_THRESHOLD = 2.0;       // replies+quotes > likes × this = ratio'd
const MIN_ENGAGEMENT_FOR_CHECK = 3; // don't flag tweets with < 3 total interactions
const LOOKBACK_HOURS = 48;          // check tweets from the last 48 hours

async function sendSlackAlert(message: string) {
  if (!slackToken || !slackChannel) {
    console.log('[Slack] ' + message);
    return;
  }
  try {
    await fetch('https://slack.com/api/chat.postMessage', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${slackToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        channel: slackChannel,
        text: message,
      }),
    });
  } catch {}
}

async function main() {
  console.log('🛡️ X Reply Guard starting...');

  const me = await twitter.v2.me();
  const myId = me.data.id;
  console.log(`   Account: @${me.data.username} (${myId})`);

  // Get our recent tweets (replies we posted)
  const cutoffTime = new Date(Date.now() - LOOKBACK_HOURS * 3600 * 1000);
  const cutoffISO = cutoffTime.toISOString();

  let timeline;
  try {
    timeline = await twitter.v2.userTimeline(myId, {
      max_results: 50,
      'tweet.fields': ['created_at', 'public_metrics', 'in_reply_to_user_id', 'referenced_tweets'],
      start_time: cutoffISO,
    });
  } catch (e: any) {
    console.error('❌ Failed to fetch timeline:', e.message);
    process.exit(1);
  }

  const tweets = timeline.data?.data || [];
  // Filter to only replies (tweets we sent as replies to others)
  const replies = tweets.filter(t =>
    t.in_reply_to_user_id && t.in_reply_to_user_id !== myId
  );

  console.log(`   Found ${replies.length} replies in the last ${LOOKBACK_HOURS}h`);

  if (replies.length === 0) {
    console.log('✅ No replies to monitor. Exiting.');
    return;
  }

  let deletedCount = 0;
  const flagged: Array<{ id: string; text: string; reason: string }> = [];

  for (const reply of replies) {
    const metrics = reply.public_metrics;
    if (!metrics) continue;

    const likes = metrics.like_count || 0;
    const replyCount = metrics.reply_count || 0;
    const quoteCount = metrics.quote_count || 0;
    const retweetCount = metrics.retweet_count || 0;
    const totalEngagement = likes + replyCount + quoteCount + retweetCount;

    // Skip low-engagement tweets (not enough data to judge)
    if (totalEngagement < MIN_ENGAGEMENT_FOR_CHECK) continue;

    const negativeSignals = replyCount + quoteCount;
    const ratio = likes > 0 ? negativeSignals / likes : negativeSignals;

    console.log(`   📊 Tweet ${reply.id}: ${likes}❤️ ${replyCount}💬 ${quoteCount}🔁 (ratio: ${ratio.toFixed(1)})`);

    // Check 1: Ratio'd — more negative signals than likes
    if (ratio >= RATIO_THRESHOLD) {
      console.log(`   ⚠️ RATIO'D detected (${ratio.toFixed(1)}x)`);
      flagged.push({
        id: reply.id,
        text: reply.text || '',
        reason: `Ratio'd: ${negativeSignals} replies+quotes vs ${likes} likes (${ratio.toFixed(1)}x)`,
      });
      continue;
    }

    // Check 2: AI sentiment analysis of responses (if reply count > 2)
    if (replyCount >= 2) {
      try {
        // Get replies to our reply
        const searchResult = await twitter.v2.search(
          `conversation_id:${reply.id} -from:${me.data.username}`,
          { max_results: 10, 'tweet.fields': ['text'] }
        );

        const responseTweets = searchResult.data?.data || [];
        if (responseTweets.length > 0) {
          const responseTexts = responseTweets.map(t => t.text).join('\n---\n');

          const sentimentResult = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Analyze the sentiment of these replies to a fertility account's tweet. Are people reacting negatively (angry, offended, calling out, mocking)?

Our tweet: "${reply.text}"

Replies:
${responseTexts}

Reply ONLY "NEGATIVE" or "NEUTRAL_OR_POSITIVE". If negative, add a brief reason.`,
          });

          const sentiment = sentimentResult.text?.trim().toUpperCase() || '';
          if (sentiment.startsWith('NEGATIVE')) {
            console.log(`   ⚠️ NEGATIVE responses detected: ${sentimentResult.text?.substring(0, 100)}`);
            flagged.push({
              id: reply.id,
              text: reply.text || '',
              reason: `Negative responses: ${sentimentResult.text?.substring(0, 150)}`,
            });
          }
        }
      } catch (e: any) {
        console.warn(`   ⚠️ Sentiment check failed for ${reply.id}: ${e.message?.substring(0, 60)}`);
      }
    }
  }

  // Auto-delete flagged tweets
  if (flagged.length > 0) {
    console.log(`\n🚨 ${flagged.length} tweets flagged for deletion:`);

    for (const f of flagged) {
      console.log(`   🗑️ Deleting ${f.id}: "${f.text.substring(0, 60)}..." — ${f.reason}`);
      try {
        await twitter.v2.deleteTweet(f.id);
        deletedCount++;
        console.log(`   ✅ Deleted`);
      } catch (e: any) {
        console.error(`   ❌ Delete failed: ${e.message}`);
      }
    }

    // Alert Slack
    const alertLines = flagged.map(f =>
      `• \`${f.id}\`: "${f.text.substring(0, 80)}..."\n  Reason: ${f.reason}`
    ).join('\n');

    await sendSlackAlert(
      `🚨 *X Reply Guard: ${deletedCount} tweet(s) auto-deleted*\n\n${alertLines}\n\n_These replies showed signs of negative reception and were removed to protect the account._`
    );
  } else {
    console.log('\n✅ All replies are safe. No action needed.');
  }

  console.log(`\n🛡️ Reply Guard complete. Checked: ${replies.length}, Deleted: ${deletedCount}`);
}

main().catch(e => {
  console.error('❌ Fatal error:', e.message || e);
  process.exit(1);
});
