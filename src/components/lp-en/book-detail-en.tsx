"use client";

import FadeIn from "@/components/common/fade-in";
import Accordion from "@/components/common/accordion";
import { motion } from "framer-motion";

export default function BookDetailEn() {
    const chapters = [
        {
            title: "Chapter 1 ▸ Basics for Choosing Your Future",
            content: (
                <ul className="list-disc pl-5 space-y-1">
                    <li>Why think about this in your 20s and 30s?</li>
                    <li>The relationship between egg count and age</li>
                    <li>Basics of AMH (Anti-Müllerian Hormone)</li>
                    <li>The reality of pregnancy rates and age</li>
                    <li>Age factors for male partners</li>
                </ul>
            ),
        },
        {
            title: "Chapter 2 ▸ Protecting Your Body",
            content: (
                <ul className="list-disc pl-5 space-y-1">
                    <li>Irregular periods and future impact</li>
                    <li>How to track basal body temperature and ovulation</li>
                    <li>The importance of gynecological exams</li>
                </ul>
            ),
        },
        {
            title: "Chapter 3 ▸ Knowledge for Getting Pregnant",
            content: (
                <ul className="list-disc pl-5 space-y-1">
                    <li>The mechanism of achieving pregnancy</li>
                    <li>How to time intercourse correctly</li>
                    <li>Communication with your partner</li>
                </ul>
            ),
        },
        {
            title: "Chapter 4 ▸ Fertility Treatment Basics & Options",
            content: (
                <ul className="list-disc pl-5 space-y-1">
                    <li>General fertility treatments (Timed intercourse, IUI)</li>
                    <li>Assisted Reproductive Technology (IVF, ICSI)</li>
                    <li>Timeline and cost expectations for treatments</li>
                </ul>
            ),
        },
        {
            title: "Appendix ▸ POI, PCOS & Bridal Checks",
            content: (
                <ul className="list-disc pl-5 space-y-1">
                    <li>Understanding Primary Ovarian Insufficiency (POI)</li>
                    <li>Understanding Polycystic Ovary Syndrome (PCOS)</li>
                    <li>What you can learn from a pre-marital fertility check</li>
                </ul>
            ),
        },
    ];

    return (
        <section className="bg-[var(--color-surface)] py-[6rem] md:py-[8rem] px-6 font-en">
            <div className="max-w-[1120px] mx-auto">
                <FadeIn className="text-center mb-[var(--spacing-xl)]">
                    <h2 className="text-[clamp(1.5rem,3.5vw,2rem)] font-bold text-[var(--color-text-dark)] leading-snug">
                        Inside the Book
                    </h2>
                </FadeIn>

                <div className="flex flex-col gap-[var(--spacing-xl)] max-w-[860px] mx-auto mt-4">

                    {/* Section: Chapter Accordion */}
                    <div className="w-full flex flex-col gap-1 shrink-0">
                        {chapters.map((chapter, idx) => (
                            <FadeIn key={idx} delay={idx * 0.1}>
                                <Accordion title={chapter.title} isOpenDefault={idx === 0}>
                                    {chapter.content}
                                </Accordion>
                            </FadeIn>
                        ))}
                    </div>

                    {/* Section: Sneak Peek Preview */}
                    <div className="w-full flex flex-col items-center justify-start pt-6 md:pt-10">
                        <FadeIn delay={0.3} className="w-full">
                            <div className="bg-white rounded-[24px] p-6 shadow-xl flex flex-col items-center text-center border border-[var(--color-surface-mid)] mb-6 overflow-hidden relative">
                                {/* 🚨 モックアップを大きく配置 */}
                                <div className="w-[180px] md:w-[220px] drop-shadow-[0_20px_30px_rgba(0,0,0,0.15)] mb-6 mt-4 relative z-10">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src="/mock-en.png" alt="Book Cover" className="w-full h-auto" />
                                </div>

                                <h3 className="text-[1.1rem] font-bold text-[var(--color-text-dark)] mb-4 flex items-center justify-center gap-1.5">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-[var(--color-sage)]"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                                    Take a Sneak Peek
                                </h3>

                                {/* LP内スワイプ完結の立ち読みエリア（英語版） */}
                                <div className="w-full bg-[var(--color-surface)] rounded-[16px] p-4 mb-5 border border-black/5 relative flex flex-col items-center">
                                    <h4 className="text-[0.8rem] font-bold text-[var(--color-text-mid)] mb-3 flex items-center gap-1.5"><span className="text-[1rem]">📖</span> Take a Sneak Peek Inside</h4>
                                    <div className="relative w-full max-w-[380px] md:max-w-[720px]">
                                        <div className="flex w-full overflow-x-auto snap-x snap-mandatory gap-3 pb-4 px-1 items-center" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                                            <style jsx>{`div::-webkit-scrollbar { display: none; }`}</style>
                                            
                                            {[1, 2, 3, 4, 5].map((num) => (
                                                <div key={num} className="snap-center shrink-0 w-[180px] md:w-[240px] aspect-[1/1.414] rounded-[8px] border border-black/10 overflow-hidden bg-white shadow-md relative group">
                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                    <img src={`/preview-en-${num}.jpg`} alt={`Preview ${num}`} className="w-full h-full object-contain bg-white" />
                                                    
                                                    <div className="absolute inset-0 bg-black/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <span className="bg-white/95 text-[var(--color-text-dark)] text-[0.65rem] px-2.5 py-1.5 rounded-full font-bold shadow-md backdrop-blur-sm uppercase">Expand</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        {/* Right fade to hint more content */}
                                        <div className="absolute top-0 right-0 w-12 h-full bg-gradient-to-l from-[var(--color-surface)] to-transparent pointer-events-none rounded-r-[16px]" />
                                    </div>
                                    <p className="text-[0.7rem] text-[var(--color-text-muted)] mt-1 font-bold uppercase tracking-wider"><span className="md:hidden">← Swipe to read →</span><span className="hidden md:inline">← Scroll to read →</span></p>
                                </div>

                                <a
                                    href="https://www.amazon.co.jp/Doctor%E2%80%99s-Guide-Womens-Health-Preconception/dp/B0F7XTWJ3X/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="cta-button btn-amazon w-full text-[0.95rem] font-bold text-white rounded-full px-6 py-4 shadow-lg hover:scale-105 transition-transform flex items-center justify-center"
                                >
                                    Continue reading on Amazon →
                                </a>
                            </div>

                            {/* 🚨 書誌情報は目立たなくする */}
                            <div className="text-[0.7rem] text-[var(--color-text-muted)] bg-transparent border border-black/5 rounded-[16px] p-5 opacity-60 hover:opacity-100 transition-opacity w-full">
                                <dl className="grid grid-cols-[90px_1fr] gap-y-1">
                                    <dt className="font-bold">Title</dt><dd>Thinking in your 20s: Choices for a Future Pregnancy...</dd>
                                    <dt className="font-bold">Author</dt><dd>Takuma Sato, MD, PhD</dd>
                                    <dt className="font-bold">Format</dt><dd>Paperback & Kindle Edition</dd>
                                </dl>
                            </div>
                        </FadeIn>
                    </div>

                </div>
            </div>
        </section>
    );
}
