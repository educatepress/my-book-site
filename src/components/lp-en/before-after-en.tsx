"use client";

import FadeIn from "@/components/common/fade-in";
import { motion } from "framer-motion";

export default function BeforeAfterEn() {
    const cards = [
        {
            before: 'I thought "pregnancy will just happen someday."',
            after: "I learned there's a biological window for pregnancy, helping me plan the best timing for us.",
        },
        {
            before: "I felt vaguely anxious about my fertility future.",
            after: "By understanding my body's current state and the facts, I can now create a concrete life plan.",
        },
        {
            before: "I didn't know what to believe among all the online information.",
            after: "I'm efficiently learning the 24 essential points carefully curated by a fertility specialist.",
        },
        {
            before: "I tended to just \"wait and see\" without acting.",
            after: "I now know exactly when to see a doctor and what to discuss with my partner today.",
        },
    ];

    return (
        <section className="bg-[var(--color-cream)] pt-[6rem] md:pt-[8rem] pb-0 font-en">
            <div className="max-w-[800px] mx-auto px-6 mb-[var(--spacing-3xl)]">
                <div className="flex flex-col gap-6 w-full">
                    {cards.map((card, idx) => (
                        <FadeIn key={idx} delay={idx * 0.1}>
                            <div className="flex flex-col w-full rounded-[24px] overflow-hidden drop-shadow-sm border border-black/5 bg-white">
                                {/* Before Row */}
                                <div
                                    className="bg-[var(--color-surface)] p-6 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 w-full"
                                    aria-label={`Before: ${card.before}`}
                                >
                                    <span className="shrink-0 text-[0.7rem] font-bold text-[var(--color-text-muted)] tracking-widest bg-black/5 px-3 py-1 rounded-full w-fit uppercase">
                                        BEFORE
                                    </span>
                                    <p className="text-[0.95rem] text-[var(--color-text-muted)] line-through">
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
                                    aria-label={`After: ${card.after}`}
                                >
                                    <div className="shrink-0 w-6 h-6 rounded-full bg-[var(--color-blush-pale)] text-[var(--color-blush)] flex items-center justify-center text-sm shadow-sm border border-[var(--color-blush-light)] mt-1 sm:mt-0">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3.5 h-3.5">
                                            <polyline points="20 6 9 17 4 12" />
                                        </svg>
                                    </div>
                                    <p className="text-[1rem] font-bold text-[var(--color-text-dark)] leading-[1.6]">
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
                    <h2 className="font-['Zen_Kaku_Gothic_New'] text-[1.2rem] md:text-[1.4rem] font-bold text-[var(--color-text-dark)] leading-snug mb-[var(--spacing-lg)]">
                        Change your &ldquo;I didn&apos;t know&rdquo; <br className="md:hidden" />starting today.
                    </h2>

                    <a
                        href="https://www.amazon.co.jp/Doctor%E2%80%99s-Guide-Womens-Health-Preconception/dp/B0F7XTWJ3X/ref=tmm_pap_swatch_0"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="cta-button btn-amazon inline-flex items-center justify-center rounded-full px-8 py-4 w-full sm:w-auto mb-4"
                    >
                        <span className="text-[15px] tracking-wide">
                            📖 Buy on Amazon <span className="arrow ml-1">→</span>
                        </span>
                    </a>

                    {/* <p className="text-[0.8rem] text-[var(--color-text-muted)]">
            Kindle Edition $9.99 ｜ Paperback $19.99
          </p> */}
                </FadeIn>
            </div>
        </section>
    );
}
