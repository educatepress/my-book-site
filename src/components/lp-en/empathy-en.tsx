"use client";

import FadeIn from "@/components/common/fade-in";
import { motion, useInView, useSpring, useTransform } from "framer-motion";
import { useRef, useEffect } from "react";

const AnimatedNumber = () => {
    const ref = useRef<HTMLSpanElement>(null);
    const isInView = useInView(ref, { once: true, margin: "-50px" });

    const springValue = useSpring(0, {
        duration: 1200,
        bounce: 0,
    });

    const displayValue = useTransform(springValue, (current) => Math.round(current));

    useEffect(() => {
        if (isInView) {
            springValue.set(24);
        }
    }, [isInView, springValue]);

    return <motion.span ref={ref}>{displayValue}</motion.span>;
};

export default function EmpathyEn() {
    const cards = [
        { icon: "01", text: "I feel anxious seeing pregnancy announcements, but I don't know where to start." },
        { icon: "02", text: "My career matters. But when is my body's actual 'biological deadline'?" },
        { icon: "03", text: "Online fertility info is terrifying. What's actually medically accurate?" },
        { icon: "04", text: "I want kids in the future, but I don't know how to bring it up with my partner." },
    ];

    return (
        <section className="bg-[var(--color-white)] py-[6rem] md:py-[8rem] px-6">
            <div className="max-w-[1120px] mx-auto flex flex-col items-center">

                <FadeIn className="text-center mb-[var(--spacing-lg)]">
                    <div className="inline-block border border-[var(--color-sage)] text-[var(--color-sage)] rounded-full px-4 py-1 mb-[var(--spacing-sm)]">
                        <span className="text-[0.7rem] font-bold tracking-widest font-en uppercase">Why</span>
                    </div>
                    <h2 className="text-[clamp(1.5rem,3.5vw,2rem)] font-bold text-[var(--color-text-dark)] leading-snug">
                        Do You Ever Feel This Way?
                    </h2>
                </FadeIn>

                <div className="w-full max-w-[800px] grid grid-cols-1 md:grid-cols-2 gap-[var(--spacing-md)] mb-[var(--spacing-2xl)]">
                    {cards.map((card, idx) => (
                        <FadeIn key={idx} delay={idx * 0.1}>
                            <div
                                className="bg-[var(--color-sage-pale)] rounded-[16px] p-6 flex items-start gap-4 h-full pointer-events-none"
                            >
                                <div className="text-[32px] shrink-0 leading-none">{card.icon}</div>
                                <p className="text-[0.95rem] text-[var(--color-text-mid)] font-medium leading-[1.6] pt-1 font-en">
                                    {card.text}
                                </p>
                            </div>
                        </FadeIn>
                    ))}
                </div>

                <FadeIn delay={0.4} className="text-center max-w-[600px] mx-auto">
                    <p className="text-[1.05rem] leading-relaxed text-[var(--color-text-dark)] font-en">
                        There is <span className="font-bold text-[var(--color-sage)]">"a year's worth of difference"</span><br className="hidden md:block" />
                        between knowing and not knowing.<br />
                        This book clearly organizes <span className="font-bold text-[1.2rem] text-[var(--color-sage)]"><AnimatedNumber /> medical facts</span><br className="hidden md:block" />
                        that a fertility specialist wishes you knew sooner.
                    </p>
                </FadeIn>

            </div>
        </section>
    );
}
