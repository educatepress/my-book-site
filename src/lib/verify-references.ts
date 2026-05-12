/**
 * Agent 3: 文献検証エージェント — src/lib ラッパー
 * Vercel Cron (src/app/) から使えるように提供。
 */

import { type VerifiedReference } from './pubmed-research';

const EUTILS_BASE = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils';

interface ReferenceCheck {
    pmid: string;
    exists: boolean;
    authorMatch: boolean;
    journalMatch: boolean;
    yearMatch: boolean;
}

export interface VerificationResult {
    passed: boolean;
    checkedCount: number;
    details: ReferenceCheck[];
    failures: string[];
}

async function fetchSummary(pmids: string[]): Promise<Map<string, VerifiedReference>> {
    if (pmids.length === 0) return new Map();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    try {
        const params = new URLSearchParams({ db: 'pubmed', id: pmids.join(','), retmode: 'json' });
        const res = await fetch(`${EUTILS_BASE}/esummary.fcgi?${params}`, { signal: controller.signal });
        if (!res.ok) throw new Error(`esummary ${res.status}`);
        const data = await res.json();
        const map = new Map<string, VerifiedReference>();
        const result = data.result || {};
        for (const pmid of pmids) {
            const a = result[pmid];
            if (!a || a.error) continue;
            const authors = a.authors || [];
            const yearMatch = (a.pubdate || '').match(/(\d{4})/);
            map.set(pmid, {
                pmid,
                title: a.title || '',
                firstAuthor: authors.length > 0 ? authors[0].name : 'Unknown',
                journal: a.source || '',
                year: yearMatch ? parseInt(yearMatch[1], 10) : 0,
            });
        }
        return map;
    } finally {
        clearTimeout(timeoutId);
    }
}

function extractPmidsFromMdx(mdx: string): string[] {
    const pmids: string[] = [];
    const patterns = [/PMID:?\s*(\d{5,8})/gi, /pubmed\.ncbi\.nlm\.nih\.gov\/(\d{5,8})/g];
    for (const p of patterns) {
        let m;
        while ((m = p.exec(mdx)) !== null) {
            if (!pmids.includes(m[1])) pmids.push(m[1]);
        }
    }
    return pmids;
}

function extractCitations(mdx: string): Map<string, { author: string; journal: string; year: string }> {
    const details = new Map();
    const refMatch = mdx.match(/#{1,4}\s*(?:参考文献?|References)[^\n]*\n([\s\S]*?)(?=#{1,4}\s|$)/i);
    if (!refMatch) return details;
    for (const line of refMatch[1].split('\n').filter(l => l.trim())) {
        const pmidM = line.match(/PMID:?\s*(\d{5,8})/i) || line.match(/pubmed\.ncbi\.nlm\.nih\.gov\/(\d{5,8})/);
        if (!pmidM) continue;
        const clean = line.replace(/^\s*[\*\-]\s*/, '').replace(/^\d+\.\s*/, '');
        const authorM = clean.match(/^([A-Za-z\u00C0-\u024F]+(?:\s[A-Z][A-Za-z]*)?)[\s,]/);
        const journalM = line.match(/\*([^*]+)\*/) || line.match(/\.\s+([A-Z][A-Za-z\s&]+)\./);
        const yearCandidates = line.match(/\b(19|20)\d{2}\b/g) || [];
        const year = yearCandidates.find(y => !line.includes(`PMID: ${y}`) && !line.includes(`PMID:${y}`)) || '';
        details.set(pmidM[1], { author: authorM?.[1]?.trim() || '', journal: journalM?.[1]?.trim() || '', year });
    }
    return details;
}

function normSurname(name: string): string {
    const parts = name.split(/[\s,]+/).filter(p => p.length > 0);
    const surname = parts.reduce((a, b) => a.length >= b.length ? a : b, parts[0] || '');
    return surname.toLowerCase().replace(/[^a-z\u00C0-\u024F\u3000-\u9FFF\uAC00-\uD7AF]/g, '');
}

function normJournal(name: string): string {
    return name.toLowerCase().replace(/[.\-_*]/g, '').replace(/\s+/g, ' ').trim();
}

export async function verifyBlogReferences(mdx: string): Promise<VerificationResult> {
    const pmids = extractPmidsFromMdx(mdx);
    if (pmids.length === 0) return { passed: true, checkedCount: 0, details: [], failures: [] };

    const citations = extractCitations(mdx);
    const pubmedMap = await fetchSummary(pmids);

    const details: ReferenceCheck[] = [];
    const failures: string[] = [];

    for (const pmid of pmids) {
        const pub = pubmedMap.get(pmid);
        const cited = citations.get(pmid) || { author: '', journal: '', year: '' };

        if (!pub) {
            details.push({ pmid, exists: false, authorMatch: false, journalMatch: false, yearMatch: false });
            failures.push(`PMID ${pmid}: PubMedに存在しない`);
            continue;
        }

        let authorMatch = true;
        if (cited.author) {
            const orgKw = ['asrm', 'acog', 'who', 'committee', 'practice', 'ethics'];
            const isOrgC = orgKw.some(k => cited.author.toLowerCase().includes(k));
            const isOrgP = orgKw.some(k => pub.firstAuthor.toLowerCase().includes(k));
            authorMatch = (isOrgC && isOrgP) || normSurname(cited.author) === normSurname(pub.firstAuthor);
        }
        let journalMatch = true;
        if (cited.journal) {
            const citedW = normJournal(cited.journal).split(/\s+/).filter(w => w.length > 2);
            const pubW = normJournal(pub.journal).split(/\s+/).filter(w => w.length > 2);
            const overlap = citedW.filter(w => pubW.includes(w));
            journalMatch = overlap.length >= 2 ||
                normJournal(cited.journal).includes(normJournal(pub.journal)) ||
                normJournal(pub.journal).includes(normJournal(cited.journal));
        }
        const citedYear = parseInt(cited.year, 10);
        const yearMatch = cited.year ? !isNaN(citedYear) && Math.abs(citedYear - pub.year) <= 1 : true;

        details.push({ pmid, exists: true, authorMatch, journalMatch, yearMatch });
        if (!authorMatch) failures.push(`PMID ${pmid}: 著者不一致 (${cited.author} vs ${pub.firstAuthor})`);
        if (!journalMatch) failures.push(`PMID ${pmid}: 雑誌不一致 (${cited.journal} vs ${pub.journal})`);
        if (!yearMatch) failures.push(`PMID ${pmid}: 年不一致 (${cited.year} vs ${pub.year})`);
    }

    // 本文中の未検証組織引用チェック
    const bodyWithoutRefs = mdx.replace(/#{1,4}\s*(?:参考文献?|References)[\s\S]*$/i, '');
    const orgPatterns = [
        /\b(WHO|World Health Organization)\s*[\(（]\s*\d{4}/gi,
        /\b(ASRM|American Society for Reproductive Medicine)\s*[\(（]/gi,
        /\b(ACOG|American College of Obstetricians)/gi,
        /\b(JSOG|日本産科婦人科学会)/gi,
        /\b(ESHRE|European Society of Human Reproduction)/gi,
    ];
    for (const pattern of orgPatterns) {
        let match;
        while ((match = pattern.exec(bodyWithoutRefs)) !== null) {
            const orgName = match[1];
            const orgLower = orgName.toLowerCase();
            const hasInRefs = [...pubmedMap.values()].some(r =>
                r.firstAuthor.toLowerCase().includes(orgLower) ||
                r.journal.toLowerCase().includes(orgLower) ||
                r.title.toLowerCase().includes(orgLower)
            );
            if (!hasInRefs) {
                failures.push(`本文中に "${orgName}" の引用があるが、Referencesに対応する論文がない`);
                break;
            }
        }
    }

    return { passed: failures.length === 0, checkedCount: pmids.length, details, failures };
}

export function removeReferencesSection(mdx: string): string {
    // References が末尾にある場合も対応（次の見出し or ドキュメント終端）
    return mdx.replace(/#{1,4}\s*(?:参考文献?|References)[^\n]*\n[\s\S]*?(?=\n#{1,4}\s|\n---|\s*$)/gi, '');
}
