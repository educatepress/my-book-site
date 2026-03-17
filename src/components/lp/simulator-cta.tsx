"use client";

import FadeIn from "@/components/common/fade-in";

export default function SimulatorCta() {
    return (
        <section className="py-20 px-6 bg-gradient-to-b from-white to-[var(--color-gold-pale)]">
            <div className="max-w-[800px] mx-auto text-center">
                <FadeIn>
                    <div className="bg-white rounded-2xl p-8 md:p-12 shadow-lg border border-slate-100 relative overflow-hidden">
                        {/* Decorative gradient circle */}
                        <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 opacity-50" />

                        <div className="relative z-10">
                            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-xs font-bold px-4 py-1.5 rounded-full mb-6 tracking-wider uppercase">
                                🔬 インタラクティブツール
                            </div>

                            <h3 className="text-[1.6rem] md:text-[2rem] font-bold text-[var(--color-text-dark)] mb-4 tracking-tight leading-tight">
                                IVF 成功率シミュレーター
                            </h3>

                            <p className="text-[0.95rem] text-[var(--color-text-muted)] leading-relaxed mb-8 max-w-[560px] mx-auto">
                                年齢・AMH・BMI等のパラメータから、体外受精の累積出生率を推定します。
                                CDC/SARTの全米データに基づいたシミュレーションで、治療計画のイメージを掴みましょう。
                            </p>

                            <a
                                href="/simulator"
                                className="inline-flex items-center justify-center bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold text-base rounded-full px-10 py-4 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                            >
                                シミュレーターを試す →
                            </a>

                            <p className="text-[0.7rem] text-[var(--color-text-muted)] mt-4">
                                無料 · 登録不要 · 結果は教育目的のみ
                            </p>
                        </div>
                    </div>
                </FadeIn>
            </div>
        </section>
    );
}
