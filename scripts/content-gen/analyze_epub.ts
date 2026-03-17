import 'dotenv/config';
import { GoogleGenAI } from '@google/genai';
import fs from 'fs/promises';
import path from 'path';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function main() {
    const imagesDir = path.resolve('/tmp/epub-extract/OEBPS/images');
    const files = await fs.readdir(imagesDir);
    const jpgs = files.filter(f => f.endsWith('.jpg')).sort();

    // Take the first 15 pages where preface/intro usually is
    const firstPages = jpgs.slice(0, 15);

    // We also could read book_000.xhtml to see if there is any text, but images work well for fixed-layout too.

    const parts: any[] = [{
        text: "あなたは熟練の編集者です。提供された画像群は電子書籍（EPUB）のもので、表紙・目次・「はじめに」等が含まれています。これを読んで、以下の質問に日本語で回答してください：\n\n1. この本の具体的な「ターゲット層・対象読者」は誰ですか？\n2. 著者の「語り口調・トーン・文体」はどのような特徴がありますか？\n3. ブログ記事の締めくくりとして、この本の販売につながるような「読了後の自然な誘導文（CTAフレーズ）」案を、著者のトーンに合わせて3つほど提案してください。\n\n詳細に分析してください。"
    }];

    for (const file of firstPages) {
        const filePath = path.join(imagesDir, file);
        const data = await fs.readFile(filePath);
        parts.push({
            inlineData: {
                data: data.toString('base64'),
                mimeType: 'image/jpeg'
            }
        });
    }

    console.log("Analyzing images with Gemini...");
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: parts
    });

    console.log("=== GEMINI ANALYSIS ===");
    console.log(response.text);
}

main().catch(console.error);
