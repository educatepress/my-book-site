/**
 * Agent 1: PubMed テーマ研究エージェント
 *
 * PubMed E-utilities API を使って、テーマに関連する論文を検索・取得する。
 * LLM には論文の検索・生成を一切させない。全て PubMed API から取得する。
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

// ── PubMed esearch: キーワードで PMID リストを取得 ──
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

// ── PubMed esummary: PMID リストからメタデータを取得 ──
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
        const firstAuthor = authors.length > 0
            ? authors[0].name  // "Florou P" 形式
            : 'Unknown';

        const pubDate = article.pubdate || '';
        const yearMatch = pubDate.match(/(\d{4})/);
        const year = yearMatch ? parseInt(yearMatch[1], 10) : 0;

        // DOI 抽出
        const articleIds = article.articleids || [];
        const doiEntry = articleIds.find((a: any) => a.idtype === 'doi');

        results.push({
            pmid,
            title: article.title || '',
            firstAuthor,
            journal: article.source || '',
            year,
            doi: doiEntry?.value,
        });
    }

    return results;
}

// ── sourceUrls から PMID を抽出 ──
function extractPmidsFromUrls(urls: string[]): string[] {
    const pmids: string[] = [];
    for (const url of urls) {
        // https://pubmed.ncbi.nlm.nih.gov/32767206/ → 32767206
        const match = url.match(/pubmed\.ncbi\.nlm\.nih\.gov\/(\d{5,8})/);
        if (match) pmids.push(match[1]);
    }
    return pmids;
}

// ── メイン: テーマから論文3件を取得 ──
export async function researchTheme(
    themeEn: string,
    sourceUrls: string[],
    targetCount = 3,
    searchKeywords?: string,
): Promise<VerifiedReference[]> {
    const collected: VerifiedReference[] = [];

    // Step 1: sourceUrls に含まれる PMID を優先取得
    const existingPmids = extractPmidsFromUrls(sourceUrls);
    if (existingPmids.length > 0) {
        console.log(`  📎 sourceUrls から PMID ${existingPmids.length}件を抽出`);
        const verified = await fetchPubMedSummary(existingPmids);
        for (const ref of verified) {
            if (ref.year > 0) collected.push(ref);
        }
    }

    // Step 2: 不足分を PubMed 検索で補充
    if (collected.length < targetCount) {
        const remaining = targetCount - collected.length;
        const usedPmids = new Set(collected.map(r => r.pmid));

        // 検索クエリ構築: searchKeywords優先、なければテーマから短縮クエリを生成
        const searchTerm = searchKeywords || themeEn.split(/[:\-—?？]/).slice(0, 2).join(' ').trim();
        const typeFilter = '(Review[pt] OR Meta-Analysis[pt] OR Systematic Review[pt] OR Guideline[pt] OR Randomized Controlled Trial[pt])';
        const yearFilter = '2015:3000[dp]';
        const query = `(${searchTerm}) AND ${typeFilter} AND ${yearFilter}`;

        console.log(`  🔍 PubMed検索: "${searchTerm.slice(0, 60)}..." (残${remaining}件)`);
        const pmids = await searchPubMed(query, remaining + 5); // 余裕をもって取得

        if (pmids.length > 0) {
            const candidates = await fetchPubMedSummary(pmids);
            for (const ref of candidates) {
                if (collected.length >= targetCount) break;
                if (usedPmids.has(ref.pmid)) continue;
                if (ref.year > 0) {
                    collected.push(ref);
                    usedPmids.add(ref.pmid);
                }
            }
        }

        // Step 3: それでも足りなければフィルターを緩めて再検索
        if (collected.length < targetCount) {
            const remaining2 = targetCount - collected.length;
            const broaderQuery = `(${searchTerm}) AND 2015:3000[dp]`;
            console.log(`  🔍 フィルター緩和して再検索 (残${remaining2}件)`);
            const pmids2 = await searchPubMed(broaderQuery, remaining2 + 5);

            if (pmids2.length > 0) {
                const candidates2 = await fetchPubMedSummary(pmids2);
                for (const ref of candidates2) {
                    if (collected.length >= targetCount) break;
                    if (usedPmids.has(ref.pmid)) continue;
                    if (ref.year > 0) {
                        collected.push(ref);
                        usedPmids.add(ref.pmid);
                    }
                }
            }
        }
    }

    return collected.slice(0, targetCount);
}

// ── エビデンスレベル判定 ──
export type EvidenceLevel = 'strong' | 'limited' | 'clinical';

export function getEvidenceLevel(refs: VerifiedReference[]): EvidenceLevel {
    if (refs.length >= 3) return 'strong';
    if (refs.length >= 1) return 'limited';
    return 'clinical';
}

// ── 論文リストをプロンプト用テキストに変換 ──
export function formatReferencesForPrompt(refs: VerifiedReference[]): string {
    const level = getEvidenceLevel(refs);

    if (level === 'clinical') {
        return `（PubMed検索で該当する臨床試験・メタ解析が見つかりませんでした。）

【重要：臨床実践ガイド型で執筆してください】
- このテーマはPubMed上のエビデンスが限定的ですが、臨床現場では日常的に扱われる話題です。
- 「参考文献（References）」セクションは生成しないでください。
- 代わりに「参考情報」セクションとして、関連するガイドライン名（ACOG, ASRM, JSOG等）や教科書的知識の出典元を記載してください。
- 記事の冒頭近くに「この疑問に対する大規模臨床試験は現時点では限られていますが、臨床現場では一般的に以下のように考えられています」等の正直な前置きを必ず入れてください。
- 「研究では〜」「データが示す〜」等のエビデンスがあるかのような表現は使わないでください。
- 代わりに「臨床現場では〜」「一般的に〜とされています」「教科書的には〜」等の表現を使ってください。`;
    }

    const refList = refs.map((r, i) =>
        `${i + 1}. ${r.firstAuthor}, et al. "${r.title}" ${r.journal}. ${r.year}. PMID: ${r.pmid}`
    ).join('\n');

    if (level === 'limited') {
        return `${refList}

【注意：限定エビデンス型で執筆してください】
- 上記の論文は${refs.length}件のみです。エビデンスとして限定的であることを記事内で明示してください。
- 「この分野の研究はまだ発展途上であり、今後さらなるデータの蓄積が待たれます」等の留保を記事の結論部に含めてください。
- 論文データの過度な一般化は避け、「〜の可能性が示唆されている」「〜という報告がある」等の慎重な表現を使用してください。`;
    }

    // strong (3件以上)
    return refList;
}
