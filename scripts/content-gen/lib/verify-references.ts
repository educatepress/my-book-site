/**
 * Agent 3: 文献ハルシネーション検証エージェント
 *
 * 生成されたブログ記事から PMID を抽出し、PubMed API で実在確認 + メタデータ照合を行う。
 * Agent 2（Gemini）が Agent 1 の論文情報を正しくコピーしたかを独立検証する。
 */

import { fetchPubMedSummary, type VerifiedReference } from './pubmed-research';
import { GoogleGenAI } from '@google/genai';

export interface ReferenceCheck {
    pmid: string;
    citedAuthor: string;   // 記事内に記載された著者名
    citedJournal: string;  // 記事内に記載された雑誌名
    citedYear: string;     // 記事内に記載された年
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

// ── MDX から PMID を抽出 ──
function extractPmidsFromMdx(mdx: string): string[] {
    const pmids: string[] = [];
    // PMID: 32767206 or PMID:32767206 or pubmed.ncbi.nlm.nih.gov/32767206
    const patterns = [
        /PMID:?\s*(\d{5,8})/gi,
        /pubmed\.ncbi\.nlm\.nih\.gov\/(\d{5,8})/g,
    ];
    for (const pattern of patterns) {
        let match;
        while ((match = pattern.exec(mdx)) !== null) {
            if (!pmids.includes(match[1])) {
                pmids.push(match[1]);
            }
        }
    }
    return pmids;
}

// ── References セクションから引用情報を抽出 ──
function extractCitationDetails(mdx: string): Map<string, { author: string; journal: string; year: string }> {
    const details = new Map<string, { author: string; journal: string; year: string }>();

    // References セクションを抽出
    const refMatch = mdx.match(/#{1,4}\s*(?:参考|References)[^\n]*\n([\s\S]*?)(?=#{1,4}\s|$)/i);
    if (!refMatch) return details;
    const refSection = refMatch[1];

    // 各行から著者・雑誌・年・PMID を抽出
    const lines = refSection.split('\n').filter(l => l.trim().length > 0);
    for (const line of lines) {
        const pmidMatch = line.match(/PMID:?\s*(\d{5,8})/i) || line.match(/pubmed\.ncbi\.nlm\.nih\.gov\/(\d{5,8})/);
        if (!pmidMatch) continue;
        const pmid = pmidMatch[1];

        // 著者: "AuthorName P," or "AuthorName P, et al." — 行頭のリストマーカーを除去してから取得
        const cleanLine = line.replace(/^\s*[\*\-]\s*/, '').replace(/^\d+\.\s*/, '');
        const authorMatch = cleanLine.match(/^([A-Za-z\u00C0-\u024F]+(?:\s[A-Z][A-Za-z]*)?)[\s,]/);
        const author = authorMatch ? authorMatch[1].trim() : '';

        // 雑誌: イタリック *Journal* or PMID/年の直前の "Journal. Year" パターン
        const journalMatch = line.match(/\*([^*]+)\*/) ||
            line.match(/\.\s+([A-Z][A-Za-z\s&]+)\.\s*(?:19|20)\d{2}/) ||  // Journal. Year
            line.match(/\.\s+([A-Z][A-Za-z\s&]+)\.\s*\[?PMID/i);         // Journal. PMID
        const journal = journalMatch ? journalMatch[1].trim() : '';

        // 年: 4桁数字（PMID以外）
        const yearCandidates = line.match(/\b(19|20)\d{2}\b/g) || [];
        // PMID自体を除外（7-8桁なので4桁年とは区別される。ただし念のため）
        const year = yearCandidates.find(y => !line.includes(`PMID: ${y}`) && !line.includes(`PMID:${y}`)) || '';

        details.set(pmid, { author, journal, year });
    }

    return details;
}

// ── 著者名の姓を正規化して比較 ──
function normalizeAuthorSurname(name: string): string {
    // "Florou P" → "florou", "Kim S" → "kim", "李 M" → "李"
    const parts = name.split(/[\s,]+/).filter(p => p.length > 0);
    // 姓は最も長いパート（イニシャルを避ける）
    const surname = parts.reduce((a, b) => a.length >= b.length ? a : b, parts[0] || '');
    return surname.toLowerCase().replace(/[^a-z\u00C0-\u024F\u3000-\u9FFF\uAC00-\uD7AF]/g, '');
}

// ── 雑誌名の正規化（略称揺れを吸収）──
function normalizeJournal(name: string): string {
    return name.toLowerCase()
        .replace(/[.\-_*]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
}

// ── メイン検証関数 ──
export async function verifyBlogReferences(mdxContent: string): Promise<VerificationResult> {
    const pmids = extractPmidsFromMdx(mdxContent);

    if (pmids.length === 0) {
        return { passed: true, checkedCount: 0, details: [], failures: [] };
    }

    const citationDetails = extractCitationDetails(mdxContent);
    const pubmedData = await fetchPubMedSummary(pmids);
    const pubmedMap = new Map(pubmedData.map(r => [r.pmid, r]));

    const details: ReferenceCheck[] = [];
    const failures: string[] = [];

    for (const pmid of pmids) {
        const pubmed = pubmedMap.get(pmid);
        const cited = citationDetails.get(pmid) || { author: '', journal: '', year: '' };

        if (!pubmed) {
            details.push({
                pmid, citedAuthor: cited.author, citedJournal: cited.journal, citedYear: cited.year,
                exists: false, authorMatch: false, journalMatch: false, yearMatch: false,
            });
            failures.push(`PMID ${pmid}: PubMedに存在しない`);
            continue;
        }

        // 著者チェック（組織名の場合はキーワード部分一致で判定）
        let authorMatch = true;
        if (cited.author) {
            const citedNorm = normalizeAuthorSurname(cited.author);
            const pubmedNorm = normalizeAuthorSurname(pubmed.firstAuthor);
            // 組織名（ASRM, ACOG, WHO, Ethics Committee等）はキーワード一致で許容
            const orgKeywords = ['asrm', 'acog', 'who', 'committee', 'practice', 'ethics'];
            const isOrgCitation = orgKeywords.some(k => cited.author.toLowerCase().includes(k));
            const isOrgPubmed = orgKeywords.some(k => pubmed.firstAuthor.toLowerCase().includes(k));
            if (isOrgCitation && isOrgPubmed) {
                authorMatch = true; // 両方が組織名なら一致とみなす
            } else {
                authorMatch = citedNorm === pubmedNorm;
            }
        }

        // 雑誌チェック
        // 雑誌名: ワード単位で2語以上一致 or 片方が他方を含む
        let journalMatch = true;
        if (cited.journal) {
            const citedWords = normalizeJournal(cited.journal).split(/\s+/).filter(w => w.length > 2);
            const pubmedWords = normalizeJournal(pubmed.journal).split(/\s+/).filter(w => w.length > 2);
            const overlap = citedWords.filter(w => pubmedWords.includes(w));
            journalMatch = overlap.length >= 2 ||
                normalizeJournal(cited.journal).includes(normalizeJournal(pubmed.journal)) ||
                normalizeJournal(pubmed.journal).includes(normalizeJournal(cited.journal));
        }

        // 年チェック（±1年許容）
        const citedYearNum = parseInt(cited.year, 10);
        const yearMatch = cited.year
            ? !isNaN(citedYearNum) && Math.abs(citedYearNum - pubmed.year) <= 1
            : true;

        details.push({
            pmid, citedAuthor: cited.author, citedJournal: cited.journal, citedYear: cited.year,
            exists: true, authorMatch, journalMatch, yearMatch,
        });

        if (!authorMatch) failures.push(`PMID ${pmid}: 著者不一致 (記事: ${cited.author}, PubMed: ${pubmed.firstAuthor})`);
        if (!journalMatch) failures.push(`PMID ${pmid}: 雑誌不一致 (記事: ${cited.journal}, PubMed: ${pubmed.journal})`);
        if (!yearMatch) failures.push(`PMID ${pmid}: 年不一致 (記事: ${cited.year}, PubMed: ${pubmed.year})`);
    }

    // ── 本文中の未検証組織引用チェック ──
    // References外の本文で「WHO（2023）」「ASRMは〜推奨」等と書かれていた場合、
    // その組織の論文がReferencesに含まれていなければ警告
    const bodyWithoutRefs = mdxContent.replace(/#{1,4}\s*(?:参考文献?|References)[\s\S]*$/i, '');
    const orgPatterns = [
        /\b(WHO|World Health Organization)\s*[\(（]\s*\d{4}/gi,
        /\b(ASRM|American Society for Reproductive Medicine)\s*[\(（]/gi,
        /\b(ACOG|American College of Obstetricians)/gi,
        /\b(JSOG|日本産科婦人科学会)/gi,
        /\b(ESHRE|European Society of Human Reproduction)/gi,
    ];
    const referencedOrgs = new Set(
        pubmedData.map(r => r.firstAuthor.toLowerCase())
            .concat(pubmedData.map(r => r.journal.toLowerCase()))
            .join(' ')
    );
    for (const pattern of orgPatterns) {
        let match;
        while ((match = pattern.exec(bodyWithoutRefs)) !== null) {
            const orgName = match[1];
            // Referencesにこの組織の論文があるかチェック
            const orgLower = orgName.toLowerCase();
            const hasInRefs = pubmedData.some(r =>
                r.firstAuthor.toLowerCase().includes(orgLower) ||
                r.journal.toLowerCase().includes(orgLower) ||
                r.title.toLowerCase().includes(orgLower)
            );
            if (!hasInRefs) {
                failures.push(`本文中に "${orgName}" の引用があるが、Referencesに対応する論文がない（ハルシネーションの可能性）`);
                break; // 同じ組織は1回だけ報告
            }
        }
    }

    return {
        passed: failures.length === 0,
        checkedCount: pmids.length,
        details,
        failures,
    };
}

// ══════════════════════════════════════════════════════════
// Checker 1b: 内容整合チェック（AI — 論文abstract vs 記事内引用）
// ══════════════════════════════════════════════════════════

const EUTILS_BASE = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils';

async function fetchAbstract(pmid: string): Promise<string> {
    const url = `${EUTILS_BASE}/efetch.fcgi?db=pubmed&id=${pmid}&rettype=abstract&retmode=text`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);
    try {
        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) return '';
        const text = await res.text();
        return text.substring(0, 2000); // 長すぎる場合はトリム
    } catch {
        return '';
    } finally {
        clearTimeout(timeoutId);
    }
}

function extractCitationContext(mdxContent: string, pmid: string, firstAuthorSurname?: string): string {
    const lines = mdxContent.split('\n');
    const contexts: string[] = [];

    // 1. PMID直接参照の前後を抽出
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes(pmid)) {
            const start = Math.max(0, i - 5);
            const end = Math.min(lines.length, i + 3);
            contexts.push(lines.slice(start, end).join('\n'));
        }
    }

    // 2. 著者名（姓）でin-text citationを検索
    if (firstAuthorSurname && firstAuthorSurname.length > 2) {
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].includes(firstAuthorSurname) && !lines[i].includes('PMID')) {
                const start = Math.max(0, i - 2);
                const end = Math.min(lines.length, i + 2);
                contexts.push(lines.slice(start, end).join('\n'));
            }
        }
    }

    // 3. Referencesセクション以外の本文全体も含める（AIが文脈を理解するため）
    const bodyWithoutRefs = mdxContent.replace(/#{1,4}\s*(?:参考文献?|References)[\s\S]*$/i, '');

    // 引用文脈 + 本文抜粋を返す
    const citationParts = contexts.length > 0
        ? `【この論文の引用箇所】\n${contexts.join('\n---\n')}`
        : '';
    const bodyExcerpt = `\n\n【記事本文（抜粋）】\n${bodyWithoutRefs.substring(0, 1500)}`;

    return (citationParts + bodyExcerpt).substring(0, 2500);
}

export interface ContentAlignmentResult {
    passed: boolean;
    checkedCount: number;
    failures: string[];
    warnings: string[];
}

export async function checkContentAlignment(
    mdxContent: string,
    pmids: string[],
): Promise<ContentAlignmentResult> {
    if (pmids.length === 0) {
        return { passed: true, checkedCount: 0, failures: [], warnings: [] };
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.warn('  ⚠️ GEMINI_API_KEY未設定 — Checker 1b スキップ');
        return { passed: true, checkedCount: 0, failures: [], warnings: [] };
    }

    const ai = new GoogleGenAI({ apiKey });
    const failures: string[] = [];
    const warnings: string[] = [];

    for (const pmid of pmids) {
        const abstract = await fetchAbstract(pmid);
        if (!abstract) {
            warnings.push(`PMID ${pmid}: アブストラクト取得失敗（スキップ）`);
            continue;
        }

        // PubMedメタデータから著者姓を取得
        const pubmedMeta = await fetchPubMedSummary([pmid]);
        const authorSurname = pubmedMeta[0]?.firstAuthor?.split(/[\s,]/)[0] || '';
        const citationContext = extractCitationContext(mdxContent, pmid, authorSurname);
        if (!citationContext || citationContext.length < 50) continue;

        const prompt = `あなたは医学論文の引用整合性チェッカーです。

【論文のアブストラクト（実際の内容）】
${abstract}

【ブログ記事内でのこの論文の引用のされ方】
${citationContext}

【チェック項目】
1. 記事がこの論文の結論を正しく引用しているか？
2. 論文の結論を逆に書いていないか？（例: 論文は「有意差なし」なのに記事は「有意に改善」と書いている）
3. 論文のデータ（数値・割合）を正確に引用しているか？

【出力】
問題がなければ: OK
問題がある場合: FAIL: [具体的な不一致内容を1文で]

1行で回答してください。`;

        try {
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: { temperature: 0.1 },
            });
            const result = (response.text || '').trim();

            if (result.startsWith('FAIL')) {
                failures.push(`PMID ${pmid} 内容不整合: ${result}`);
                console.error(`  🔴 Checker 1b FAIL — PMID ${pmid}: ${result}`);
            } else {
                console.log(`  ✅ Checker 1b OK — PMID ${pmid}`);
            }
        } catch (e: any) {
            warnings.push(`PMID ${pmid}: AI検証エラー (${e.message})`);
        }

        // PubMed APIのレート制限対策
        await new Promise(r => setTimeout(r, 500));
    }

    return {
        passed: failures.length === 0,
        checkedCount: pmids.length,
        failures,
        warnings,
    };
}

// ══════════════════════════════════════════════════════════
// Checker 1c: 引用の適切性チェック（AI — 主張と根拠の対応）
// ══════════════════════════════════════════════════════════

export async function checkCitationRelevance(
    mdxContent: string,
): Promise<{ warnings: string[] }> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return { warnings: [] };

    const ai = new GoogleGenAI({ apiKey });

    // 記事本文（References除く）を抽出
    const bodyOnly = mdxContent.replace(/#{1,4}\s*(?:参考文献?|References)[\s\S]*$/i, '').substring(0, 3000);

    const prompt = `あなたは医療コンテンツの引用監査者です。

以下のブログ記事を読み、引用の適切性をチェックしてください。

【チェック項目】
1. 記事の主な主張に対して、引用された論文が適切な根拠になっているか？
2. 背景情報（年齢による低下など）を、あたかも記事の主張の直接的根拠であるかのように使っていないか？
3. 引用のない大きな主張（「〜が効果的」「〜が推奨」等）がないか？

【出力】
問題なし: OK
注意点あり: WARNING: [指摘事項を箇条書きで]

簡潔に回答してください。

【記事本文】
${bodyOnly}`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { temperature: 0.1 },
        });
        const result = (response.text || '').trim();

        if (result.includes('WARNING')) {
            return { warnings: [result] };
        }
        return { warnings: [] };
    } catch {
        return { warnings: [] };
    }
}

// ── References セクションを除去（フォールバック用）──
export function removeReferencesSection(mdx: string): string {
    // "### 参考" or "## References" などで始まるセクションを次の見出しまで除去
    return mdx.replace(/#{1,4}\s*(?:参考文献?|References)[^\n]*\n[\s\S]*?(?=\n#{1,4}\s|\n---|\s*$)/gi, '');
}
