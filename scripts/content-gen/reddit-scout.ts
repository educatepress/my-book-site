/**
 * Reddit Scout — Find ideal comment opportunities in TTC communities
 *
 * Searches target subreddits for posts where a supportive, educational
 * comment from a preconception care perspective would be welcome.
 *
 * Does NOT auto-post. Outputs a curated list with draft comment ideas
 * for manual posting.
 *
 * Usage:
 *   npx tsx scripts/content-gen/reddit-scout.ts
 */

import * as dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.join(process.cwd(), '.env') });
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

const SUBREDDITS = [
  'TryingForABaby',
  'TTC30',
  'infertility',
  'IVF',
  'TTC_PCOS',
  'PregnancyAfterLoss',
];

const LOOKBACK_DAYS = 7;

// Grief/sensitive blocklist — skip these posts entirely
const BLOCKLIST = [
  'miscarriage', 'loss', 'stillbirth', 'TFMR', 'chemical pregnancy',
  'ectopic', 'angel baby', 'trigger warning', 'tw:', 'cw:',
  'suicide', 'self harm', 'giving up', 'done trying',
  'rant', 'vent', 'angry', 'furious', 'hate my doctor',
  'malpractice', 'lawsuit', 'worst clinic',
];

interface RedditPost {
  title: string;
  selftext: string;
  url: string;
  permalink: string;
  subreddit: string;
  score: number;
  num_comments: number;
  created_utc: number;
  author: string;
}

interface ScoutResult {
  post: RedditPost;
  score: number;
  reason: string;
  draftComment: string;
}

async function fetchSubredditPosts(subreddit: string): Promise<RedditPost[]> {
  const url = `https://www.reddit.com/r/${subreddit}/new.json?limit=25&t=week`;
  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'TTCGuide-Scout/1.0' },
    });
    if (!response.ok) {
      console.warn(`   ⚠️ r/${subreddit}: HTTP ${response.status}`);
      return [];
    }
    const data = await response.json();
    const posts: RedditPost[] = (data.data?.children || []).map((c: any) => ({
      title: c.data.title,
      selftext: c.data.selftext || '',
      url: `https://reddit.com${c.data.permalink}`,
      permalink: c.data.permalink,
      subreddit: c.data.subreddit,
      score: c.data.score,
      num_comments: c.data.num_comments,
      created_utc: c.data.created_utc,
      author: c.data.author,
    }));

    // Filter: within lookback period
    const cutoff = Date.now() / 1000 - LOOKBACK_DAYS * 86400;
    return posts.filter(p => p.created_utc > cutoff);
  } catch (e: any) {
    console.warn(`   ⚠️ r/${subreddit} fetch failed: ${e.message}`);
    return [];
  }
}

function containsBlocklisted(text: string): boolean {
  const lower = text.toLowerCase();
  return BLOCKLIST.some(kw => lower.includes(kw));
}

async function main() {
  console.log('🔍 Reddit Scout — Finding comment opportunities\n');

  // Step 1: Fetch posts from all subreddits
  let allPosts: RedditPost[] = [];
  for (const sub of SUBREDDITS) {
    console.log(`   📡 Fetching r/${sub}...`);
    const posts = await fetchSubredditPosts(sub);
    console.log(`      → ${posts.length} posts (last ${LOOKBACK_DAYS} days)`);
    allPosts = allPosts.concat(posts);
    await new Promise(r => setTimeout(r, 1000)); // Rate limit
  }

  // Step 2: Filter out blocklisted content
  const safePosts = allPosts.filter(p =>
    !containsBlocklisted(p.title + ' ' + p.selftext)
  );
  console.log(`\n   📋 ${allPosts.length} total → ${safePosts.length} after safety filter`);

  if (safePosts.length === 0) {
    console.log('No safe posts found. Exiting.');
    return;
  }

  // Step 3: Prepare post summaries for Gemini
  const postSummaries = safePosts.slice(0, 40).map((p, i) => (
    `[${i + 1}] r/${p.subreddit} | Score: ${p.score} | Comments: ${p.num_comments}
Title: ${p.title}
Body: ${p.selftext.substring(0, 200)}${p.selftext.length > 200 ? '...' : ''}
URL: ${p.url}
---`
  )).join('\n');

  // Step 4: Gemini screening — find the best 3-5 opportunities
  console.log('\n   🤖 AI screening for ideal comment opportunities...');

  const prompt = `You are a social media strategist for a fertility preconception care book ("A Doctor's Guide to Women's Health & Preconception" on Amazon).

Below are Reddit posts from TTC (Trying To Conceive) communities. Select the TOP 3 posts where a supportive comment would be:

IDEAL CRITERIA:
1. The poster is seeking EDUCATIONAL information (not emotional support only)
2. The topic relates to preconception care, fertility basics, nutrition, lifestyle, or understanding test results
3. The poster seems open-minded and interested in learning
4. A comment sharing knowledge would be genuinely helpful (not salesy)
5. The post has moderate engagement (not too hot/controversial, not dead)
6. NO treatment decision posts (don't influence someone's medical choices)
7. NO grief/loss/anger posts
8. The poster might be someone who values education enough to check out a book

EXCLUDE:
- Posts asking about specific medications, protocols, or doctor recommendations
- Highly emotional posts where education would feel tone-deaf
- Posts with very strong opinions where any comment might start an argument
- Posts already heavily commented (50+) where we'd get buried

For each selected post, provide:
1. Why this is a good opportunity
2. A draft comment that:
   - Opens with genuine empathy or shared experience
   - Provides 1-2 evidence-based insights (cite PMID if possible)
   - Does NOT mention the book, a link, or "check out my..."
   - Sounds like a knowledgeable community member, NOT a doctor or marketer
   - Ends naturally — no CTA, no forced helpfulness
   - Max 150 words

OUTPUT FORMAT (JSON):
{
  "opportunities": [
    {
      "postIndex": 1,
      "subreddit": "TryingForABaby",
      "whyGood": "Brief reason",
      "draftComment": "The actual comment text",
      "riskLevel": "low" | "medium"
    }
  ]
}

Only output valid JSON.

POSTS:
${postSummaries}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { responseMimeType: 'application/json' },
    });

    const result = JSON.parse((response.text || '{}').trim());
    const opportunities = result.opportunities || [];

    console.log(`\n${'═'.repeat(60)}`);
    console.log(`📋 REDDIT SCOUT RESULTS — ${opportunities.length} opportunities found`);
    console.log(`${'═'.repeat(60)}\n`);

    for (const opp of opportunities) {
      const post = safePosts[opp.postIndex - 1];
      if (!post) continue;

      console.log(`${'─'.repeat(60)}`);
      console.log(`📌 r/${post.subreddit} — "${post.title}"`);
      console.log(`   URL: ${post.url}`);
      console.log(`   Score: ${post.score} | Comments: ${post.num_comments} | Risk: ${opp.riskLevel}`);
      console.log(`   Why: ${opp.whyGood}`);
      console.log(`\n   💬 Draft comment:`);
      console.log(`   ${opp.draftComment.replace(/\n/g, '\n   ')}`);
      console.log('');
    }

    console.log(`${'═'.repeat(60)}`);
    console.log(`\n⚠️ REMINDER: Post these MANUALLY. Do not auto-post on Reddit.`);
    console.log(`   Copy the draft, review it, personalize it, then post from your browser.\n`);

    // Send to Slack for easy access
    if (process.env.SLACK_BOT_TOKEN && process.env.SLACK_CHANNEL_ID) {
      const slackBlocks: any[] = [
        {
          type: 'header',
          text: { type: 'plain_text', text: `📋 Reddit Scout — ${opportunities.length} comment opportunities` },
        },
      ];

      for (const opp of opportunities) {
        const post = safePosts[opp.postIndex - 1];
        if (!post) continue;
        slackBlocks.push({
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*<${post.url}|r/${post.subreddit}: ${post.title.substring(0, 60)}>*\nRisk: ${opp.riskLevel} | ${opp.whyGood}\n\n_Draft:_ ${opp.draftComment.substring(0, 200)}...`,
          },
        });
        slackBlocks.push({ type: 'divider' });
      }

      await fetch('https://slack.com/api/chat.postMessage', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.SLACK_BOT_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          channel: process.env.SLACK_CHANNEL_ID,
          text: `Reddit Scout: ${opportunities.length} comment opportunities`,
          blocks: slackBlocks,
        }),
      });
      console.log('📨 Results sent to Slack');
    }

  } catch (e: any) {
    console.error('❌ Gemini screening failed:', e.message);
  }
}

main().catch(e => {
  console.error('❌ Fatal error:', e.message || e);
  process.exit(1);
});
