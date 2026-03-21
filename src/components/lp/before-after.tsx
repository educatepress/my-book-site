"use client";

import FadeIn from "@/components/common/fade-in";
import { motion } from "framer-motion";

export default function BeforeAfter() {
    const cards = [
        {
            before: "妊娠は「いつか、なんとかなる」と思っていた",
            after: "妊娠の適した時期には個人差があることを知り、ベストタイミングを考えられるようになった。",
        },
        {
            before: "将来のことをなんとなく不安に感じていた",
            after: "自分の体の状態と事実を知ることで、ライフプランを具体的に描けるようになった。",
        },
        {
            before: "ネットの情報が多すぎて何から信じていいかわからなかった",
            after: "産婦人科医が厳選した24のポイントに沿って、効率よく学べるようになった。",
        },
        {
            before: "「とりあえず様子を見る」時間が長くなりがちだった",
            after: "いつ受診するか、パートナーと何を話すかなど、今できる行動に落とし込めるようになった。",
        },
    ];

    return (
        <section className="bg-[var(--color-cream)] pt-[6rem] md:pt-[8rem] pb-0">
            <div className="max-w-[800px] mx-auto px-6 mb-[var(--spacing-3xl)]">
                <div className="flex flex-col gap-6 w-full">
                    {cards.map((card, idx) => (
                        <FadeIn key={idx} delay={idx * 0.1}>
                            <div className="flex flex-col w-full rounded-[24px] overflow-hidden drop-shadow-sm border border-black/5 bg-white">
                                {/* Before Row */}
                                <div
                                    className="bg-[var(--color-surface)] p-5 flex flex-col sm:flex-row sm:items-center gap-2.5 sm:gap-5 w-full"
                                    aria-label={`改善前: ${card.before}`}
                                >
                                    <span className="shrink-0 text-[0.65rem] font-bold text-[var(--color-text-muted)] tracking-widest bg-black/5 px-2.5 py-1 rounded-full w-fit font-en">
                                        BEFORE
                                    </span>
                                    <p className="text-[0.85rem] text-[var(--color-text-mid)] opacity-85 decoration-black/20 line-through">
                                        {card.before}
                                    </p>
                                </div>

                                {/* After Row */}
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, margin: "-50px" }}
                                    transition={{ duration: 0.5, delay: idx * 0.1 + 0.15 }}
                                    className="bg-[var(--color-white)] p-6 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-5 w-full border-l-4 border-l-[var(--color-blush)]"
                                    aria-label={`改善後: ${card.after}`}
                                >
                                    <div className="shrink-0 w-6 h-6 rounded-full bg-[var(--color-blush-pale)] text-[var(--color-blush)] flex items-center justify-center text-sm shadow-sm border border-[var(--color-blush-light)] mt-1 sm:mt-0">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3.5 h-3.5">
                                            <polyline points="20 6 9 17 4 12" />
                                        </svg>
                                    </div>
                                    <p className="text-[1rem] font-bold text-[var(--color-text-dark)] leading-[1.5]" style={{ textWrap: 'balance' as any }}>
                                        {card.after}
                                    </p>
                                </motion.div>
                            </div>
                        </FadeIn>
                    ))}
                </div>
            </div>

            {/* Intermediate CTA */}
            <div className="w-full bg-[var(--color-blush-pale)] rounded-t-[32px] md:rounded-t-[48px] py-[4rem] px-6 text-center">
                <FadeIn className="max-w-[700px] mx-auto flex flex-col items-center">
                    <h2 className="text-[1.2rem] md:text-[1.4rem] font-bold text-[var(--color-text-dark)] leading-snug mb-[var(--spacing-lg)]">
                        あなたの「知らなかった」を、<br className="md:hidden" />今日ここで変えませんか？
                    </h2>

                    <a
                        href="https://amzn.to/3NcOWBl"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="cta-button btn-amazon inline-flex items-center justify-center rounded-full px-8 py-4 w-full sm:w-auto mb-4"
                    >
                        <span className="text-[15px] tracking-wide font-bold">
                            Amazonで購入する <span className="arrow ml-1">→</span>
                        </span>
                    </a>

                    <p className="text-[0.8rem] text-[var(--color-text-muted)]">
                        Kindle版 ¥1,250 ｜ ペーパーバック版 ¥1,500
                    </p>
                </FadeIn>
            </div>
        </section>
    );
}
