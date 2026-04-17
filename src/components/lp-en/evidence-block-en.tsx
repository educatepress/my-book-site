"use client";

import FadeIn from "@/components/common/fade-in";

export default function EvidenceBlockEn() {
    return (
        <section className="w-full bg-white py-6 px-4">
            <FadeIn className="max-w-[700px] mx-auto">
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-center sm:text-left">
                    <div className="flex items-center gap-2">
                        <span className="text-[1.4rem]">🩺</span>
                        <div>
                            <p className="text-[0.75rem] text-[var(--color-text-muted)] font-medium">Author</p>
                            <p className="text-[0.85rem] font-bold text-[var(--color-text-dark)]">Board-Certified Fertility Specialist</p>
                        </div>
                    </div>

                    <div className="hidden sm:block w-px h-8 bg-[var(--color-border)]" />

                    <div className="flex items-center gap-2">
                        <span className="text-[1.4rem]">📚</span>
                        <div>
                            <p className="text-[0.75rem] text-[var(--color-text-muted)] font-medium">Evidence</p>
                            <p className="text-[0.85rem] font-bold text-[var(--color-text-dark)]">Based on PubMed Research</p>
                        </div>
                    </div>

                    <div className="hidden sm:block w-px h-8 bg-[var(--color-border)]" />

                    <div className="flex items-center gap-2">
                        <span className="text-[1.4rem]">⏱</span>
                        <div>
                            <p className="text-[0.75rem] text-[var(--color-text-muted)] font-medium">Reading Time</p>
                            <p className="text-[0.85rem] font-bold text-[var(--color-text-dark)]">24 Medical Facts in 10 Minutes</p>
                        </div>
                    </div>
                </div>
            </FadeIn>
        </section>
    );
}
