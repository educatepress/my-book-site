"use client";

import FadeIn from "@/components/common/fade-in";
import { motion, useInView, useSpring, useTransform } from "framer-motion";
import { useRef, useEffect } from "react";

// Counter component for the number "24" — starts at 24 to avoid SSR "0" flash
const AnimatedNumber = () => {
    const ref = useRef<HTMLSpanElement>(null);
    const isInView = useInView(ref, { once: true, margin: "-50px" });

    const springValue = useSpring(0, {
        duration: 1200,
        bounce: 0,
    });

    const displayValue = useTransform(springValue, (current) => {
        const rounded = Math.round(current);
        return rounded === 0 ? 24 : rounded;
    });

    useEffect(() => {
        if (isInView) {
            springValue.set(24);
        }
    }, [isInView, springValue]);

    return <motion.span ref={ref}>{displayValue}</motion.span>;
};

export default function Empathy() {
    const cards = [
        { icon: "01", text: "周りの妊娠・出産報告に焦るけど、自分は何から始めればいいか分からない。" },
        { icon: "02", text: "キャリアも大事。でも私の「身体のタイムリミット」って本当はいつ？" },
        { icon: "03", text: "ネットの妊活情報が怖すぎて、どれが正しい医学的根拠なのか不安。" },
        { icon: "04", text: "将来子どもは欲しいけど、パートナーにどう切り出していいか分からない。" },
    ];

    return (
        <section className="bg-[var(--color-white)] py-[10rem] px-6">
            <div className="max-w-[1120px] mx-auto flex flex-col items-center">

                <FadeIn className="text-center mb-[var(--spacing-lg)]">
                    <div className="inline-block border border-[var(--color-sage)] text-[var(--color-sage)] rounded-full px-4 py-1 mb-[var(--spacing-sm)]">
                        <span className="text-[0.7rem] font-bold tracking-widest font-en">WHY</span>
                    </div>
                    <h2 className="text-[clamp(1.5rem,3.5vw,2rem)] font-bold text-[var(--color-text-dark)] leading-snug" style={{ fontFeatureSettings: '"palt"', textWrap: 'balance' as any }}>
                        こんなこと、感じていませんか？
                    </h2>
                </FadeIn>

                <div className="w-full max-w-[800px] grid grid-cols-1 md:grid-cols-2 gap-[var(--spacing-md)] mb-[var(--spacing-2xl)]">
                    {cards.map((card, idx) => (
                        <FadeIn key={idx} delay={idx * 0.1}>
                            <div
                                className="bg-[var(--color-sage-pale)] rounded-[16px] p-6 flex items-start gap-4 h-full pointer-events-none"
                            >
                                <div className="text-[32px] shrink-0 leading-none font-en text-[var(--color-sage)] font-bold opacity-40">{card.icon}</div>
                                <p className="text-[0.95rem] text-[var(--color-text-mid)] font-medium leading-[1.6] pt-1" style={{ textWrap: 'pretty' as any }}>
                                    {card.text}
                                </p>
                            </div>
                        </FadeIn>
                    ))}
                </div>

                <FadeIn delay={0.4} className="text-left md:text-center max-w-[600px] mx-auto">
                    <p className="text-[1.05rem] leading-[2] text-[var(--color-text-dark)]" style={{ textWrap: 'pretty' as any }}>
                        知っているか、知らないかで変わる
                        <span className="font-bold text-[var(--color-sage)]">「一年分の時間」</span>がある。
                        <br className="hidden md:block" />
                        本書は、生殖医療専門医が「先に知っていると差がつく」
                        <br className="hidden md:block" />
                        <span className="font-bold text-[1.2rem] text-[var(--color-sage)]">
                            <AnimatedNumber />の医学的事実
                        </span>を、やさしく、<br className="hidden md:block" />
                        読みやすく整理した一冊です。
                    </p>
                </FadeIn>

            </div>
        </section>
    );
}
