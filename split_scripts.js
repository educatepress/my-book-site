const fs = require('fs');
const path = require('path');

const textFile = 'src/app/api/cron/auto-generator-text/route.ts';
let textCode = fs.readFileSync(textFile, 'utf8');

// Mod 1: Title
textCode = textCode.replace('🤖 Auto Generator Cron Job Started.', '🤖 Auto Generator (TEXT) Cron Job Started.');

// Mod 2: Remove PROMPT 2 and its execution
const visualPromptRegex = /\/\/ ==========================================\n\s*\/\/ PROMPT 2: 動画・画像アセット.*?const visualPrompt = `.*?`;/s;
textCode = textCode.replace(visualPromptRegex, '');

// Mod 3: Parallel execution to just text
const parallelRegex = /const \[textResponse, visualResponse\] = await Promise\.all\(\[\s*(.*?)\s*,\s*ai\.models\.generateContent\(\{[\s\S]*?\}\s*\)\s*\]\);/s;
textCode = textCode.replace(parallelRegex, 'const textResponse = await $1;');

// Mod 4: Result Parsing
const resultParseRegex = /const rawText = textResponse\.text \|\| '\{\}';\s*const rawVisual = visualResponse\.text \|\| '\{\}';[\s\S]*?const \{ slug, jpBlog, enBlog, xPost \} = textResult;\s*const \{ reelScript, carouselJson \} = visualResult;/s;
textCode = textCode.replace(resultParseRegex, `const rawText = textResponse.text || '{}';
    let textResult: any;
    try {
        textResult = JSON.parse(rawText.replace(/^\`\`\`json?\\n?/i, '').replace(/\\n?\`\`\`\s*$/i, '').trim());
    } catch(e) {
        throw new Error('Invalid JSON format from AI response');
    }
    const { slug, jpBlog, enBlog, xPost } = textResult;`);

// Mod 5: Remove reel and carousel queue additions
const queueRegex = /\/\/ 3\. キューにReel原案を登録[\s\S]*?\/\/ 4\. キューにCarousel原案を登録[\s\S]*?\}\);/s;
textCode = textCode.replace(queueRegex, '');

// Mod 6: Update ThemeSchedule to text_generated
textCode = textCode.replace(`updateThemeScheduleStatus(pendingTopic.rowNumber, 'generated');`, `updateThemeScheduleStatus(pendingTopic.rowNumber, 'text_generated');`);

fs.writeFileSync(textFile, textCode);

// --- Visual Generation Script ---
const visualFile = 'src/app/api/cron/auto-generator-visual/route.ts';
let visualCode = fs.readFileSync(visualFile, 'utf8');

// Mod 1: Title
visualCode = visualCode.replace('🤖 Auto Generator Cron Job Started.', '🤖 Auto Generator (VISUAL) Cron Job Started.');

// Mod 2: Status Check
visualCode = visualCode.replace(/if \(pendingTopic\.status !== 'pending' && pendingTopic\.status !== ''\) \{/, `if (pendingTopic.status !== 'text_generated') {`);

// Mod 3: Remove PROMPT 1
const textPromptRegex = /\/\/ ==========================================\n\s*\/\/ PROMPT 1: テキストアセット.*?const textPrompt = `.*?`;/s;
visualCode = visualCode.replace(textPromptRegex, '');

// Mod 4: Parallel execution to just visual
const parallelRegexV = /const \[textResponse, visualResponse\] = await Promise\.all\(\[\s*ai\.models\.generateContent\(\{[\s\S]*?\}\s*\)\s*,\s*(.*?)\s*\]\);/s;
visualCode = visualCode.replace(parallelRegexV, 'const visualResponse = await $1;');

// Mod 5: Result Parsing
const resultParseRegexV = /const rawText = textResponse\.text \|\| '\{\}';\s*const rawVisual = visualResponse\.text \|\| '\{\}';[\s\S]*?const \{ slug, jpBlog, enBlog, xPost \} = textResult;\s*const \{ reelScript, carouselJson \} = visualResult;/s;
visualCode = visualCode.replace(resultParseRegexV, `const rawVisual = visualResponse.text || '{}';
    let visualResult: any;
    try {
        visualResult = JSON.parse(rawVisual.replace(/^\`\`\`json?\\n?/i, '').replace(/\\n?\`\`\`\s*$/i, '').trim());
    } catch(e) {
        throw new Error('Invalid JSON format from AI response');
    }
    const { reelScript, carouselJson } = visualResult;
    const slug = pendingTopic.brand + "-" + Date.now();`);

// Mod 6: Remove blog and x queue additions
const queueRegexV = /\/\/ 1\. キューにブログ原案を登録[\s\S]*?\/\/ 2\. キューにX投稿原案を登録[\s\S]*?\}\);/s;
visualCode = visualCode.replace(queueRegexV, '');

fs.writeFileSync(visualFile, visualCode);

console.log('Scripts split successfully.');
