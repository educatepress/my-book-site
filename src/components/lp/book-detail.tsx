"use client";

import FadeIn from "@/components/common/fade-in";
import Accordion from "@/components/common/accordion";
import { motion } from "framer-motion";

export default function BookDetail() {
    const chapters = [
        {
            title: "第1章 ▸ 将来を選ぶための基本知識",
            content: (
                <ul className="list-disc pl-5 space-y-1">
                    <li>なぜ「20代で考える」のか</li>
                    <li>卵子の数と年齢の関係</li>
                    <li>AMHの基礎知識</li>
                    <li>妊娠率と年齢のリアル</li>
                    <li>男性側の年齢要因</li>
                </ul>
            ),
        },
        {
            title: "第2章 ▸ 自分の体を守るための知識",
            content: (
                <ul className="list-disc pl-5 space-y-1">
                    <li>月経不順と将来への影響</li>
                    <li>基礎体温・排卵のチェック方法</li>
                    <li>婦人科検診の重要性</li>
                </ul>
            ),
        },
        {
            title: "第3章 ▸ 妊娠するための知識",
            content: (
                <ul className="list-disc pl-5 space-y-1">
                    <li>妊娠成立のメカニズム</li>
                    <li>タイミングの合わせ方</li>
                    <li>パートナーとのコミュニケーション</li>
                </ul>
            ),
        },
        {
            title: "第4章 ▸ 不妊治療の基礎と選択肢",
            content: (
                <ul className="list-disc pl-5 space-y-1">
                    <li>一般不妊治療（タイミング法・人工授精）</li>
                    <li>生殖補助医療（体外受精・顕微授精）</li>
                    <li>治療にかかる期間と費用感</li>
                </ul>
            ),
        },
        {
            title: "付録 ▸ 早発卵巣不全・PCOS・ブライダルチェック",
            content: (
                <ul className="list-disc pl-5 space-y-1">
                    <li>早発卵巣不全（POI）について</li>
                    <li>多嚢胞性卵巣症候群（PCOS）について</li>
                    <li>ブライダルチェックでわかること</li>
                </ul>
            ),
        },
    ];

    return (
        <section className="bg-[var(--color-surface)] py-[6rem] md:py-[8rem] px-6">
            <div className="max-w-[1120px] mx-auto">
                <FadeIn className="text-center mb-[var(--spacing-xl)]">
                    <h2 className="text-[clamp(1.5rem,3.5vw,2rem)] font-bold text-[var(--color-text-dark)] leading-snug">
                        この本の中身
                    </h2>
                </FadeIn>

                <div className="flex flex-col gap-[var(--spacing-xl)] max-w-[860px] mx-auto mt-4">

                    {/* Section: Chapter Accordion */}
                    <div className="w-full">
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
                                    <img src="/mockup-jp.png" alt="Book Cover" className="w-full h-auto" />
                                </div>

                                <h3 className="text-[1.1rem] font-bold text-[var(--color-text-dark)] mb-4 flex items-center justify-center gap-1.5">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-[var(--color-sage)]"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                                    図解でわかる！中身を少しだけ公開
                                </h3>

                                {/* LP内スワイプ完結の立ち読みエリア */}
                                <div className="w-full bg-[var(--color-surface)] rounded-[16px] p-4 mb-5 border border-black/5 relative flex flex-col items-center">
                                    <h4 className="text-[0.8rem] font-bold text-[var(--color-text-mid)] mb-3 flex items-center gap-1.5"><span className="text-[1rem]">📖</span> この本の中身を少しだけ公開</h4>
                                    <div className="flex w-full overflow-x-auto snap-x snap-mandatory gap-4 pb-4 px-2 justify-start items-center" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                                        <style jsx>{`div::-webkit-scrollbar { display: none; }`}</style>
                                        
                                        {[1, 2, 3].map((num) => (
                                            <div key={num} className="snap-center shrink-0 w-[110px] md:w-[130px] aspect-[1/1.414] rounded-[8px] border border-black/10 overflow-hidden bg-white shadow-md relative group">
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img src={`/preview-jp-${num}.jpg`} alt={`プレビュー ${num}`} className="w-full h-full object-contain bg-white" />
                                                
                                                <div className="absolute inset-0 bg-black/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <span className="bg-white/95 text-[var(--color-text-dark)] text-[0.65rem] px-2.5 py-1.5 rounded-full font-bold shadow-md backdrop-blur-sm">拡大</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <p className="text-[0.7rem] text-[var(--color-text-muted)] mt-2 font-bold">← 横にスワイプして立ち読み</p>
                                </div>

                                <a
                                    href="https://amzn.to/3NcOWBl"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="cta-button btn-amazon w-full text-[0.95rem] font-bold text-white rounded-full px-6 py-4 shadow-lg hover:scale-105 transition-transform flex items-center justify-center"
                                >
                                    続きをAmazonで読む（¥1,250） →
                                </a>
                            </div>

                            {/* 🚨 書誌情報は目立たなくする（opacity-50） */}
                            <div className="text-[0.7rem] text-[var(--color-text-muted)] bg-transparent border border-black/5 rounded-[16px] p-5 opacity-60 hover:opacity-100 transition-opacity">
                                <dl className="grid grid-cols-[80px_1fr] gap-y-1">
                                    <dt className="font-bold">タイトル</dt><dd>『20代で考える 将来妊娠で困らないための選択』</dd>
                                    <dt className="font-bold">著者</dt><dd>佐藤 琢磨（生殖医療専門医）</dd>
                                    <dt className="font-bold">形式</dt><dd>ペーパーバック・Kindle版</dd>
                                </dl>
                            </div>
                        </FadeIn>
                    </div>

                </div>
            </div>
        </section>
    );
}
