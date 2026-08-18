import Link from 'next/link';
import { EXAMPLE_CASES } from '@/data/example-cases';

/** 架空ケースの読み解き（日英共通描画） */
export default function CasesPage({ lang }: { lang: 'ja' | 'en' }) {
    const t = lang === 'ja'
        ? {
            kicker: '架空ケースで読み方をつかむ',
            title: '同じ数字でも、意味は人によって変わる',
            lead: '検査結果は1つの数字だけでは読めません。年齢・妊活期間・月経周期・他の項目が組み合わさって、初めて「次に何をすべきか」が決まります。ここでは6つの架空ケースで、その読み解き方を示します。',
            warn: 'すべて架空の人物・架空の数値です。実在の患者データは使用していません。ご自身の結果の解釈は、必ず検査を受けた医療機関にご確認ください。',
            profile: '状況', findings: '検査結果', read: 'どう読むか', next: '次にすること',
            facts: '24の事実', factsHref: '/24-facts', panel: '検査結果の読み方', panelHref: '/screening-panel',
        }
        : {
            kicker: 'Worked examples',
            title: 'The Same Number Means Different Things',
            lead: 'A result cannot be read from one number alone. Age, how long you have been trying, cycle pattern and the other values together decide what to do next. Six fictional cases below show how that reading works.',
            warn: 'Every person and every value here is fictional. No real patient data is used. Always confirm the interpretation of your own results with the clinic that ran them.',
            profile: 'Situation', findings: 'Results', read: 'How to read it', next: 'What comes next',
            facts: 'The 24 facts', factsHref: '/en/24-facts', panel: 'Reading your results', panelHref: '/en/screening-panel',
        };

    return (
        <div className="min-h-screen bg-[var(--color-cream)] py-12 md:py-20 px-4 sm:px-6">
            <div className="max-w-[820px] mx-auto">
                <header className="mb-8">
                    <p className="text-[var(--color-sage)] font-bold tracking-[0.16em] text-xs mb-3 uppercase">{t.kicker}</p>
                    <h1 className="text-[1.75rem] md:text-[2.4rem] font-black leading-tight text-[var(--color-text-dark)] mb-5">{t.title}</h1>
                    <p className="leading-relaxed text-[0.95rem] text-[var(--color-text-muted)]">{t.lead}</p>
                </header>

                <p className="text-[0.82rem] leading-relaxed bg-white border border-black/5 rounded-xl px-4 py-3 mb-10 text-[var(--color-text-muted)]">{t.warn}</p>

                <div className="space-y-6">
                    {EXAMPLE_CASES.map((cs) => {
                        const c = lang === 'ja' ? cs.ja : cs.en;
                        return (
                            <section key={cs.id} className="bg-white rounded-2xl p-6 md:p-7 border border-black/5 shadow-sm">
                                <h2 className="font-black text-[1.05rem] mb-4 text-[var(--color-text-dark)]">{c.title}</h2>
                                <p className="text-[0.9rem] leading-relaxed mb-4"><span className="font-bold text-[var(--color-text-muted)]">{t.profile}：</span>{c.profile}</p>
                                <div className="bg-[var(--color-cream)] rounded-xl p-4 mb-4">
                                    <p className="font-bold text-[0.8rem] text-[var(--color-text-muted)] mb-2">{t.findings}</p>
                                    <ul className="text-[0.88rem] space-y-1">
                                        {c.findings.map((f) => <li key={f}>・{f}</li>)}
                                    </ul>
                                </div>
                                <p className="text-[0.92rem] leading-[1.85] mb-4"><span className="font-bold text-[var(--color-sage)]">{t.read}：</span>{c.read}</p>
                                <p className="text-[0.9rem] leading-relaxed bg-[var(--color-sage)]/10 border-l-4 border-[var(--color-sage)] rounded-r-lg px-4 py-3"><span className="font-bold">{t.next}：</span>{c.next}</p>
                            </section>
                        );
                    })}
                </div>

                <footer className="border-t border-black/10 pt-6 mt-10 flex flex-wrap gap-4 text-[0.88rem]">
                    <Link href={t.factsHref} className="text-[var(--color-sage)] font-bold hover:underline">{t.facts}</Link>
                    <Link href={t.panelHref} className="text-[var(--color-sage)] font-bold hover:underline">{t.panel}</Link>
                </footer>
            </div>
        </div>
    );
}
