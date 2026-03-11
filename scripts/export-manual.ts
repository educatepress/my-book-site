import fs from 'fs';
import path from 'path';
import os from 'os';
import { marked } from 'marked';

// Path to the manual artifact
const manualPath = '/Users/satoutakuma/.gemini/antigravity/brain/047b5178-015c-41a8-a3e6-b347416e552e/manual.md';

function exportManual() {
    if (!fs.existsSync(manualPath)) {
        console.error('Manual not found at:', manualPath);
        process.exit(1);
    }

    const markdownContent = fs.readFileSync(manualPath, 'utf8');

    // Convert markdown to HTML
    const htmlContent = marked.parse(markdownContent) as string;

    // Wrap in a basic HTML structure that Word understands well
    const wordDocContent = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head><meta charset='utf-8'><title>LP and Blog Manual</title>
    <style>
      body { font-family: 'Yu Gothic', 'Meiryo', sans-serif; line-height: 1.6; }
      h1 { color: #2c3e50; border-bottom: 2px solid #eee; padding-bottom: 5px; }
      h2 { color: #34495e; padding-top: 10px; }
      h3 { color: #555; }
      code { background-color: #f4f4f4; padding: 2px 4px; border-radius: 4px; font-family: monospace; }
      pre { background-color: #f4f4f4; padding: 10px; border-radius: 4px; font-family: monospace; border: 1px solid #ddd; }
      ul, ol { margin-bottom: 15px; }
      li { margin-bottom: 5px; }
    </style>
    </head><body>
    ${htmlContent}
    </body></html>
  `;

    // Save to the Desktop
    const desktopPath = path.join(os.homedir(), 'Desktop');
    const outputPath = path.join(desktopPath, 'LP_Manual.doc');

    fs.writeFileSync(outputPath, wordDocContent, 'utf8');
    console.log('✅ Successfully exported manual to Desktop as LP_Manual.doc');
}

exportManual();
