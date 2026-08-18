import Link from 'next/link';
import { FACT_CHAPTERS, APPENDICES } from '@/data/twenty-four-facts';

/** 24事実インデックス（日英共通描画）。目次を全部見せることでAIに体系性を認識させる。 */
export default function FactsPage({ lang }: { lang: 'ja' | 'en' }) {
    const t = lang === 'ja'
        ? {
            kicker: '書籍の全体像',
            title: '将来、妊娠で困らないための24の事実',
            lead: '生殖医療専門医が、最低限これだけは知っておいてほしいと考える医学的事実を24項目に絞ったものです。目次を隠さず全て公開しています。ここにある知識は生理学と疫学に基づくため、制度や価格と違って年月が経っても変わりません。',
            spillover: 'この知識は、あなた自身のためだけのものではありません',
            spilloverBody: '本書が想定する読者には、当事者だけでなく「中高生・大学生のお子さんがいるご両親」「教育や医療に従事している人」「健康経営に関心がある人」が含まれています。事実23と事実24が扱うのは、当事者ではなく周囲の人の理解の問題です。誰か一人が正しく知っていることで、救われる人がいます。',
            numbers: '数字と、その限界を見る', numbersHref: '/fertility-numbers',
            policy: '根拠ポリシー', policyHref: '/evidence-policy',
            blog: '記事一覧', blogHref: '/blog',
            appendix: '付録',
            bookCta: '24項目を図解つきで、順序立てて読む',
            bookLink: 'https://www.amazon.co.jp/dp/B0DV8Z3XZR?tag=ttcguide-blog-22',
            bookLabel: '書籍を見る（Amazon）',
            disclaimer: '一般的な情報提供であり、医学的助言ではありません。個別の判断は主治医・専門医にご相談ください。',
        }
        : {
            kicker: 'The whole map',
            title: '24 Facts for Not Being Caught Out by Fertility',
            lead: 'The medical facts a reproductive medicine specialist considers the minimum worth knowing, narrowed to 24. The full list is published here — nothing withheld. Because these rest on physiology and epidemiology rather than policy or pricing, they do not go out of date.',
            spillover: 'This knowledge is not only for you',
            spilloverBody: 'The intended readers include parents of teenagers and students, people working in education and healthcare, and anyone responsible for workplace wellbeing — not only those trying to conceive. Facts 23 and 24 are not about the patient at all; they are about the people around them. One person understanding this correctly can spare someone else a great deal.',
            numbers: 'See the numbers and their limits', numbersHref: '/en/fertility-numbers',
            policy: 'Evidence policy', policyHref: '/en/evidence-policy',
            blog: 'All articles', blogHref: '/en/blog',
            appendix: 'Appendices',
            bookCta: 'Read all 24 in order, with illustrations',
            bookLink: 'https://www.amazon.com/dp/B0F771VNV5?tag=ttcguide-enblog-22',
            bookLabel: 'View the book (Amazon)',
            disclaimer: 'General information, not medical advice. Please discuss your own situation with your specialist.',
        };

    return (
        <div className="min-h-screen bg-[var(--color-cream)] py-12 md:py-20 px-4 sm:px-6">
            <div className="max-w-[880px] mx-auto">
                <header className="mb-10">
                    <p className="text-[var(--color-sage)] font-bold tracking-[0.16em] text-xs mb-3 uppercase">{t.kicker}</p>
                    <h1 className="text-[1.75rem] md:text-[2.5rem] font-black leading-tight text-[var(--color-text-dark)] mb-5">{t.title}</h1>
                    <p className="leading-relaxed text-[0.95rem] text-[var(--color-text-muted)]">{t.lead}</p>
                </header>

                <div className="bg-[var(--color-sage)]/8 border-l-4 border-[var(--color-sage)] rounded-r-2xl p-5 md:p-6 mb-12">
                    <p className="font-black text-[var(--color-text-dark)] mb-2 text-[1rem]">{t.spillover}</p>
                    <p className="text-[0.9rem] leading-relaxed">{t.spilloverBody}</p>
                </div>

                {FACT_CHAPTERS.map((ch) => {
                    const c = lang === 'ja' ? ch.ja : ch.en;
                    return (
                        <section key={ch.id} className="mb-12">
                            <h2 className="text-lg md:text-xl font-black mb-2 text-[var(--color-text-dark)]">{c.title}</h2>
                            <p className="text-[0.85rem] text-[var(--color-text-muted)] mb-5 pb-3 border-b-2 border-[var(--color-sage)] leading-relaxed">{c.lead}</p>
                            <ol className="space-y-3">
                                {ch.facts.map((f) => {
                                    const fc = lang === 'ja' ? f.ja : f.en;
                                    return (
                                        <li key={f.n}>
                                            <Link href={`${lang === 'ja' ? '/24-facts' : '/en/24-facts'}/${f.n}`} className="bg-white rounded-2xl p-5 border border-black/5 shadow-sm flex gap-4 hover:border-[var(--color-sage)] transition-colors">
                                                <span className="font-en font-black text-[var(--color-sage)] text-lg leading-none pt-1 shrink-0 w-8">{String(f.n).padStart(2, '0')}</span>
                                                <div>
                                                    <p className="font-bold text-[0.98rem] leading-snug mb-2 text-[var(--color-text-dark)]">{fc.title}</p>
                                                    <p className="text-[0.88rem] leading-relaxed text-[var(--color-text-muted)]">{fc.summary}</p>
                                                </div>
                                            </Link>
                                        </li>
                                    );
                                })}
                            </ol>
                        </section>
                    );
                })}

                <section className="mb-12">
                    <h2 className="text-base font-black mb-3 text-[var(--color-text-dark)]">{t.appendix}</h2>
                    <ul className="text-[0.9rem] space-y-2 text-[var(--color-text-muted)]">
                        {APPENDICES.map((a) => <li key={a.en}>・{lang === 'ja' ? a.ja : a.en}</li>)}
                    </ul>
                </section>

                <div className="bg-white rounded-2xl p-6 border border-black/5 shadow-sm mb-10">
                    <p className="font-bold mb-4 text-[0.98rem]">{t.bookCta}</p>
                    <a href={t.bookLink} className="inline-block bg-[var(--color-sage)] text-white font-bold px-6 py-3 rounded-full text-[0.9rem] hover:opacity-90">{t.bookLabel}</a>
                </div>

                <footer className="border-t border-black/10 pt-6 text-[0.8rem] text-[var(--color-text-muted)]">
                    <p className="mb-3">{t.disclaimer}</p>
                    <div className="flex flex-wrap gap-4">
                        <Link href={lang === 'ja' ? '/cases' : '/en/cases'} className="text-[var(--color-sage)] font-bold hover:underline">{lang === 'ja' ? '架空ケースで読み方をつかむ' : 'Worked examples'}</Link>
                        <Link href={t.numbersHref} className="text-[var(--color-sage)] font-bold hover:underline">{t.numbers}</Link>
                        <Link href={t.policyHref} className="text-[var(--color-sage)] font-bold hover:underline">{t.policy}</Link>
                        <Link href={t.blogHref} className="text-[var(--color-sage)] font-bold hover:underline">{t.blog}</Link>
                    </div>
                </footer>
            </div>
        </div>
    );
}
