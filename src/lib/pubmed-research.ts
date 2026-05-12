/**
 * PubMed Research Agent — src/lib 版
 *
 * scripts/content-gen/lib/pubmed-research.ts と同一ロジック。
 * Vercel Cron (src/app/) から使えるように src/lib/ に配置。
 * ⚠️ scripts 側を変更した場合はここも同期すること。
 */

const EUTILS_BASE = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils';

export interface VerifiedReference {
    pmid: string;
    title: string;
    firstAuthor: string;
    journal: string;
    year: number;
    doi?: string;
}

async function searchPubMed(query: string, maxResults = 10): Promise<string[]> {
    const params = new URLSearchParams({
        db: 'pubmed',
        term: query,
        retmode: 'json',
        retmax: String(maxResults),
        sort: 'relevance',
    });
    const url = `${EUTILS_BASE}/esearch.fcgi?${params}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);
    try {
        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) throw new Error(`PubMed esearch failed: ${res.status}`);
        const data = await res.json();
        return data.esearchresult?.idlist || [];
    } catch (err: any) {
        if (err.name === 'AbortError') throw new Error('PubMed esearch timeout (15s)');
        throw err;
    } finally {
        clearTimeout(timeoutId);
    }
}

export async function fetchPubMedSummary(pmids: string[]): Promise<VerifiedReference[]> {
    if (pmids.length === 0) return [];
    const params = new URLSearchParams({
        db: 'pubmed',
        id: pmids.join(','),
        retmode: 'json',
    });
    const url = `${EUTILS_BASE}/esummary.fcgi?${params}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);
    let res: Response;
    try {
        res = await fetch(url, { signal: controller.signal });
        if (!res.ok) throw new Error(`PubMed esummary failed: ${res.status}`);
    } catch (err: any) {
        clearTimeout(timeoutId);
        if (err.name === 'AbortError') throw new Error('PubMed esummary timeout (15s)');
        throw err;
    }
    clearTimeout(timeoutId);
    let data: any;
    try {
        data = await res.json();
    } catch {
        throw new Error('PubMed esummary returned invalid JSON');
    }

    const results: VerifiedReference[] = [];
    const summaryResult = data.result || {};
    for (const pmid of pmids) {
        const article = summaryResult[pmid];
        if (!article || article.error) continue;
        const authors = article.authors || [];
        const firstAuthor = authors.length > 0 ? authors[0].name : 'Unknown';
        const yearMatch = (article.pubdate || '').match(/(\d{4})/);
        const year = yearMatch ? parseInt(yearMatch[1], 10) : 0;
        const doiEntry = (article.articleids || []).find((a: any) => a.idtype === 'doi');
        results.push({ pmid, title: article.title || '', firstAuthor, journal: article.source || '', year, doi: doiEntry?.value });
    }
    return results;
}

function extractPmidsFromUrls(urls: string[]): string[] {
    const pmids: string[] = [];
    for (const url of urls) {
        const match = url.match(/pubmed\.ncbi\.nlm\.nih\.gov\/(\d{7,8})/);
        if (match) pmids.push(match[1]);
    }
    return pmids;
}

export async function researchTheme(themeEn: string, sourceUrls: string[], targetCount = 3): Promise<VerifiedReference[]> {
    const collected: VerifiedReference[] = [];
    const existingPmids = extractPmidsFromUrls(sourceUrls);
    if (existingPmids.length > 0) {
        console.log(`  📎 sourceUrls から PMID ${existingPmids.length}件を抽出`);
        const verified = await fetchPubMedSummary(existingPmids);
        for (const ref of verified) { if (ref.year > 0) collected.push(ref); }
    }
    if (collected.length < targetCount) {
        const remaining = targetCount - collected.length;
        const usedPmids = new Set(collected.map(r => r.pmid));
        const typeFilter = '(Review[pt] OR Meta-Analysis[pt] OR Systematic Review[pt] OR Guideline[pt] OR Randomized Controlled Trial[pt])';
        const query = `(${themeEn}) AND ${typeFilter} AND 2015:3000[dp]`;
        console.log(`  🔍 PubMed検索: "${themeEn.slice(0, 50)}..." (残${remaining}件)`);
        const pmids = await searchPubMed(query, remaining + 5);
        if (pmids.length > 0) {
            const candidates = await fetchPubMedSummary(pmids);
            for (const ref of candidates) {
                if (collected.length >= targetCount) break;
                if (usedPmids.has(ref.pmid)) continue;
                if (ref.year > 0) { collected.push(ref); usedPmids.add(ref.pmid); }
            }
        }
        if (collected.length < targetCount) {
            const remaining2 = targetCount - collected.length;
            const broaderQuery = `(${themeEn}) AND 2015:3000[dp]`;
            console.log(`  🔍 フィルター緩和して再検索 (残${remaining2}件)`);
            const pmids2 = await searchPubMed(broaderQuery, remaining2 + 5);
            if (pmids2.length > 0) {
                const candidates2 = await fetchPubMedSummary(pmids2);
                for (const ref of candidates2) {
                    if (collected.length >= targetCount) break;
                    if (usedPmids.has(ref.pmid)) continue;
                    if (ref.year > 0) { collected.push(ref); usedPmids.add(ref.pmid); }
                }
            }
        }
    }
    return collected.slice(0, targetCount);
}

export function formatReferencesForPrompt(refs: VerifiedReference[]): string {
    if (refs.length === 0) return '（論文が見つかりませんでした。Referencesセクションは生成しないでください。）';
    return refs.map((r, i) =>
        `${i + 1}. ${r.firstAuthor}, et al. "${r.title}" ${r.journal}. ${r.year}. PMID: ${r.pmid}`
    ).join('\n');
}
