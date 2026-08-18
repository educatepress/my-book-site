import Link from 'next/link';
import { FACT_CHAPTERS } from '@/data/twenty-four-facts';
import { FACT_DETAILS } from '@/data/fact-details';

export function findFact(n: number) {
    for (const ch of FACT_CHAPTERS) {
        const f = ch.facts.find((x) => x.n === n);
        if (f) return { fact: f, chapter: ch };
    }
    return null;
}

/** 事実1件の詳細（日英共通描画）。前後リンクで24項目を回遊できるようにする。 */
export default function FactDetail({ n, lang }: { n: number; lang: 'ja' | 'en' }) {
    const found = findFact(n);
    if (!found) return null;
    const { fact, chapter } = found;
    const c = lang === 'ja' ? fact.ja : fact.en;
    const ch = lang === 'ja' ? chapter.ja : chapter.en;
    const d = FACT_DETAILS[n];
    const dc = lang === 'ja' ? d.ja : d.en;
    const base = lang === 'ja' ? '/24-facts' : '/en/24-facts';

    const t = lang === 'ja'
        ? { fact: '事実', action: 'いま、できること', related: '関連', all: '24の事実に戻る', prev: '前の事実', next: '次の事実', disclaimer: '一般的な情報提供であり、医学的助言ではありません。個別の判断は主治医・専門医にご相談ください。' }
        : { fact: 'Fact', action: 'What you can do now', related: 'Related', all: 'Back to all 24 facts', prev: 'Previous', next: 'Next', disclaimer: 'General information, not medical advice. Please discuss your own situation with your specialist.' };

    return (
        <div className="min-h-screen bg-[var(--color-cream)] py-12 md:py-20 px-4 sm:px-6">
            <article className="max-w-[720px] mx-auto">
                <nav className="mb-6">
                    <Link href={base} className="text-[var(--color-sage)] text-sm font-bold hover:underline">← {t.all}</Link>
                </nav>

                <p className="text-[0.78rem] font-bold text-[var(--color-text-muted)] mb-2">{ch.title}</p>
                <div className="flex items-baseline gap-3 mb-5">
                    <span className="font-en font-black text-[var(--color-sage)] text-3xl leading-none">{String(n).padStart(2, '0')}</span>
                    <h1 className="text-[1.4rem] md:text-[1.9rem] font-black leading-snug text-[var(--color-text-dark)]">{c.title}</h1>
                </div>

                <div className="bg-white rounded-2xl p-6 md:p-8 border border-black/5 shadow-sm mb-6">
                    <p className="text-[1rem] leading-relaxed font-bold mb-5 text-[var(--color-text-dark)]">{c.summary}</p>
                    <p className="text-[0.95rem] leading-[1.9]">{dc.detail}</p>
                </div>

                <div className="bg-[var(--color-sage)]/10 border-l-4 border-[var(--color-sage)] rounded-r-2xl p-5 md:p-6 mb-8">
                    <p className="font-black text-[var(--color-sage)] mb-2 text-[0.9rem]">{t.action}</p>
                    <p className="text-[0.95rem] leading-relaxed">{dc.action}</p>
                </div>

                {d.links && d.links.length > 0 && (
                    <div className="mb-8">
                        <p className="font-bold text-[0.85rem] text-[var(--color-text-muted)] mb-2">{t.related}</p>
                        <div className="flex flex-wrap gap-3">
                            {d.links.map((l) => (
                                <Link key={l.href} href={lang === 'ja' ? l.href : l.hrefEn} className="text-[var(--color-sage)] font-bold hover:underline text-[0.9rem]">
                                    {lang === 'ja' ? l.ja : l.en} →
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                <div className="flex justify-between gap-4 border-t border-black/10 pt-6 mb-6">
                    {n > 1 ? <Link href={`${base}/${n - 1}`} className="text-[var(--color-sage)] font-bold text-[0.88rem] hover:underline">← {t.prev}</Link> : <span />}
                    {n < 24 ? <Link href={`${base}/${n + 1}`} className="text-[var(--color-sage)] font-bold text-[0.88rem] hover:underline text-right">{t.next} →</Link> : <span />}
                </div>

                <p className="text-[0.78rem] text-[var(--color-text-muted)] leading-relaxed">{t.disclaimer}</p>
            </article>
        </div>
    );
}
