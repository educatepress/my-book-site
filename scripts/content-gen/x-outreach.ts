/**
 * X Outreach Bot — TTC Community Engagement
 *
 * 1. Search #TTC tweets for engagement opportunities
 * 2. Auto-like relevant tweets
 * 3. Generate reply drafts with Gemini
 * 4. Send to Slack for approval before posting
 */

import * as dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.join(process.cwd(), '.env') });
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

import { TwitterApi } from 'twitter-api-v2';
import { GoogleGenAI } from '@google/genai';

// --- Config ---
const SEARCH_QUERIES = [
  '#TTC -is:retweet -is:reply lang:en',
  '#TTCcommunity -is:retweet -is:reply lang:en',
  'trying to conceive -is:retweet -is:reply lang:en',
  'fertility journey -is:retweet -is:reply lang:en',
  'low AMH -is:retweet lang:en',
  'IVF journey -is:retweet -is:reply lang:en',
  '2WW symptoms -is:retweet lang:en',
];

const MAX_LIKES = 10;
const MAX_REPLY_DRAFTS = 5;

const apiKey = process.env.EN_TWITTER_API_KEY || process.env.TWITTER_API_KEY;
const apiSecret = process.env.EN_TWITTER_API_SECRET || process.env.TWITTER_API_SECRET;
const accessToken = process.env.EN_TWITTER_ACCESS_TOKEN || process.env.TWITTER_ACCESS_TOKEN;
const accessSecret = process.env.EN_TWITTER_ACCESS_SECRET || process.env.TWITTER_ACCESS_SECRET;

if (!apiKey || !apiSecret || !accessToken || !accessSecret) {
  console.error('❌ Twitter API credentials missing');
  process.exit(1);
}

const twitter = new TwitterApi({
  appKey: apiKey,
  appSecret: apiSecret,
  accessToken: accessToken,
  accessSecret: accessSecret,
});

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

const slackToken = process.env.SLACK_BOT_TOKEN;
const slackChannel = process.env.SLACK_CHANNEL_ID;

interface TweetCandidate {
  id: string;
  text: string;
  authorUsername: string;
  authorName: string;
  query: string;
}

async function searchTweets(): Promise<TweetCandidate[]> {
  const candidates: TweetCandidate[] = [];
  const seenIds = new Set<string>();

  // Get our own user ID to exclude self-tweets
  const me = await twitter.v2.me();
  const myId = me.data.id;

  for (const query of SEARCH_QUERIES) {
    try {
      const result = await twitter.v2.search(query, {
        max_results: 10,
        'tweet.fields': ['author_id', 'created_at', 'public_metrics'],
        expansions: ['author_id'],
        'user.fields': ['username', 'name'],
      });

      if (!result.data?.data) continue;

      const users = new Map<string, { username: string; name: string }>();
      if (result.includes?.users) {
        for (const u of result.includes.users) {
          users.set(u.id, { username: u.username, name: u.name });
        }
      }

      for (const tweet of result.data.data) {
        if (seenIds.has(tweet.id)) continue;
        if (tweet.author_id === myId) continue;
        seenIds.add(tweet.id);

        const author = users.get(tweet.author_id || '') || { username: 'unknown', name: 'Unknown' };
        candidates.push({
          id: tweet.id,
          text: tweet.text,
          authorUsername: author.username,
          authorName: author.name,
          query,
        });
      }
    } catch (e: any) {
      console.warn(`⚠️ Search failed for "${query}":`, e.message);
    }
  }

  return candidates;
}

async function autoLike(candidates: TweetCandidate[]): Promise<number> {
  let liked = 0;
  const toLike = candidates.slice(0, MAX_LIKES);

  for (const tweet of toLike) {
    try {
      const me = await twitter.v2.me();
      await twitter.v2.like(me.data.id, tweet.id);
      console.log(`❤️ Liked: @${tweet.authorUsername} — "${tweet.text.substring(0, 50)}..."`);
      liked++;
    } catch (e: any) {
      // Already liked or rate limited
      if (e.code !== 139) {
        console.warn(`⚠️ Like failed for ${tweet.id}:`, e.message);
      }
    }
  }
  return liked;
}

async function generateReplyDrafts(candidates: TweetCandidate[]): Promise<Array<{ tweet: TweetCandidate; reply: string }>> {
  const drafts: Array<{ tweet: TweetCandidate; reply: string }> = [];

  // Pick the most engaging tweets for reply
  const toReply = candidates
    .filter(t => t.text.length > 30) // skip very short tweets
    .slice(0, MAX_REPLY_DRAFTS * 2); // screen more candidates, filter by tone

  for (const tweet of toReply) {
    if (drafts.length >= MAX_REPLY_DRAFTS) break;

    try {
      // Step 1: Screen the tweet tone — skip negative/toxic/aggressive
      const screenPrompt = `Analyze this tweet's tone. Reply with ONLY one word: "ENGAGE" or "SKIP".

Tweet: "${tweet.text}"

ENGAGE if the person is:
- Genuinely seeking help or support
- Sharing their TTC journey positively or with humor
- Asking a medical question earnestly
- Expressing vulnerability but open to encouragement

SKIP if the person is:
- Venting anger at doctors, clinics, or specific people
- Using profanity or aggressive language
- Spreading misinformation aggressively
- Being sarcastic/cynical in a way that won't welcome a doctor's reply
- Discussing topics unrelated to fertility (politics, drama)

Reply ONLY "ENGAGE" or "SKIP".`;

      const screenResult = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: screenPrompt,
      });

      const decision = screenResult.text?.trim().toUpperCase();
      if (decision !== 'ENGAGE') {
        console.log(`⏭️ Skipped @${tweet.authorUsername} (tone: ${decision})`);
        continue;
      }

      // Step 2: Generate reply for screened tweet
      const prompt = `You are Dr. Takuma Sato, a board-certified fertility specialist (生殖医療専門医) replying to a tweet from the TTC community.

Original tweet by @${tweet.authorUsername}:
"${tweet.text}"

Generate a short, warm, helpful reply (max 240 characters). Rules:
- Be genuinely empathetic and supportive
- If medical: share ONE evidence-based fact with hedging ("research suggests...")
- If emotional: validate their feelings, never say "just relax"
- Sound human, not like a bot
- Do NOT promote anything or include links
- Do NOT diagnose or give specific medical advice
- End naturally — no forced CTA
- Output ONLY the reply text`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      const reply = response.text?.trim();
      if (reply && reply.length <= 280) {
        drafts.push({ tweet, reply });
      }
    } catch (e: any) {
      console.warn(`⚠️ Reply generation failed for ${tweet.id}:`, e.message);
    }
  }

  return drafts;
}

async function sendToSlack(drafts: Array<{ tweet: TweetCandidate; reply: string }>, likedCount: number) {
  if (!slackToken || !slackChannel) {
    console.log('⚠️ Slack not configured. Printing drafts to console:');
    for (const d of drafts) {
      console.log(`\n--- Reply to @${d.tweet.authorUsername} ---`);
      console.log(`Original: "${d.tweet.text.substring(0, 100)}..."`);
      console.log(`Reply: "${d.reply}"`);
      console.log(`Tweet URL: https://x.com/${d.tweet.authorUsername}/status/${d.tweet.id}`);
    }
    return;
  }

  // Summary message
  const summaryBlocks: any[] = [
    {
      type: 'header',
      text: { type: 'plain_text', text: `🤖 X Outreach Report — ${new Date().toISOString().split('T')[0]}` },
    },
    {
      type: 'section',
      text: { type: 'mrkdwn', text: `❤️ Auto-liked: *${likedCount}* tweets\n💬 Auto-replied: *${drafts.length}* (tone-screened)` },
    },
    { type: 'divider' },
  ];

  await fetch('https://slack.com/api/chat.postMessage', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${slackToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      channel: slackChannel,
      blocks: summaryBlocks,
      text: `X Outreach: ${likedCount} likes, ${drafts.length} reply drafts`,
    }),
  });

  // Post reply log to Slack (FYI, already auto-posted)
  for (const d of drafts) {
    const blocks: any[] = [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `💬 *Auto-replied to @${d.tweet.authorUsername}*\n> ${d.tweet.text.substring(0, 150)}\n\n*Our reply:*\n${d.reply}\n\n<https://x.com/${d.tweet.authorUsername}/status/${d.tweet.id}|View on X>`,
        },
      },
    ];

    await fetch('https://slack.com/api/chat.postMessage', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${slackToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        channel: slackChannel,
        blocks,
        text: `Auto-replied to @${d.tweet.authorUsername}`,
      }),
    });
  }

  console.log(`📨 Sent reply log to Slack (${drafts.length} replies)`);
}

async function main() {
  console.log('🔍 X Outreach Bot starting...');

  // Step 1: Search for TTC tweets
  const candidates = await searchTweets();
  console.log(`Found ${candidates.length} candidate tweets`);

  if (candidates.length === 0) {
    console.log('No candidates found. Exiting.');
    return;
  }

  // Step 2: Auto-like
  const likedCount = await autoLike(candidates);
  console.log(`❤️ Liked ${likedCount} tweets`);

  // Step 3: Generate reply drafts (with tone screening)
  const drafts = await generateReplyDrafts(candidates);
  console.log(`📝 Generated ${drafts.length} reply drafts`);

  // Step 4: Auto-post replies
  let repliedCount = 0;
  for (const d of drafts) {
    try {
      await twitter.v2.reply(d.reply, d.tweet.id);
      console.log(`💬 Replied to @${d.tweet.authorUsername}: "${d.reply.substring(0, 50)}..."`);
      repliedCount++;
    } catch (e: any) {
      console.warn(`⚠️ Reply failed for ${d.tweet.id}:`, e.message);
    }
  }
  console.log(`💬 Auto-replied to ${repliedCount} tweets`);

  // Step 5: Send summary report to Slack (not approval, just FYI)
  await sendToSlack(drafts, likedCount);

  console.log('✅ X Outreach complete!');
}

main().catch(e => {
  console.error('❌ Fatal error:', e.message || e);
  process.exit(1);
});
