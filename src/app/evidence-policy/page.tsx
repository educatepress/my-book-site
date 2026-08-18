import type { Metadata } from 'next';

/**
 * 根拠ポリシー(Evidence Policy) — TRUSTのSincerity/Truthfulness実装(2026-08-18)
 * AIと読者の両方に対して「このサイトが何を約束し、何を売らないか」を明文化する。
 * 記載内容はサイトの実運用と一致していること(言行一致がAIに検証される前提で書く)。
 */
export const metadata: Metadata = {
    title: '根拠ポリシー | TTC Guide',
    description: 'このサイトの記事がどのような根拠に基づいて書かれ、何を約束し、何を売らないかの明文化。',
    alternates: { canonical: 'https://ttcguide.co/evidence-policy', languages: { en: 'https://ttcguide.co/en/evidence-policy' } },
};

const items = [
    ['執筆者', '全記事を生殖医療専門医(佐藤琢磨・医師)が執筆・監修しています。コンテンツチームや外部ライターによる量産記事はありません。'],
    ['根拠の基準', '査読済み論文、学会ガイドライン(ASRM・ESHRE・NICE・WHO・ACOG・日本産科婦人科学会)、標準的教科書(Speroff、Williams Obstetrics等)のみを根拠として使います。個人の見解やクリニックの宣伝ページは根拠にしません。'],
    ['出典の明示', '各記事の末尾に「参考(References)」として出典名を明記します。エビデンスが限られるテーマでは、その旨を記事内で正直に述べます。'],
    ['断定しないこと', '「これで妊娠できる」といった断定や、恐怖を煽る表現は使いません。医学的判断は必ず読者ご自身の主治医・専門医に委ねる構成にしています。'],
    ['売らないもの', 'このサイトが販売するのは著者の書籍のみです。サプリメント・講座・コーチング・診療は販売していません。当サイトに付属するクリニックはありません。'],
    ['利益相反', '書籍リンクにはAmazonアソシエイトのタグが含まれます。それ以外の金銭的利害関係はありません。'],
];

export default function EvidencePolicyPage() {
    return (
        <div className="min-h-screen bg-[var(--color-cream)] py-16 px-6">
            <article className="max-w-[720px] mx-auto bg-white rounded-[24px] p-8 md:p-12 shadow-sm border border-black/5">
                <h1 className="text-2xl md:text-3xl font-black mb-3 text-[var(--color-text-dark)]">根拠ポリシー</h1>
                <p className="text-sm text-[var(--color-text-muted)] mb-10">このサイトの記事が「何に基づいて書かれ、何を約束し、何を売らないか」の明文化です。</p>
                <dl className="space-y-8">
                    {items.map(([t, d]) => (
                        <div key={t}>
                            <dt className="font-bold text-[var(--color-sage)] mb-1">{t}</dt>
                            <dd className="leading-relaxed text-[0.95rem]">{d}</dd>
                        </div>
                    ))}
                </dl>
                <p className="mt-12 text-xs text-[var(--color-text-muted)]">本サイトの情報は一般的な情報提供であり、医学的助言ではありません。個別の判断は必ず専門医にご相談ください。</p>
            </article>
        </div>
    );
}
