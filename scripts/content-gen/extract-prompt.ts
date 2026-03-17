import fs from 'fs/promises';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const RESEARCH_DATA_DIR = path.join(__dirname, 'research-data');

async function getLatestResearchFile(): Promise<string | null> {
    try {
        const files = await fs.readdir(RESEARCH_DATA_DIR);
        const mdFiles = files.filter(f => f.endsWith('.md')).sort().reverse();
        if (mdFiles.length === 0) return null;
        return path.join(RESEARCH_DATA_DIR, mdFiles[0]);
    } catch (e) {
        return null;
    }
}

async function main() {
    const latestFile = await getLatestResearchFile();
    if (!latestFile) {
        console.error("❌ No markdown files found in 'research-data' directory.");
        process.exit(1);
    }

    const content = await fs.readFile(latestFile, 'utf8');
    
    // Find Part F Section (first occurrence)
    const partFMatch = content.match(/##?\s*Part\s*F:/i);
    
    if (!partFMatch || partFMatch.index === undefined) {
         console.error("❌ Could not find 'Part F' heading in the markdown file.");
         process.exit(1);
    }
    
    const partFStartIndex = partFMatch.index;

    // Usually the prompt starts after `# 月次コンテンツリサーチ依頼` or similar in Part F block
    const remainingContent = content.substring(partFStartIndex);
    
    // Find heading starting with "# 月次コンテンツリサーチ"
    const match = remainingContent.match(/#\s+月次コンテンツリサーチ.*/);
    
    if (!match || match.index === undefined) {
         console.error("❌ Could not find the start of the prompt (e.g., '# 月次コンテンツリサーチ依頼') in Part F.");
         process.exit(1);
    }

    const promptHeaderIndex = partFStartIndex + match.index;

    // Extract everything from there to the end of the file
    // Note: The prompt usually ends before things like "ファイル名:" but copying the whole chunk is safest
    let extractedPrompt = content.substring(promptHeaderIndex).trim();
    
    // Optional: strip outer formatting if AI outputted it in markdown codeblocks (```md)
    if (extractedPrompt.includes('```')) {
         // This is a rough cleanup if it's wrapped in triple backticks
         // Since the prompt itself has markdown, we only want to strip outer wrap
         const lines = extractedPrompt.split('\n');
         const cleanedLines = lines.filter(line => !line.startsWith('```'));
         extractedPrompt = cleanedLines.join('\n');
    }

    // Copy to clipboard on macOS using pbcopy
    try {
        const child = require('child_process').spawn('pbcopy');
        child.stdin.write(extractedPrompt);
        child.stdin.end();
        console.log(`✅ Extracted next prompt from ${path.basename(latestFile)}`);
        console.log("📋 Successfully copied the prompt to your clipboard!");
        console.log("👉 You can now just 'Cmd+V' (Paste) into Gemini Deep Research.");
    } catch (e) {
        console.error("❌ Failed to copy to clipboard. Ensure you are on macOS and pbcopy is available.");
        console.log("\n--- Extracted Prompt ---\n");
        console.log(extractedPrompt);
    }
}

main().catch(console.error);
