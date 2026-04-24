/**
 * X Outreach Bot — TTC Community Engagement (Safety-hardened v2)
 *
 * 1. Search #TTC tweets for engagement opportunities
 * 2. Filter through grief/loss blocklist
 * 3. Auto-like ONLY screened-safe tweets
 * 4. Generate reply drafts with Gemini (no doctor credentials)
 * 5. Safety-screen replies for harm potential
 * 6. Auto-post safe replies, report to Slack
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
  'IVF journey -is:retweet -is:reply lang:en',
];

const MAX_LIKES = 10;
const MAX_REPLY_DRAFTS = 5;

// Grief/loss/sensitive keyword blocklist — NEVER engage with these
const GRIEF_BLOCKLIST = [
  'miscarriage', 'miscarried', 'lost the baby', 'pregnancy loss',
  'chemical pregnancy', 'stillbirth', 'stillborn', 'angel baby',
  'TFMR', 'failed transfer', 'failed cycle', 'giving up',
  'done with ttc', 'done trying', 'can\'t do this anymore',
  'trigger warning', 'tw:', 'cw:',
  'ectopic', 'molar pregnancy', 'd&c', 'dnc',
  'rainbow baby', 'infant loss', 'neonatal',
  'suicide', 'kill myself', 'self harm',
];

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

/**
 * Check if a tweet contains grief/loss/sensitive content
 */
function containsGriefContent(text: string): boolean {
  const lower = text.toLowerCase();
  return GRIEF_BLOCKLIST.some(kw => lower.includes(kw.toLowerCase()));
}

async function searchTweets(): Promise<TweetCandidate[]> {
  const candidates: TweetCandidate[] = [];
  const seenIds = new Set<string>();

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

        // Grief blocklist filter
        if (containsGriefContent(tweet.text)) {
          console.log(`🛡️ Blocked (grief/loss): @${users.get(tweet.author_id || '')?.username} — "${tweet.text.substring(0, 50)}..."`);
          continue;
        }

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
  const me = await twitter.v2.me();

  // Screen candidates before liking
  const safeCandidates = candidates.filter(t => !containsGriefContent(t.text));
  const toLike = safeCandidates.slice(0, MAX_LIKES);

  for (const tweet of toLike) {
    try {
      await twitter.v2.like(me.data.id, tweet.id);
      console.log(`❤️ Liked: @${tweet.authorUsername} — "${tweet.text.substring(0, 50)}..."`);
      liked++;
    } catch (e: any) {
      if (e.code !== 139) {
        console.warn(`⚠️ Like failed for ${tweet.id}:`, e.message);
      }
    }
  }
  return liked;
}

async function generateReplyDrafts(candidates: TweetCandidate[]): Promise<Array<{ tweet: TweetCandidate; reply: string }>> {
  const drafts: Array<{ tweet: TweetCandidate; reply: string }> = [];

  const toReply = candidates
    .filter(t => t.text.length > 30)
    .slice(0, MAX_REPLY_DRAFTS * 2);

  for (const tweet of toReply) {
    if (drafts.length >= MAX_REPLY_DRAFTS) break;

    try {
      // Step 1: Tone screening
      const screenPrompt = `Analyze this tweet's tone. Reply with ONLY one word: "ENGAGE" or "SKIP".

Tweet: "${tweet.text}"

ENGAGE if the person is:
- Genuinely seeking help or support
- Sharing their TTC journey positively or with humor
- Asking a question earnestly
- Expressing vulnerability but open to encouragement

SKIP if the person is:
- Venting anger at doctors, clinics, or specific people
- Using profanity or aggressive language
- Discussing pregnancy loss, miscarriage, or grief
- Being sarcastic/cynical
- Discussing topics unrelated to fertility

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

      // Step 2: Generate reply — NO doctor credentials, just supportive community member
      const prompt = `You are a warm, knowledgeable fertility wellness advocate replying to a tweet from the TTC community. You are NOT a doctor in this reply — do not mention medical credentials, titles, or qualifications.

Original tweet by @${tweet.authorUsername}:
"${tweet.text}"

Generate a short, warm reply (max 200 characters). Rules:
- Be genuinely empathetic and supportive
- Do NOT give medical advice or cite studies
- Do NOT mention being a doctor or specialist
- Validate their feelings — never say "just relax" or "it'll happen"
- Sound human, not like a bot
- Do NOT promote anything or include links
- End naturally — no forced CTA
- Use TTC-friendly emojis sparingly (🍍✨🫂 OK, avoid excessive hearts)
- Output ONLY the reply text`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      const reply = response.text?.trim();
      if (!reply || reply.length > 280) continue;

      // Step 3: Safety screen — would this reply cause harm?
      const safetyPrompt = `You are a safety reviewer. A fertility-focused social media account is about to auto-reply to a stranger's tweet.

Original tweet: "${tweet.text}"
Proposed reply: "${reply}"

Could this reply cause harm? Check:
1. Could it be perceived as unsolicited medical advice?
2. Could it be insensitive if the person is experiencing loss or grief?
3. Could it sound condescending, patronizing, or tone-deaf?
4. Could it go viral negatively?

Reply ONLY "SAFE" or "UNSAFE". If unsafe, add a brief reason.`;

      const safetyResult = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: safetyPrompt,
      });

      const safetyDecision = safetyResult.text?.trim().toUpperCase();
      if (!safetyDecision?.startsWith('SAFE')) {
        console.log(`🛡️ Safety blocked @${tweet.authorUsername}: ${safetyResult.text?.substring(0, 80)}`);
        continue;
      }

      drafts.push({ tweet, reply });
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
    }
    return;
  }

  const summaryBlocks: any[] = [
    {
      type: 'header',
      text: { type: 'plain_text', text: `🤖 X Outreach Report — ${new Date().toISOString().split('T')[0]}` },
    },
    {
      type: 'section',
      text: { type: 'mrkdwn', text: `❤️ Auto-liked: *${likedCount}* tweets\n💬 Auto-replied: *${drafts.length}* (tone + safety screened)` },
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
      text: `X Outreach: ${likedCount} likes, ${drafts.length} replies`,
    }),
  });

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
  console.log('🔍 X Outreach Bot starting (Safety-hardened v2)...');

  // Step 1: Search (with grief blocklist)
  const candidates = await searchTweets();
  console.log(`Found ${candidates.length} candidate tweets (after grief filter)`);

  if (candidates.length === 0) {
    console.log('No candidates found. Exiting.');
    return;
  }

  // Step 2: Auto-like (screened)
  const likedCount = await autoLike(candidates);
  console.log(`❤️ Liked ${likedCount} tweets`);

  // Step 3: Generate reply drafts (tone + safety screening)
  const drafts = await generateReplyDrafts(candidates);
  console.log(`📝 Generated ${drafts.length} safe reply drafts`);

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

  // Step 5: FYI report to Slack
  await sendToSlack(drafts, likedCount);

  console.log('✅ X Outreach complete!');
}

main().catch(e => {
  console.error('❌ Fatal error:', e.message || e);
  process.exit(1);
});
