import { config } from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { TwitterApi } from 'twitter-api-v2';
// @ts-ignore
import { prompt, Select } from 'enquirer';

config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
    console.error('❌ Error: GEMINI_API_KEY is missing in .env');
    process.exit(1);
}

const X_API_KEY = process.env.X_API_KEY;
const X_API_KEY_SECRET = process.env.X_API_KEY_SECRET;
const X_ACCESS_TOKEN = process.env.X_ACCESS_TOKEN;
const X_ACCESS_TOKEN_SECRET = process.env.X_ACCESS_TOKEN_SECRET;

if (!X_API_KEY || !X_API_KEY_SECRET || !X_ACCESS_TOKEN || !X_ACCESS_TOKEN_SECRET) {
    console.error('❌ Error: Twitter API keys are missing in .env. Please configure X_API_KEY, X_API_KEY_SECRET, X_ACCESS_TOKEN, and X_ACCESS_TOKEN_SECRET.');
    process.exit(1);
}

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
const twitterClient = new TwitterApi({
    appKey: X_API_KEY,
    appSecret: X_API_KEY_SECRET,
    accessToken: X_ACCESS_TOKEN,
    accessSecret: X_ACCESS_TOKEN_SECRET,
});

async function main() {
    console.log('--------------------------------------------------');
    console.log('🚀 AI-Assisted Quote Repost Generator (English X)');
    console.log('--------------------------------------------------\n');

    // 1. Get User Input (URL and Intent)
    const response = await prompt([
        {
            type: 'input',
            name: 'targetUrl',
            message: '🔗 Enter the URL of the tweet you want to quote:',
            validate: (value: string) => {
                const urlPattern = /^(https?:\/\/)?(www\.)?(twitter\.com|x\.com)\/.*\/status\/\d+/;
                if (!urlPattern.test(value)) {
                    return 'Please enter a valid Twitter/X post URL (e.g., https://x.com/user/status/123).';
                }
                return true;
            }
        },
        {
            type: 'input',
            name: 'intent',
            message: '🎯 What is your comment/intent? (e.g., 卵子凍結の観点で早めの決断を促す):',
            validate: (value: string) => value.length > 0 ? true : 'Intent cannot be empty.'
        }
    ]) as { targetUrl: string, intent: string };

    console.log('\n🤖 Generating 3 professional quote variations using Gemini...');

    // 2. Generate 3 Variations using Gemini
    try {
        const aiResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `TARGET URL: ${response.targetUrl}\nINTENT / COMMENT IDEA: ${response.intent}`,
            config: {
                systemInstruction: `You are Dr. Takuma Sato, an elite Board-certified Fertility Specialist (MD, PhD) working in Tokyo, Japan.
You are running an English X (Twitter) account targetting women in their 20s and 30s internationally.
Your tone is professional, highly empathetic, deeply grounded in evidence-based medicine, and slightly empowering/witty.

The user has found a tweet and wants to quote-repost it. They will provide:
1. The Target URL.
2. The Intent of their comment.

YOUR TASK:
Write 3 DIFFERENT variations of the tweet text that perfectly encapsulates the user's intent.

CRITICAL RULES:
1. MUST be written entirely in flawless, native-level English (tailored to an educated international audience).
2. Use engaging X formats (e.g., bullet points, intriguing hook on the first line).
3. Be concise. X has a 280-character limit. EACH variation MUST leave enough room (around 30 chars at minimum) for the URL at the very end.
4. Each variation MUST explicitly end with a blank line followed by the [TARGET URL] variable. If you don't include the URL at the end, it won't render as a quote tweet!
5. No hashtags needed unless perfectly relevant (max 1 tag like #Fertility or #WomensHealth).

FORMAT YOUR OUTPUT EXACTLY AS A JSON ARRAY containing 3 strings:
[
  "Variation 1 text...\\n\\n[TARGET URL]",
  "Variation 2 text...\\n\\n[TARGET URL]",
  "Variation 3 text...\\n\\n[TARGET URL]"
]`
            }
        });

        const text = aiResponse.text;
        if (!text) {
            throw new Error("Received empty response from Gemini.");
        }

        // Extract JSON array from response
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (!jsonMatch) {
            throw new Error("Gemini did not return a valid JSON array. Response was:\n" + text);
        }

        const variations = JSON.parse(jsonMatch[0]) as string[];
        
        // Ensure URLs are injected properly if Gemini left the literal string "[TARGET URL]"
        const processedVariations = variations.map(v => v.replace('[TARGET URL]', response.targetUrl));

        console.log('\n=============================================');
        console.log('💡 Generations Complete. Please select one:');
        console.log('=============================================\n');

        const choices = processedVariations.map((v, i) => ({
            message: `[Variation ${i + 1}]\n${v}\n`, // What user sees in the list
            name: v // The actual value returned
        }));

        const selectPrompt = new Select({
            name: 'selectedTweet',
            message: 'Select the variation you want to post to X:',
            choices: [...choices, { message: '❌ Cancel (Do not post)', name: 'CANCEL' }]
        });

        const answer = await selectPrompt.run();

        if (answer === 'CANCEL') {
            console.log('\n🚫 Operation cancelled. Nothing was posted.');
            return;
        }

        console.log('\n🚀 Posting to X...');
        
        // 3. Post to X
        const tweetResponse = await twitterClient.v2.tweet(answer);
        
        console.log('✅ Successfully posted to X!');
        console.log(`🔗 Link: https://x.com/user/status/${tweetResponse.data.id}`);

    } catch (error) {
        console.error('\n❌ An error occurred:', error);
    }
}

main();
