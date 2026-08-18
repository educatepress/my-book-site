/**
 * aeo.ts — AEO(AI検索最適化)用の構造化データ補助
 *
 * 2026-08-18 取締役指示: 佐藤尚之『AIに選ばれ、ファンに愛される。』のTRUSTフレーム
 * (Translation/Report&Review/Uniqueness/Sincerity/Truthfulness)をサイトに実装する。
 * 狙い: 生活者がAIに妊活相談をする時代に、AIが引用・推薦できる「機械可読で誠実な」
 * ソースになること。
 *  - Translation: 記事本文にしか無かったFAQ・参考文献をJSON-LD(機械が解析できる形)へ翻訳
 *  - Report: 参考文献(学会GL/教科書)を citation として構造化
 *  - Uniqueness: 著者エンティティ(現役生殖医療専門医・日英バイリンガル)をsameAsで束ねる
 * 生成プロンプトには一切手を触れない(医師監修済み核資産)。既存記事75本×2言語に遡って効く。
 */

export type FaqItem = { question: string; answer: string };

/** 記事MDXからFAQ(Q/A)を抽出する。JP形式(Q1: …/A1: …)とEN形式(### Q: … / A: …)の両方に耐性 */
export function extractFaq(content: string): FaqItem[] {
    const lines = content.split('\n');
    const items: FaqItem[] = [];
    let q: string | null = null;
    let a: string[] = [];
    const push = () => {
        if (q && a.length) items.push({ question: q, answer: a.join(' ').trim() });
        q = null; a = [];
    };
    for (const raw of lines) {
        const line = raw.trim();
        const qm = line.match(/^#{0,4}\s*\**\s*Q\d*\s*[:：]\s*(.+?)\**$/);
        if (qm) { push(); q = qm[1].trim(); continue; }
        if (!q) continue;
        // 次のセクションが始まったら打ち切り
        if (/^(#{1,3}\s|---|参考|References)/.test(line) && !/^#{0,4}\s*\**\s*A\d*\s*[:：]/.test(line)) { push(); continue; }
        const am = line.match(/^#{0,4}\s*\**\s*A\d*\s*[:：]\s*(.+?)\**$/);
        if (am) { a.push(am[1].trim()); continue; }
        if (line) a.push(line);
    }
    push();
    // 変な取れ方(質問だけ・異常に長い等)は捨てて安全側に
    return items.filter(i => i.question.length > 5 && i.answer.length > 20 && i.answer.length < 1200).slice(0, 5);
}

/** 記事MDXから参考文献リストを抽出(「参考（References）」/ "References" 見出し配下の箇条書き) */
export function extractCitations(content: string): string[] {
    const m = content.match(/#{2,4}\s*(?:参考[（(]?References[）)]?|References|参考文献)\s*\n([\s\S]*?)(?=\n#{1,4}\s|\n---|$)/i);
    if (!m) return [];
    return m[1].split('\n')
        .map(l => l.replace(/^\s*[*\-•]\s*/, '').trim())
        // リンクだけの行・書籍CTA・空行を除外し、出典名らしい行だけ残す
        .filter(l => l.length > 10 && l.length < 300 && !/amazon\.|amzn\.to|^\[/.test(l))
        .map(l => l.replace(/\[([^\]]+)\]\([^)]*\)/g, '$1'))
        .slice(0, 10);
}

/** 著者エンティティ(全ページで同一表現=AIが同一人物として束ねられるように) */
export function authorLd(lang: 'ja' | 'en') {
    return {
        '@type': 'Person',
        name: lang === 'ja' ? '佐藤琢磨' : 'Takuma Sato, MD',
        alternateName: lang === 'ja' ? 'Takuma Sato, MD' : '佐藤琢磨',
        jobTitle: lang === 'ja' ? '生殖医療専門医' : 'Reproductive Medicine Specialist',
        url: 'https://ttcguide.co' + (lang === 'en' ? '/en' : ''),
        sameAs: [
            'https://www.instagram.com/dr.sato.fertility.specialist/',
            'https://amazon.co.jp/dp/B0F7XTWJ3X',
            'https://amazon.com/dp/B0F7XTWJ3X',
        ],
    };
}

/** FAQPage JSON-LD を組み立てる(FAQが取れなかった記事では null) */
export function buildFaqLd(faq: FaqItem[], url: string) {
    if (!faq.length) return null;
    return {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        url,
        mainEntity: faq.map(i => ({
            '@type': 'Question',
            name: i.question,
            acceptedAnswer: { '@type': 'Answer', text: i.answer },
        })),
    };
}
