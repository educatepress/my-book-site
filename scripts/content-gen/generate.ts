import 'dotenv/config';
import { GoogleGenAI } from '@google/genai';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

// Configure Gemini API
if (!process.env.GEMINI_API_KEY) {
    console.error("❌ Error: GEMINI_API_KEY is missing in .env");
    process.exit(1);
}
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function main() {
    const draftPath = process.argv[2];
    if (!draftPath) {
        console.error("❌ Error: Please provide a draft text file.");
        console.error("Usage: npm run generate-content <path/to/draft.txt>");
        process.exit(1);
    }

    const rawDraft = await fs.readFile(draftPath, 'utf8');
    console.log("🚀 Generating Content with Gemini AI...");

    const today = new Date().toISOString().split('T')[0];

    // System Prompt for multi-asset generation
    const prompt = `
You are an expert Medical Writer, top-tier SEO/AEO Specialist, and Direct Response Copywriter for Dr. Takuma Sato, a Reproductive Medicine Specialist.
Your task is to take the user's rough draft and output 3 specific assets in JSON format.
Today's Date is: ${today}.

Assets to generate:
1. "reelScript": A Google Vids scene format script for an Instagram Reel. 
   - [Hook]: The first 1-2 seconds MUST address a specific, urgent pain point or trending myth.
   - Flow: Hook -> Empathy -> Surprising Medical Fact -> Call to Action (Link in bio to the book).

2. "jpBlog": A complete Japanese MDX blog post.
   - [SEO Frontmatter]: title: "...", date: "${today}", excerpt: "...", author: "佐藤 琢磨" (Keep slug in english under "slug" key).
   - [Title Hook]: The title must be highly clickable, combining Authority, Urgency, and Benefit (e.g., "【産婦人科医が警告】葉酸は妊娠に気づいてからでは遅い？知るべき3つの事実").
   - [SMART BREVITY Format - CRITICAL]: You MUST structure the blog strictly using the "Smart Brevity" style. Do NOT use generic, long introductions. Use the exact H2 (##) headings below:
      - ## 💡この記事の結論 (The Lede): 1-2 bold, direct sentences answering the search intent immediately.
      - ## 🔍なぜ今、知るべきなのか (Why it matters): 3 bullet points explaining the urgency, risk, or benefit to the reader. Highly optimized for Google AI Overviews (AEO).
      - <MiddleCta /> (CRITICAL: You MUST insert this exact component tag on its own line right after the "Why it matters" section to offer the book before they drop off).
      - ## 📖さらに詳しく (Go Deeper): Deep dive into the medical data, mechanism, or actions. Use H3 (###) tags incorporating high-volume search keywords (e.g., 妊活, プレコンセプションケア).
      - ## ❓よくある質問 (FAQ): 2-3 short Q&A pairs answering common search queries.

3. "enBlog": An English translated and localized MDX blog post.
   - [SEO Frontmatter]: title, date, excerpt, author: "Takuma Sato, MD, PhD".
   - Exact same Smart Brevity structure with headings: ## 💡 The Lede, ## 🔍 Why It Matters, <MiddleCtaEn /> (USE THIS TAG FOR ENGLISH), ## 📖 Go Deeper, ## ❓ FAQ.
   - Localize for Western audiences focusing on empowerment and proactive life planning.

### User Draft:
${rawDraft}

---
CRITICAL: ONLY OUTPUT RAW VALID JSON. DO NOT INCLUDE MARKDOWN CODE BLOCKS OUTSIDE THE JSON.
Expected JSON Schema:
{
  "slug": "url-friendly-english-slug",
  "reelScript": "markdown formatted string...",
  "jpBlog": "markdown formatted string...",
  "enBlog": "markdown formatted string..."
}
  `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
            }
        });

        const resultText = response.text || '{}';
        const result = JSON.parse(resultText);

        // 1. Save Instagram Reel to Downloads/Ig_reel
        const igReelDir = path.join(os.homedir(), 'Downloads', 'Ig_reel');
        await fs.mkdir(igReelDir, { recursive: true });
        const reelPath = path.join(igReelDir, `${result.slug}-reel.md`);
        await fs.writeFile(reelPath, result.reelScript);
        console.log(`✅ Saved Reel Script -> ${reelPath}`);

        // 2. Save JP Blog MDX
        const jpBlogDir = path.join(process.cwd(), 'src/content/blog/jp');
        const jpBlogPath = path.join(jpBlogDir, `${result.slug}.mdx`);
        await fs.writeFile(jpBlogPath, result.jpBlog);
        console.log(`✅ Saved JP Blog -> ${jpBlogPath}`);

        // 3. Save EN Blog MDX
        const enBlogDir = path.join(process.cwd(), 'src/content/blog/en');
        const enBlogPath = path.join(enBlogDir, `${result.slug}-en.mdx`);
        await fs.writeFile(enBlogPath, result.enBlog);
        console.log(`✅ Saved EN Blog -> ${enBlogPath}`);

        console.log("🎉 All content generated and distributed successfully!");

    } catch (err: any) {
        console.error("❌ Error generating content:");
        console.error(err);
    }
}

main();
