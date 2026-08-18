import Link from 'next/link';
import { factsForSlug } from '@/data/fact-articles';
import { findFact } from '@/components/facts/fact-detail';

/**
 * 記事 → 24事実 への逆リンク（2026-08-18）。
 * 記事単体で流入した読者を、知識の体系（本）側へ戻す導線。
 * 該当が無い記事では何も描画しない。
 */
export default function RelatedFacts({ slug, lang }: { slug: string; lang: 'ja' | 'en' }) {
    const ns = factsForSlug(slug);
    if (ns.length === 0) return null;
    const base = lang === 'ja' ? '/24-facts' : '/en/24-facts';
    const label = lang === 'ja' ? 'この記事に関係する「24の事実」' : 'Where this sits in the 24 facts';
    const all = lang === 'ja' ? '24の事実をすべて見る' : 'See all 24 facts';

    return (
        <aside className="mt-12 bg-[var(--color-sage)]/8 border-l-4 border-[var(--color-sage)] rounded-r-2xl p-5 md:p-6">
            <p className="font-black text-[var(--color-sage)] mb-3 text-[0.9rem]">{label}</p>
            <ul className="space-y-2 mb-4">
                {ns.map((n) => {
                    const f = findFact(n);
                    if (!f) return null;
                    const c = lang === 'ja' ? f.fact.ja : f.fact.en;
                    return (
                        <li key={n}>
                            <Link href={`${base}/${n}`} className="flex gap-3 items-baseline hover:underline">
                                <span className="font-en font-black text-[var(--color-sage)] text-sm shrink-0">{String(n).padStart(2, '0')}</span>
                                <span className="text-[0.9rem] leading-snug font-bold text-[var(--color-text-dark)]">{c.title}</span>
                            </Link>
                        </li>
                    );
                })}
            </ul>
            <Link href={base} className="text-[var(--color-sage)] font-bold text-[0.85rem] hover:underline">{all} →</Link>
        </aside>
    );
}
