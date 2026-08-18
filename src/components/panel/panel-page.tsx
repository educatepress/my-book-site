import Link from 'next/link';
import { PANEL_GROUPS } from '@/data/screening-panel';

/** ブライダルチェック／不妊症スクリーニングの読み方（日英共通描画） */
export default function PanelPage({ lang }: { lang: 'ja' | 'en' }) {
    const t = lang === 'ja'
        ? {
            kicker: '検査結果の読み方',
            title: 'ブライダルチェックの結果を、自分で読む',
            lead: '検査を受けても、数字の意味までは説明されないことがあります。ここでは各項目について「何を目標にするか」「その値が意味すること」「注意点」を、生殖医療専門医が整理しました。',
            target: '目標値', means: '意味すること', note: '注意点',
            numbers: '数字と、その限界', numbersHref: '/fertility-numbers',
            facts: '24の事実', factsHref: '/24-facts',
            disclaimer: '一般的な情報提供であり、医学的助言ではありません。判定の線は施設により異なります。結果の解釈は必ず検査を受けた医療機関にご確認ください。',
        }
        : {
            kicker: 'Reading your results',
            title: 'How to Read a Preconception Screening Panel',
            lead: 'Being tested is one thing; being told what the numbers mean is another. Here is what each item aims for, what the value indicates, and what to watch out for — set out by a reproductive medicine specialist.',
            target: 'Target', means: 'What it indicates', note: 'Watch out for',
            numbers: 'Fertility numbers and their limits', numbersHref: '/en/fertility-numbers',
            facts: 'The 24 facts', factsHref: '/en/24-facts',
            disclaimer: 'General information, not medical advice. Thresholds vary between laboratories — always confirm interpretation with the clinic that ran your tests.',
        };

    return (
        <div className="min-h-screen bg-[var(--color-cream)] py-12 md:py-20 px-4 sm:px-6">
            <div className="max-w-[880px] mx-auto">
                <header className="mb-10">
                    <p className="text-[var(--color-sage)] font-bold tracking-[0.16em] text-xs mb-3 uppercase">{t.kicker}</p>
                    <h1 className="text-[1.75rem] md:text-[2.5rem] font-black leading-tight text-[var(--color-text-dark)] mb-5">{t.title}</h1>
                    <p className="leading-relaxed text-[0.95rem] text-[var(--color-text-muted)]">{t.lead}</p>
                </header>

                {PANEL_GROUPS.map((g) => (
                    <section key={g.id} className="mb-10">
                        <h2 className="text-lg font-black mb-5 pb-2 border-b-2 border-[var(--color-sage)] text-[var(--color-text-dark)]">
                            {lang === 'ja' ? g.ja : g.en}
                        </h2>
                        <div className="space-y-4">
                            {g.items.map((it) => {
                                const c = lang === 'ja' ? it.ja : it.en;
                                return (
                                    <div key={it.id} className="bg-white rounded-2xl p-5 md:p-6 border border-black/5 shadow-sm">
                                        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-2 mb-3">
                                            <span className="font-black text-[1rem] text-[var(--color-text-dark)]">{c.name}</span>
                                            <span className="text-[0.8rem] font-bold text-white bg-[var(--color-sage)] px-3 py-1 rounded-full">{t.target}: {c.target}</span>
                                        </div>
                                        <p className="text-[0.9rem] leading-relaxed mb-3"><span className="font-bold text-[var(--color-text-muted)]">{t.means}：</span>{c.means}</p>
                                        <p className="text-[0.86rem] leading-relaxed text-[#C1614A] bg-[#C1614A]/5 rounded-lg px-3 py-2"><span className="font-bold">{t.note}：</span>{c.note}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                ))}

                <footer className="border-t border-black/10 pt-6 text-[0.8rem] text-[var(--color-text-muted)]">
                    <p className="mb-3">{t.disclaimer}</p>
                    <div className="flex flex-wrap gap-4">
                        <Link href={t.numbersHref} className="text-[var(--color-sage)] font-bold hover:underline">{t.numbers}</Link>
                        <Link href={t.factsHref} className="text-[var(--color-sage)] font-bold hover:underline">{t.facts}</Link>
                    </div>
                </footer>
            </div>
        </div>
    );
}
