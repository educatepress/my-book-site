import fs from 'fs/promises';
import path from 'path';
import { QueueItem, ContentQueue, getQueue, saveQueue } from './queue-manager.js';
import { batchVerifyUrls } from './url-verifier.js';
import { randomUUID } from 'crypto';

const RESEARCH_DATA_DIR = path.join(__dirname, 'research-data');

// ---------- Config ----------
const EXPECTED_X_MIN = 10;
const EXPECTED_BLOG_MIN = 3;

// ---------- Types ----------
interface ParsedXPost {
    theme: string;
    themeEn: string;
    sourceUrls: string[];
    evidenceSummary: string;
    direction: string;
    directionEn: string;
}

interface ParsedBlogPost {
    theme: string;
    themeEn: string;
    sourceUrls: string[];
    outline: string;
    seoKeywords: string;
    targetLang: string;
}

interface ParsedVideoIdea {
    theme: string;
    format: string;
    hooks: string;
    script: string;
    cta: string;
}

interface VideoQueue {
    lastUpdated: string;
    sourceReport: string;
    videos: Array<ParsedVideoIdea & { id: string; status: 'stock' | 'produced' }>;
}

const VIDEO_QUEUE_PATH = path.join(process.cwd(), 'scripts', 'content-gen', 'video-queue.json');

// ---------- Helpers ----------
async function getLatestResearchFile(): Promise<string | null> {
    try {
        const files = await fs.readdir(RESEARCH_DATA_DIR);
        const mdFiles = files.filter(f => f.endsWith('.md')).sort().reverse();
        if (mdFiles.length === 0) return null;
        return path.join(RESEARCH_DATA_DIR, mdFiles[0]);
    } catch (e: any) {
        if (e.code === 'ENOENT') {
            await fs.mkdir(RESEARCH_DATA_DIR, { recursive: true });
        }
        return null;
    }
}

/**
 * Extract data rows from a markdown table under a given section header.
 * Supports both `##` and `###` level headers.
 */
function extractTableRows(markdown: string, sectionKeyword: string): string[] {
    const lines = markdown.split('\n');
    let inSection = false;
    let headerPassed = false;
    const tableLines: string[] = [];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Match section by keyword (supports ## and ###)
        if (!inSection && line.includes(sectionKeyword)) {
            inSection = true;
            headerPassed = false;
            continue;
        }

        // Exit section when hitting a new ## header
        if (inSection && /^##\s/.test(line) && !line.includes(sectionKeyword)) {
            break;
        }

        if (!inSection) continue;

        // Skip non-table lines
        if (!line.trim().startsWith('|')) continue;

        // Skip separator rows (| --- | --- |)
        if (/^\|[\s-:|]+\|$/.test(line.trim())) {
            headerPassed = true;
            continue;
        }

        // Skip the header row (first row before separator)
        if (!headerPassed) {
            headerPassed = true; // mark header row, next non-separator row = separator
            // Actually, check if next line is separator
            const nextLine = lines[i + 1]?.trim() || '';
            if (/^\|[\s-:|]+\|$/.test(nextLine)) {
                continue; // this is the header row, skip it
            }
        }

        // Data row — must have at least some content
        if (line.trim().length > 5) {
            tableLines.push(line.trim());
        }
    }
    return tableLines;
}

function extractUrlsFromCell(cell: string): string[] {
    const urlRegex = /(https?:\/\/[^\s)\]"'|]+)/g;
    const matches = cell.match(urlRegex) || [];
    return matches.map(m => m.trim());
}

function extractPmids(cell: string): string[] {
    const pmidRegex = /PMID:\s*(\d{6,10})/gi;
    const matches: string[] = [];
    let m;
    while ((m = pmidRegex.exec(cell)) !== null) {
        matches.push(m[1]);
    }
    return matches;
}

// ---------- Main ----------
async function main() {
    console.log("🚀 Starting Markdown -> Queue parser...");

    const latestFile = await getLatestResearchFile();
    if (!latestFile) {
        console.error("❌ No markdown files found in 'research-data' directory.");
        process.exit(1);
    }

    console.log(`📄 Found latest report: ${path.basename(latestFile)}`);
    const content = await fs.readFile(latestFile, 'utf8');

    // ---------- Parse X Posts ----------
    const xRows = extractTableRows(content, 'Part A:');
    const xItems: ParsedXPost[] = xRows.map(row => {
        const cols = row.split('|').map(c => c.trim());
        if (cols.length < 8) return null;
        return {
            theme: cols[2],
            themeEn: cols[3],
            sourceUrls: extractUrlsFromCell(cols[4]),
            evidenceSummary: cols[5],
            direction: cols[6],
            directionEn: cols[7]
        };
    }).filter((i): i is ParsedXPost => i !== null && !!i.theme && !!i.evidenceSummary);

    // ---------- Parse Blog Posts ----------
    const blogRows = extractTableRows(content, 'Part B:');
    const blogItems: ParsedBlogPost[] = blogRows.map(row => {
        const cols = row.split('|').map(c => c.trim());
        if (cols.length < 8) return null;
        return {
            theme: cols[2],
            themeEn: cols[3],
            sourceUrls: extractUrlsFromCell(cols[4]),
            outline: cols[5],
            seoKeywords: cols[6],
            targetLang: cols[7]
        };
    }).filter((i): i is ParsedBlogPost => i !== null && !!i.theme && !!i.outline);

    // ---------- Parse Video Ideas (Part E) ----------
    const videoRows = extractTableRows(content, 'Part E:');
    const videoItems: ParsedVideoIdea[] = videoRows.map(row => {
        const cols = row.split('|').map(c => c.trim());
        if (cols.length < 7) return null;
        return {
            theme: cols[2],
            format: cols[3],
            hooks: cols[4],
            script: cols[5],
            cta: cols[6]
        };
    }).filter((i): i is ParsedVideoIdea => i !== null && !!i.theme && !!i.script);

    console.log(`✨ Parsed ${xItems.length} X posts, ${blogItems.length} Blog posts, and ${videoItems.length} Video ideas.`);

    // ---------- Validation warnings ----------
    if (xItems.length < EXPECTED_X_MIN) {
        console.warn(`⚠️ Warning: Only ${xItems.length} X posts parsed (expected at least ${EXPECTED_X_MIN}). Check the Markdown table format.`);
    }
    if (blogItems.length < EXPECTED_BLOG_MIN) {
        console.warn(`⚠️ Warning: Only ${blogItems.length} Blog posts parsed (expected at least ${EXPECTED_BLOG_MIN}). Check the Markdown table format.`);
    }

    if (xItems.length === 0 && blogItems.length === 0) {
        console.error("❌ No items were successfully parsed. Aborting.");
        process.exit(1);
    }

    // ---------- URL Verification ----------
    const allUrls: string[] = [];
    for (const x of xItems) allUrls.push(...x.sourceUrls);
    for (const b of blogItems) allUrls.push(...b.sourceUrls);

    const uniqueUrls = [...new Set(allUrls)];
    if (uniqueUrls.length > 0) {
        console.log(`\n🔍 Verifying ${uniqueUrls.length} unique source URLs...`);
        const results = await batchVerifyUrls(uniqueUrls);
        let brokenCount = 0;
        for (const [url, ok] of results) {
            if (!ok) {
                console.warn(`  ⚠️ Unreachable URL: ${url}`);
                brokenCount++;
            }
        }
        if (brokenCount === 0) {
            console.log(`  ✅ All ${uniqueUrls.length} URLs verified successfully.`);
        } else {
            console.warn(`  ⚠️ ${brokenCount}/${uniqueUrls.length} URLs could not be reached. Items will still be queued, but please check manually.`);
        }
    }

    // ---------- PMID extraction ----------
    const pmids: string[] = [];
    for (const x of xItems) {
        pmids.push(...extractPmids(x.sourceUrls.join(' ') + ' ' + x.evidenceSummary));
    }
    if (pmids.length > 0) {
        console.log(`📎 Extracted ${pmids.length} PMIDs: ${pmids.join(', ')}`);
    }

    // ---------- Queue management ----------
    let currentQueue: ContentQueue;
    try {
        currentQueue = await getQueue();
    } catch {
        currentQueue = {
            lastUpdated: new Date().toISOString(),
            sourceReport: "",
            queue: []
        };
    }

    const currentReportName = path.basename(latestFile);
    
    // Prevent double import
    if (currentQueue.sourceReport === currentReportName) {
         console.log(`🟢 The report ${currentReportName} has already been imported into the queue.`);
         console.log(`Current pending X posts: ${currentQueue.queue.filter(q => q.type === 'x' && q.status === 'pending').length}`);
         console.log(`Current pending Blog posts: ${currentQueue.queue.filter(q => q.type === 'blog' && q.status === 'pending').length}`);
         return;
    }

    // Append new items to the queue
    const newItems: QueueItem[] = [];

    for (const x of xItems) {
        newItems.push({
            id: `x-${randomUUID().slice(0, 8)}`,
            theme: x.theme,
            themeEn: x.themeEn,
            sourceUrls: x.sourceUrls,
            direction: x.direction,
            directionEn: x.directionEn,
            type: "x",
            status: "pending"
        });
    }

    for (const b of blogItems) {
        newItems.push({
            id: `blog-${randomUUID().slice(0, 8)}`,
            theme: b.theme,
            themeEn: b.themeEn,
            sourceUrls: b.sourceUrls,
            direction: `構成案:\n${b.outline.replace(/H2:/g, '\n- ')}\n\nSEOキーワード: ${b.seoKeywords}\n\nターゲット言語指定: ${b.targetLang}`,
            directionEn: b.targetLang.includes("EN") ? `Generate an English article based on the provided topic. Target Lang: ${b.targetLang}` : "N/A",
            type: "blog",
            status: "pending"
        });
    }

    // Append to existing queue
    currentQueue.queue.push(...newItems);
    currentQueue.lastUpdated = new Date().toISOString();
    currentQueue.sourceReport = currentReportName;

    await saveQueue(currentQueue);

    console.log(`\n✅ Successfully queued ${newItems.length} new items from ${currentReportName}.`);
    console.log(`   📝 X posts: ${xItems.length}`);
    console.log(`   📝 Blog posts: ${blogItems.length}`);

    // ---------- Save Video Ideas (separate file) ----------
    if (videoItems.length > 0) {
        let videoQueue: VideoQueue;
        try {
            const existing = await fs.readFile(VIDEO_QUEUE_PATH, 'utf8');
            videoQueue = JSON.parse(existing);
        } catch {
            videoQueue = { lastUpdated: '', sourceReport: '', videos: [] };
        }

        // Only add if not already imported from this report
        if (videoQueue.sourceReport !== currentReportName) {
            const newVideos = videoItems.map(v => ({
                id: `video-${randomUUID().slice(0, 8)}`,
                ...v,
                status: 'stock' as const
            }));
            videoQueue.videos.push(...newVideos);
            videoQueue.lastUpdated = new Date().toISOString();
            videoQueue.sourceReport = currentReportName;
            await fs.writeFile(VIDEO_QUEUE_PATH, JSON.stringify(videoQueue, null, 2), 'utf8');
            console.log(`   🎬 Video ideas: ${videoItems.length} (saved to video-queue.json)`);
        } else {
            console.log(`   🎬 Video ideas already imported from this report.`);
        }
    }
}

main().catch(console.error);
