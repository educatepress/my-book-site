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

// Safety: strip inner double-quotes from YAML frontmatter values to prevent build failures
function sanitizeFrontmatter(mdx: string): string {
    if (!mdx.startsWith('---')) return mdx;
    const endIdx = mdx.indexOf('---', 3);
    if (endIdx === -1) return mdx;
    const fm = mdx.slice(0, endIdx);
    const body = mdx.slice(endIdx);
    const fixedFm = fm.replace(/^((?:title|excerpt|x_post):\s*)"(.*)"\s*$/gm, (_match, prefix, value) => {
        const cleaned = value.replace(/"/g, "'");
        return `${prefix}"${cleaned}"`;
    });
    return fixedFm + body;
}

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
You are an expert AI content generator for Dr. Takuma Sato, a Reproductive Medicine Specialist.
Your task is to take the user's rough draft and output 3 specific assets in JSON format.
Today's Date is: ${today}.

Assets to generate:
1. "reelScript": A Google Vids scene format script for an Instagram Reel. 
   - Each scene should have: Scene Title, Visual Description, Voiceover text, and Text on screen. 
   - The tone must be educational, empathetic, and lead to an "Aha!" moment.
2. "jpBlog": A complete Japanese MDX blog post.
   - Must start with Markdown frontmatter. Wrap title string in double quotes to avoid YAML colon errors (title: "...", date as YYYY-MM-DD, excerpt, author: "佐藤 琢磨").
   - Formal but approachable medical tone. Use markdown headings and lists. Includes a CTA to the book at the end.
   - The book CTA MUST use this exact URL: https://amazon.co.jp/dp/B0F7XTWJ3X?tag=ttcguide-blog-22
   - Use slug in english format (e.g. why-egg-freezing) under "slug" key in JSON.
3. "enBlog": An English translated and localized MDX blog post.
   - The English version MUST sound natural to Western audiences (focus on Empowerment and Evidence-based choices).
   - Must have English frontmatter. Wrap title string in double quotes (title: "...", date, excerpt: "...", author: "Takuma Sato, MD, PhD").
   - The book CTA MUST use this exact URL: https://amazon.com/dp/B0F7XTWJ3X?tag=ttcguide-enblog-22

### User Draft:
${rawDraft}

---
CRITICAL: ONLY OUTPUT RAW VALID JSON. DO NOT INCLUDE MARKDOWN CODE BLOCKS. DO NOT INCLUDE ANY OTHER TEXT.
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
        await fs.writeFile(jpBlogPath, sanitizeFrontmatter(result.jpBlog));
        console.log(`✅ Saved JP Blog -> ${jpBlogPath}`);

        // 3. Save EN Blog MDX
        const enBlogDir = path.join(process.cwd(), 'src/content/blog/en');
        const enBlogPath = path.join(enBlogDir, `${result.slug}-en.mdx`);
        await fs.writeFile(enBlogPath, sanitizeFrontmatter(result.enBlog));
        console.log(`✅ Saved EN Blog -> ${enBlogPath}`);

        console.log("🎉 All content generated and distributed successfully!");

    } catch (err: any) {
        console.error("❌ Error generating content:");
        console.error(err);
    }
}

main();
