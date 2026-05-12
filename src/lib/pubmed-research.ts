/**
 * PubMed Research Agent — src/lib ラッパー
 * Vercel Cron (src/app/) から使えるように scripts/content-gen/lib/ のロジックを再エクスポート。
 * 注: scripts 側は tsconfig.scripts.json でコンパイルされるため、直接 import できない。
 *     ここでは同じロジックをインラインで提供する。
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
    const res = await fetch(`${EUTILS_BASE}/esearch.fcgi?${params}`);
    if (!res.ok) throw new Error(`PubMed esearch failed: ${res.status}`);
    const data = await res.json();
    return data.esearchresult?.idlist || [];
}

async function fetchPubMedSummary(pmids: string[]): Promise<VerifiedReference[]> {
    if (pmids.length === 0) return [];
    const params = new URLSearchParams({
        db: 'pubmed',
        id: pmids.join(','),
        retmode: 'json',
    });
    const res = await fetch(`${EUTILS_BASE}/esummary.fcgi?${params}`);
    if (!res.ok) throw new Error(`PubMed esummary failed: ${res.status}`);
    const data = await res.json();
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
        const verified = await fetchPubMedSummary(existingPmids);
        for (const ref of verified) { if (ref.year > 0) collected.push(ref); }
    }
    if (collected.length < targetCount) {
        const usedPmids = new Set(collected.map(r => r.pmid));
        const typeFilter = '(Review[pt] OR Meta-Analysis[pt] OR Systematic Review[pt] OR Guideline[pt] OR Randomized Controlled Trial[pt])';
        const query = `(${themeEn}) AND ${typeFilter} AND 2015:3000[dp]`;
        const pmids = await searchPubMed(query, targetCount - collected.length + 5);
        if (pmids.length > 0) {
            const candidates = await fetchPubMedSummary(pmids);
            for (const ref of candidates) {
                if (collected.length >= targetCount) break;
                if (usedPmids.has(ref.pmid)) continue;
                if (ref.year > 0) { collected.push(ref); usedPmids.add(ref.pmid); }
            }
        }
        if (collected.length < targetCount) {
            const broaderQuery = `(${themeEn}) AND 2015:3000[dp]`;
            const pmids2 = await searchPubMed(broaderQuery, targetCount - collected.length + 5);
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
