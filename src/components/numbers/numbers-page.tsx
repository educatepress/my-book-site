import Link from 'next/link';
import { NUMBER_GROUPS, CLINICAL_RULES, KNOWN_UNKNOWN } from '@/data/fertility-numbers';

/**
 * 数字リファレンスの共通描画（日英で同一構造＝AIが両言語を同じ実体として扱える）。
 * 「数字 → 意味 → ✕その数字が言わないこと → 出典」の順で必ず並べる。
 */
export default function NumbersPage({ lang }: { lang: 'ja' | 'en' }) {
    const t = lang === 'ja'
        ? {
            kicker: '数字で見る妊娠と不妊予防',
            title: '妊活の数字と、その限界',
            lead: '妊娠にまつわる数字は検索すればすぐ出てきます。しかし「その数字が何を言っていないか」はほとんど書かれていません。ここでは生殖医療専門医が、出典とともに数字を並べ、それぞれの限界を併記します。',
            timeless: '変わらない', changing: '更新されうる',
            means: '意味', limit: 'この数字が言わないこと', source: '出典',
            rulesTitle: '臨床医としての判断基準',
            rulesNote: '以下はガイドラインではなく、著者（生殖医療専門医）が日々の診療で用いている判断の目安です。一般的な基準とは意図的に異なる部分があるため、根拠もあわせて示します。',
            why: 'なぜそうするか',
            kuTitle: '検査で分かること・分からないこと',
            kuKnown: '検査で分かること', kuUnknown: '検査では分からないこと',
            kuNote: 'タイミング療法や人工授精は、どこがうまくいっていないか分からないまま行う治療である、というのが前提になります。',
            policy: '根拠ポリシー', policyHref: '/evidence-policy',
            blog: '記事一覧', blogHref: '/blog',
            disclaimer: '一般的な情報提供であり、医学的助言ではありません。個別の判断は必ず主治医・専門医にご相談ください。',
        }
        : {
            kicker: 'Fertility by the numbers',
            title: 'Fertility Numbers, and What They Don’t Tell You',
            lead: 'Numbers about fertility are easy to find. What almost nobody publishes is what each number does not say. Below, a reproductive medicine specialist lists the figures with their sources — and the limit of each one.',
            timeless: 'Stable knowledge', changing: 'May be updated',
            means: 'What it means', limit: 'What this number does NOT say', source: 'Source',
            rulesTitle: 'A clinician’s own decision rules',
            rulesNote: 'These are not guidelines. They are the thresholds the author — a practising reproductive medicine specialist — uses in clinic. Where they deliberately differ from the standard advice, the reasoning is given.',
            why: 'Why',
            kuTitle: 'What testing can and cannot reveal',
            kuKnown: 'What tests can tell you', kuUnknown: 'What tests cannot tell you',
            kuNote: 'Timed intercourse and IUI are, by definition, treatments carried out without knowing which step is failing.',
            policy: 'Evidence policy', policyHref: '/en/evidence-policy',
            blog: 'All articles', blogHref: '/en/blog',
            disclaimer: 'General information, not medical advice. Please discuss your own situation with your specialist.',
        };

    return (
        <div className="min-h-screen bg-[var(--color-cream)] py-12 md:py-20 px-4 sm:px-6">
            <div className="max-w-[860px] mx-auto">
                <header className="mb-12">
                    <p className="text-[var(--color-sage)] font-bold tracking-[0.16em] text-xs mb-3 uppercase">{t.kicker}</p>
                    <h1 className="text-[1.75rem] md:text-[2.5rem] font-black leading-tight text-[var(--color-text-dark)] mb-5">{t.title}</h1>
                    <p className="leading-relaxed text-[0.95rem] text-[var(--color-text-muted)]">{t.lead}</p>
                </header>

                {NUMBER_GROUPS.map((g) => (
                    <section key={g.id} className="mb-12">
                        <h2 className="text-lg md:text-xl font-black mb-5 pb-2 border-b-2 border-[var(--color-sage)] text-[var(--color-text-dark)]">
                            {lang === 'ja' ? g.ja : g.en}
                        </h2>
                        <div className="space-y-4">
                            {g.items.map((it) => {
                                const c = lang === 'ja' ? it.ja : it.en;
                                return (
                                    <div key={it.id} className="bg-white rounded-2xl p-5 md:p-6 border border-black/5 shadow-sm">
                                        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2 mb-3">
                                            <span className="text-xl md:text-2xl font-black text-[var(--color-sage)] font-en">{it.value}</span>
                                            <span className="font-bold text-[0.95rem] text-[var(--color-text-dark)]">{c.label}</span>
                                            <span className={`ml-auto text-[0.65rem] font-bold px-2 py-1 rounded-full whitespace-nowrap ${it.stability === 'timeless' ? 'bg-[var(--color-sage)]/15 text-[var(--color-sage)]' : 'bg-black/5 text-[var(--color-text-muted)]'}`}>
                                                {it.stability === 'timeless' ? t.timeless : t.changing}
                                            </span>
                                        </div>
                                        <p className="text-[0.92rem] leading-relaxed mb-3">{c.means}</p>
                                        <p className="text-[0.88rem] leading-relaxed text-[#C1614A] bg-[#C1614A]/5 rounded-lg px-3 py-2 mb-3">
                                            <span className="font-bold">✕ {t.limit}：</span>{c.limit}
                                        </p>
                                        <p className="text-[0.75rem] text-[var(--color-text-muted)]">{t.source}: {it.source}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                ))}

                <section className="mb-12">
                    <h2 className="text-lg md:text-xl font-black mb-3 pb-2 border-b-2 border-[#C1614A] text-[var(--color-text-dark)]">{t.rulesTitle}</h2>
                    <p className="text-[0.85rem] text-[var(--color-text-muted)] leading-relaxed mb-5">{t.rulesNote}</p>
                    <div className="space-y-4">
                        {CLINICAL_RULES.map((r) => {
                            const c = lang === 'ja' ? r.ja : r.en;
                            return (
                                <div key={r.id} className="bg-white rounded-2xl p-5 md:p-6 border-l-4 border-[#C1614A] border-y border-r border-black/5 shadow-sm">
                                    <p className="font-bold leading-relaxed mb-2 text-[0.98rem]">{c.rule}</p>
                                    <p className="text-[0.88rem] leading-relaxed text-[var(--color-text-muted)]"><span className="font-bold">{t.why}：</span>{c.why}</p>
                                </div>
                            );
                        })}
                    </div>
                </section>

                <section className="mb-12">
                    <h2 className="text-lg md:text-xl font-black mb-5 pb-2 border-b-2 border-[var(--color-sage)] text-[var(--color-text-dark)]">{t.kuTitle}</h2>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="bg-white rounded-2xl p-5 border border-black/5 shadow-sm">
                            <p className="font-bold text-[var(--color-sage)] mb-3 text-[0.9rem]">◯ {t.kuKnown}</p>
                            <ul className="space-y-2 text-[0.88rem] leading-relaxed">
                                {(lang === 'ja' ? KNOWN_UNKNOWN.known.ja : KNOWN_UNKNOWN.known.en).map((x) => <li key={x}>・{x}</li>)}
                            </ul>
                        </div>
                        <div className="bg-white rounded-2xl p-5 border border-black/5 shadow-sm">
                            <p className="font-bold text-[#C1614A] mb-3 text-[0.9rem]">✕ {t.kuUnknown}</p>
                            <ul className="space-y-2 text-[0.88rem] leading-relaxed">
                                {(lang === 'ja' ? KNOWN_UNKNOWN.unknown.ja : KNOWN_UNKNOWN.unknown.en).map((x) => <li key={x}>・{x}</li>)}
                            </ul>
                        </div>
                    </div>
                    <p className="text-[0.85rem] text-[var(--color-text-muted)] leading-relaxed mt-4">{t.kuNote}</p>
                </section>

                <footer className="border-t border-black/10 pt-6 text-[0.8rem] text-[var(--color-text-muted)]">
                    <p className="mb-3">{t.disclaimer}</p>
                    <div className="flex gap-4">
                        <Link href={t.policyHref} className="text-[var(--color-sage)] font-bold hover:underline">{t.policy}</Link>
                        <Link href={t.blogHref} className="text-[var(--color-sage)] font-bold hover:underline">{t.blog}</Link>
                    </div>
                </footer>
            </div>
        </div>
    );
}
