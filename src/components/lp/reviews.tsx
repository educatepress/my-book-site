"use client";

import FadeIn from "@/components/common/fade-in";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

// Star rating component with stagger animation
const AnimatedStars = () => {
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true, margin: "-50px" });

    return (
        <div ref={ref} className="flex gap-1" role="img" aria-label="5つ星中5つ星の評価">
            {[1, 2, 3, 4, 5].map((idx) => (
                <motion.span
                    key={idx}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
                    transition={{ duration: 0.4, delay: idx * 0.1, ease: [0.34, 1.56, 0.64, 1] }}
                    className="text-[var(--color-gold)]"
                >
                    ★
                </motion.span>
            ))}
        </div>
    );
};

export default function Reviews() {
    const reviews = [
        {
            name: "ひよこまめ",
            text: "信頼できる女医さんがSNSで紹介されていて購入してみました。働き盛りの女性が、妊娠出産といった将来を見据えて知っておくべき情報が分かりやすく書かれています。具体的にいつまでにどうなっておくと良いのかということが書かれており、将来設計を立てるのに役立つと思います。パートナーに読んでもらうのにも良い本だなと思いました。",
        },
        {
            name: "さくら",
            text: "専門医の立場から、妊娠に関する医学的エビデンスをイラストを交えてわかりやすく解説した良書です。単なる医学知識の羅列にとどまらず、著者自身も子を持つ父親であり、共働き夫婦としての経験を踏まえながら、読者の幸せなライフプラン形成を心から願う思いが随所に感じられます。",
        },
    ];

    return (
        <section className="bg-[var(--color-gold-pale)] py-[6rem] px-6">
            <div className="max-w-[800px] mx-auto">
                <FadeIn className="text-center mb-[var(--spacing-lg)]">
                    <h3 className="text-[1.5rem] font-bold text-[var(--color-text-dark)] mb-4" style={{ fontFeatureSettings: '"palt"' }}>読者の声</h3>
                    <div className="inline-flex flex-col items-center gap-2">
                        <div className="flex items-center gap-2 text-[0.9rem] font-medium text-[var(--color-text-dark)]">
                            <AnimatedStars /> 5.0（XX件のレビュー）
                        </div>
                        <a href="https://amzn.to/3NcOWBl" target="_blank" rel="noreferrer" className="text-[0.8rem] text-[var(--color-sage)] hover:underline ml-1">
                            → Amazonで全てのレビューを見る
                        </a>
                    </div>
                </FadeIn>

                <div className="flex flex-col gap-[var(--spacing-md)]">
                    {reviews.map((review, idx) => (
                        <FadeIn key={idx} delay={idx * 0.1}>
                            <div className="bg-white rounded-[16px] p-6 md:p-8 shadow-sm relative">

                                {/* Amazon purchase badge */}
                                <div className="absolute top-4 right-4 sm:top-6 sm:right-6 bg-[var(--color-gold-pale)] text-[var(--color-gold)] text-[0.6rem] sm:text-[0.7rem] font-bold px-2 sm:px-3 py-1 rounded-full z-10">
                                    ✓ Amazonで購入
                                </div>

                                <div className="mb-4 flex items-center gap-2">
                                    <div className="text-[var(--color-gold)] text-[0.85rem]">★★★★★ 5.0</div>
                                </div>

                                <p className="text-[0.95rem] text-[var(--color-text-dark)] leading-[1.8] mb-6 max-w-[640px] mx-auto md:mx-0 text-left">
                                    {review.text}
                                </p>

                                <p className="text-[0.8rem] text-[var(--color-text-muted)]">
                                    — {review.name}（Amazon）
                                </p>
                            </div>
                        </FadeIn>
                    ))}
                </div>
            </div>
        </section>
    );
}
