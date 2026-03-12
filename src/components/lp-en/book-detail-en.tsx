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

                <div className="flex flex-col md:flex-row gap-[var(--spacing-xl)] md:gap-[var(--spacing-3xl)]">

                    {/* Left Column: Chapter Accordion */}
                    <div className="w-full lg:w-[58%] flex flex-col gap-1 shrink-0">
                        {chapters.map((chapter, idx) => (
                            <FadeIn key={idx} delay={idx * 0.1}>
                                <Accordion title={chapter.title} isOpenDefault={idx === 0}>
                                    {chapter.content}
                                </Accordion>
                            </FadeIn>
                        ))}
                    </div>

                    {/* Right Column: Sneak Peek Preview */}
                    <div className="w-full lg:w-[42%] flex flex-col items-center md:items-start justify-center">
                        <FadeIn delay={0.3} className="w-full">
                            <div className="bg-white rounded-[24px] px-8 py-10 shadow-md flex flex-col items-center justify-center text-center min-h-[320px] border border-[var(--color-surface-mid)] mb-6">
                                <div className="w-[140px] md:w-[180px] drop-shadow-lg mb-6">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src="/mock-en.png" alt="Book Cover" className="w-full h-auto" />
                                </div>
                                <h3 className="text-[1.1rem] font-bold text-[var(--color-text-dark)] mb-2">
                                    Take a sneak peek inside
                                </h3>
                                <p className="text-[0.9rem] text-[var(--color-text-mid)] mb-6">
                                    Preview actual pages using<br />Amazon's "Look inside" feature.
                                </p>
                                <a
                                    href="https://www.amazon.co.jp/Doctor%E2%80%99s-Guide-Womens-Health-Preconception/dp/B0F7XTWJ3X/ref=tmm_pap_swatch_0"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[0.9rem] font-bold text-[var(--color-sage)] border border-[var(--color-sage)] rounded-full px-6 py-2 hover:bg-[var(--color-sage-pale)] transition-colors inline-block"
                                >
                                    Read Sample on Amazon →
                                </a>
                            </div>

                            {/* Bibliographic Information Table */}
                            <div className="text-[0.8rem] text-[var(--color-text-muted)] bg-[var(--color-surface-mid)] rounded-[16px] p-5">
                                <dl className="grid grid-cols-[90px_1fr] gap-y-2">
                                    <dt className="font-bold">Title</dt>
                                    <dd>Thinking in your 20s: Choices for a Future Pregnancy Without Trouble (Japanese Edition)</dd>
                                    <dt className="font-bold">Author</dt>
                                    <dd>Takuma Sato, MD, PhD</dd>
                                    <dt className="font-bold">Published</dt>
                                    <dd>April 2025</dd>
                                    <dt className="font-bold">Publisher</dt>
                                    <dd>Kindle Direct Publishing</dd>
                                    <dt className="font-bold">Format</dt>
                                    <dd>Paperback & Kindle Edition</dd>
                                </dl>
                            </div>
                        </FadeIn>
                    </div>

                </div>
            </div>
        </section>
    );
}
