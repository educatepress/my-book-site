"use client";

import FadeIn from "@/components/common/fade-in";

export default function AuthorProfile() {
    return (
        <section className="bg-[var(--color-surface-mid)] py-[5rem] px-6">
            <div className="max-w-[800px] mx-auto">
                <FadeIn>
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-20">

                        {/* Left: Author Photo */}
                        <div className="shrink-0 flex flex-col items-center md:w-[160px]">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src="/author-blue.JPG"
                                alt="佐藤 琢磨"
                                className="w-[160px] h-[160px] rounded-full border-4 border-white object-cover object-[center_top] drop-shadow-md mb-5"
                                style={{ boxShadow: "0 12px 40px rgba(107,143,113,0.15)" }}
                            />
                            <div className="flex gap-4">
                                <a href="https://note.com/takuma_sato" target="_blank" rel="noreferrer" className="text-[0.8rem] font-bold text-[var(--color-text-mid)] bg-white px-3 py-1.5 rounded-full shadow-sm hover:scale-105 transition-transform border border-black/5">
                                    note
                                </a>
                                <a href="https://instagram.com/takuma.dr" target="_blank" rel="noreferrer" className="text-[0.8rem] font-bold text-[var(--color-text-mid)] bg-white px-3 py-1.5 rounded-full shadow-sm hover:scale-105 transition-transform border border-black/5">
                                    Instagram
                                </a>
                            </div>
                        </div>

                        {/* Right: Author Bio */}
                        <div className="flex-1 text-center md:text-left flex flex-col items-center md:items-start w-full">
                            <h3 className="font-['Zen_Kaku_Gothic_New'] text-[1.4rem] font-black text-[var(--color-text-dark)] mb-1" style={{ fontFeatureSettings: '"palt"' }}>
                                佐藤 琢磨
                            </h3>
                            <p className="text-[0.8rem] text-[var(--color-text-muted)] font-en mb-3 tracking-widest uppercase">
                                Takuma Sato, MD, PhD
                            </p>

                            {/* Badges */}
                            <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-6">
                                <span className="bg-[var(--color-sage)] text-white text-[0.7rem] font-bold px-3 py-1.5 rounded-sm tracking-wider">生殖医療専門医</span>
                                <span className="bg-[var(--color-surface-mid)] text-[var(--color-text-mid)] text-[0.7rem] font-bold px-3 py-1.5 rounded-sm tracking-wider">産婦人科専門医</span>
                                <span className="bg-[var(--color-surface-mid)] text-[var(--color-text-mid)] text-[0.7rem] font-bold px-3 py-1.5 rounded-sm tracking-wider">医学博士</span>
                            </div>

                            {/* 🚨 追加：著者の「想い」をストーリーとして配置 */}
                            <div className="relative bg-white p-5 md:p-6 rounded-2xl border-l-4 border-[var(--color-sage)] shadow-sm w-full mb-6 text-left">
                                <div className="absolute -top-3 left-4 text-[3.5rem] text-[var(--color-sage)] opacity-20 font-serif leading-none">“</div>
                                <p className="text-[0.9rem] md:text-[0.95rem] text-[var(--color-text-dark)] leading-[1.8] relative z-10 font-medium pt-2">
                                    日々診察室で、<strong className="text-[var(--color-blush)]">「もっと早く知っていれば…」</strong>と涙を流す女性を数え切れないほど見てきました。<br className="hidden md:block" />
                                    手遅れになって後悔する前に、正しい知識で自分の未来と選択肢を守ってほしい。その一心で、専門医として本当に必要な24の事実をこの一冊に込めました。
                                </p>
                            </div>

                            {/* Bio Text */}
                            <p className="text-[0.95rem] text-[var(--color-text-dark)] leading-[1.8]">
                                日本生殖医学会認定・生殖医療専門医。東京慈恵会医科大学卒。<br className="hidden md:block" />
                                不妊治療の臨床と研究に従事し、2025年4月より表参道ARTクリニック勤務。<br className="hidden md:block" />
                                「note」「Instagram」で正確な医療知識をやさしく発信している。
                            </p>
                        </div>

                    </div>
                </FadeIn>
            </div>
        </section>
    );
}
