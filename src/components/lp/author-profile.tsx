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
                                loading="lazy" width={160} height={160} className="w-[160px] h-[160px] rounded-full border-4 border-white object-cover object-[center_top] drop-shadow-md mb-5"
                                style={{ boxShadow: "0 12px 40px rgba(107,143,113,0.15)" }}
                            />
                            <div className="flex gap-4">
                                <a href="https://note.com/famous_cosmos408" target="_blank" rel="noreferrer" className="flex items-center justify-center w-10 h-10 bg-white rounded-full shadow-sm hover:scale-110 transition-transform border border-black/5" title="note">
                                    <img src="/icon-note.svg" alt="note" className="w-5 h-5 opacity-70 hover:opacity-100 transition-opacity" />
                                </a>
                                <a href="https://instagram.com/dr.sato.fertility" target="_blank" rel="noreferrer" className="flex items-center justify-center w-10 h-10 bg-white rounded-full shadow-sm hover:scale-110 transition-transform border border-black/5" title="Instagram">
                                    <img src="/icon-instagram.svg" alt="Instagram" className="w-5 h-5 opacity-70 hover:opacity-100 transition-opacity" />
                                </a>
                                <a href="https://x.com/entu1201" target="_blank" rel="noreferrer" className="flex items-center justify-center w-10 h-10 bg-white rounded-full shadow-sm hover:scale-110 transition-transform border border-black/5" title="X (Twitter)">
                                    <img src="/icon-x.svg" alt="X" className="w-5 h-5 opacity-70 hover:opacity-100 transition-opacity" />
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
                            <div className="relative bg-white p-5 md:p-6 rounded-2xl border-l-4 border-[var(--color-sage)] shadow-sm w-full md:max-w-[560px] mb-6 text-left">
                                <p className="text-[0.9rem] md:text-[0.95rem] text-[var(--color-text-dark)] leading-[1.8] relative z-10 font-medium" style={{ textWrap: 'pretty' as any }}>
                                    日々診察室で多くの女性と向き合う中で、<strong className="text-[var(--color-blush)]">「この知識にもっと早く出会ってもらえていたら」</strong>と思う経験を何度もしてきました。<br className="hidden md:block" />
                                    誰もが自分らしい人生を描けるように、医学的な視点から未来の選択肢を広げるヒントをお届けしたい。その願いを込めて、専門医として本当に必要な24の事実をこの一冊にまとめました。
                                </p>
                            </div>

                            {/* Bio Text */}
                            <p className="text-[0.95rem] text-[var(--color-text-dark)] leading-[1.8]">
                                日本生殖医学会認定・生殖医療専門医。東京慈恵会医科大学卒。<br className="hidden md:block" />
                                不妊治療の臨床と研究に従事し、2025年4月より表参道ARTクリニック勤務。<br className="hidden md:block" />
                                「note」「Instagram」「X」で正確な医療知識をやさしく発信している。
                            </p>
                        </div>

                    </div>
                </FadeIn>
            </div>
        </section>
    );
}
