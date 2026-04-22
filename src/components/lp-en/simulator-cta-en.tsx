"use client";

import FadeIn from "@/components/common/fade-in";
import { trackCtaClick } from "@/lib/track-cta";

export default function SimulatorCtaEn() {
    return (
        <section className="py-20 px-6 bg-gradient-to-b from-white to-[var(--color-gold-pale)]">
            <div className="max-w-[800px] mx-auto text-center">
                <FadeIn>
                    <div className="bg-white rounded-2xl p-8 md:p-12 shadow-lg border border-slate-100 relative overflow-hidden">
                        {/* Decorative gradient circle */}
                        <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 opacity-50" />

                        <div className="relative z-10">
                            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-xs font-bold px-4 py-1.5 rounded-full mb-6 tracking-wider uppercase">
                                🔬 Interactive Tool
                            </div>

                            <h3 className="font-['Zen_Kaku_Gothic_New'] text-[1.6rem] md:text-[2rem] font-bold text-[var(--color-text-dark)] mb-4 tracking-tight leading-tight">
                                ART Success Simulator
                            </h3>

                            <p className="text-[0.95rem] text-[var(--color-text-muted)] leading-relaxed mb-8 max-w-[560px] mx-auto font-en">
                                Estimate your cumulative live birth rate based on age, AMH, and clinical parameters.
                                Built on peer-reviewed evidence, this Monte Carlo simulation helps you visualize
                                treatment timelines and make informed decisions.
                            </p>

                            <a
                                href="/en/simulator"
                                onClick={() => trackCtaClick("lp-en", "cta", "simulator")}
                                className="inline-flex items-center justify-center bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold text-base rounded-full px-10 py-4 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                            >
                                Try the Simulator →
                            </a>

                            <p className="text-[0.7rem] text-[var(--color-text-muted)] mt-4 font-en">
                                Free · No registration required · Results are for educational purposes only
                            </p>
                        </div>
                    </div>
                </FadeIn>
            </div>
        </section>
    );
}
