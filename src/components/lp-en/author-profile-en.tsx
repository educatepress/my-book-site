"use client";

import FadeIn from "@/components/common/fade-in";

export default function AuthorProfileEn() {
    return (
        <section className="bg-[var(--color-surface-mid)] py-[5rem] px-6 font-en">
            <div className="max-w-[800px] mx-auto">
                <FadeIn>
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-20">

                        {/* Left: Author Photo */}
                        <div className="shrink-0 flex flex-col items-center md:w-[180px]">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src="/author-blue.JPG"
                                alt="Takuma Sato"
                                className="w-[160px] h-[160px] md:w-[180px] md:h-[180px] rounded-full border-4 border-white object-cover object-[center_top] drop-shadow-md mb-5"
                                style={{ boxShadow: "0 12px 40px rgba(107,143,113,0.15)" }}
                            />
                            <div className="flex gap-4 text-[0.9rem]">
                                <a href="https://note.com/takuma_sato" target="_blank" rel="noreferrer" className="text-[var(--color-text-mid)] hover:text-[var(--color-sage)] transition-colors">
                                    📝 note
                                </a>
                                <a href="https://instagram.com/takuma.dr" target="_blank" rel="noreferrer" className="text-[var(--color-text-mid)] hover:text-[var(--color-sage)] transition-colors">
                                    📸 Instagram
                                </a>
                            </div>
                        </div>

                        {/* Right: Author Bio */}
                        <div className="flex-1 text-center md:text-left flex flex-col items-center md:items-start">
                            <h3 className="font-['Zen_Kaku_Gothic_New'] text-[1.5rem] font-black text-[var(--color-text-dark)] mb-1">
                                Takuma Sato
                            </h3>
                            <p className="text-[0.8rem] text-[var(--color-text-muted)] font-en mb-6 uppercase tracking-[0.2em] font-bold">
                                MD, PhD
                            </p>

                            {/* Badges */}
                            <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-6">
                                {["Reproductive Medicine Specialist", "Obstetrician & Gynecologist", "MD, PhD"].map((badge, idx) => (
                                    <span
                                        key={idx}
                                        className="bg-[var(--color-sage-pale)] text-[var(--color-sage)] text-[0.7rem] font-bold px-3 py-1 rounded-full whitespace-nowrap"
                                    >
                                        {badge}
                                    </span>
                                ))}
                            </div>

                            {/* Bio Text */}
                            <p className="text-[0.95rem] text-[var(--color-text-dark)] leading-relaxed">
                                Board-certified Reproductive Medicine Specialist by the Japan Society for Reproductive Medicine. Graduate of Jikei University School of Medicine.<br />
                                Dedicated to clinical practice and research in fertility treatments. Starting April 2025, attending physician at Omotesando ART Clinic.<br />
                                Actively sharing accurate, accessible medical knowledge via "note" and "Instagram".
                            </p>
                        </div>

                    </div>
                </FadeIn>
            </div>
        </section>
    );
}
