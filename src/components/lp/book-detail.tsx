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

                <div className="flex flex-col md:flex-row gap-[var(--spacing-xl)] md:gap-[var(--spacing-3xl)]">

                    {/* Left Column: Chapter Accordion */}
                    <div className="flex-1 w-full">
                        {chapters.map((chapter, idx) => (
                            <FadeIn key={idx} delay={idx * 0.1}>
                                <Accordion title={chapter.title} isOpenDefault={idx === 0}>
                                    {chapter.content}
                                </Accordion>
                            </FadeIn>
                        ))}
                    </div>

                    {/* Right Column: Sneak Peek Preview */}
                    <div className="flex-1 w-full flex flex-col items-center md:items-start justify-center">
                        <FadeIn delay={0.3} className="w-full">
                            <div className="bg-white rounded-[24px] p-8 shadow-md flex flex-col items-center justify-center text-center h-[280px] border border-[var(--color-surface-mid)] mb-6">
                                <div className="w-[100px] md:w-[120px] drop-shadow-lg mb-4">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src="/mockup-jp.png" alt="Book Cover" className="w-full h-auto" />
                                </div>
                                <h3 className="text-[1.1rem] font-bold text-[var(--color-text-dark)] mb-2">
                                    中身を少しだけ見てみる
                                </h3>
                                <p className="text-[0.9rem] text-[var(--color-text-mid)] mb-6">
                                    Amazonの試し読み機能で<br />実際のページをご覧いただけます
                                </p>
                                <a
                                    href="https://amzn.to/3NcOWBl"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[0.9rem] font-bold text-[var(--color-sage)] border border-[var(--color-sage)] rounded-full px-6 py-2 hover:bg-[var(--color-sage-pale)] transition-colors inline-block"
                                >
                                    Amazonで立ち読みする →
                                </a>
                            </div>

                            {/* Bibliographic Information Table */}
                            <div className="text-[0.8rem] text-[var(--color-text-muted)] bg-[var(--color-surface-mid)] rounded-[16px] p-5">
                                <dl className="grid grid-cols-[80px_1fr] gap-y-2">
                                    <dt className="font-bold">タイトル</dt>
                                    <dd>『20代で考える 将来妊娠で困らないための選択』</dd>
                                    <dt className="font-bold">著者</dt>
                                    <dd>佐藤 琢磨（生殖医療専門医）</dd>
                                    <dt className="font-bold">出版</dt>
                                    <dd>2025年4月</dd>
                                    <dt className="font-bold">出版社</dt>
                                    <dd>Kindle Direct Publishing</dd>
                                    <dt className="font-bold">形式</dt>
                                    <dd>ペーパーバック・Kindle版</dd>
                                </dl>
                            </div>
                        </FadeIn>
                    </div>

                </div>
            </div>
        </section>
    );
}
