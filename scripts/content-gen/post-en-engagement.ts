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
  accessToken: accessToken,
  accessSecret: accessSecret,
});

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

const TWEET_TYPES = [
  'did_you_know',
  'question',
  'myth_bust',
  'encouragement',
] as const;

async function main() {
  const type = TWEET_TYPES[Math.floor(Math.random() * TWEET_TYPES.length)];

  const prompt = `You are Dr. Takuma Sato, a board-certified fertility specialist posting on X (Twitter) for the English-speaking TTC (Trying To Conceive) community.

Generate ONE single tweet (not a thread) in the "${type}" style:

- "did_you_know": Start with "Did you know?" and share a surprising, evidence-based fertility fact. Include PMID if applicable.
- "question": Ask the TTC community an engaging question that invites replies. Examples: "What's the one thing you wish you knew before starting your TTC journey?" or "Partners: what's been the hardest part of supporting your SO through TTC?"
- "myth_bust": Start with a common TTC myth in quotes, then bust it with a fact. Example: "Eating pineapple core helps implantation" → No evidence supports this.
- "encouragement": A warm, empathetic message for those struggling. NO toxic positivity. NO "just relax." Be genuine and specific.

Rules:
- Max 280 characters
- Use 1-2 relevant hashtags from: #TTC #TTCcommunity #fertility #infertility #IVF #2WW #babydust #fertilityjourney
- For "did_you_know" and "myth_bust": include a subtle CTA like "Save this 📌" or "Share with your TTC buddy"
- Do NOT include any book links or promotional content — this is pure engagement
- Use TTC community lingo naturally (BFP, AF, DPO, TWW, etc.)
- Output ONLY the tweet text, nothing else`;

  let tweetText = '';
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
      tweetText = response.text?.trim() || '';
      if (tweetText) break;
    } catch (e: any) {
      console.warn(`⚠️ Gemini attempt ${attempt + 1} failed: ${e.message}`);
      if (attempt < 2) await new Promise(r => setTimeout(r, 5000 * (attempt + 1)));
    }
  }

  if (!tweetText) {
    console.error('❌ Failed after 3 attempts');
    process.exit(1);
  }

  // Ensure within 280 chars
  const finalText = tweetText.length > 280 ? tweetText.substring(0, 277) + '...' : tweetText;

  console.log(`📝 Type: ${type}`);
  console.log(`📝 Tweet: ${finalText}`);

  const result = await twitter.v2.tweet(finalText);
  console.log(`✅ Posted! ID: ${result.data.id}`);
}

main().catch(e => {
  console.error('❌ Error:', e.message || e);
  process.exit(1);
});
