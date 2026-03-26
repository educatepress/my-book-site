"use client";

import FadeIn from "@/components/common/fade-in";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

export default function HeroEn() {
    const heroRef = useRef<HTMLDivElement>(null);

    const { scrollYProgress } = useScroll({
        target: heroRef,
        offset: ["start start", "end start"],
    });

    const yBackground = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
    const yBook = useTransform(scrollYProgress, [0, 1], ["0%", "15%"]);
    const opacityText = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

    return (
        <section ref={heroRef} className="relative w-full min-h-[90vh] md:min-h-screen flex items-center justify-center overflow-hidden bg-[var(--color-surface)]">

            {/* Background Video / Image */}
            <div className="absolute inset-0 z-0">
                <video
                    autoPlay
                    muted
                    loop
                    playsInline
                    poster="/hero-poster.jpg"
                    className="hidden md:block absolute inset-0 w-full h-full object-cover"
                    style={{ opacity: 0.18 }}
                >
                    <source src="/assets/hero-bg.webm" type="video/webm" />
                    <source src="/assets/hero-bg.mp4" type="video/mp4" />
                </video>
                <div
                    className="md:hidden absolute inset-0"
                    style={{
                        backgroundImage: "url(/hero-poster.jpg)",
                        backgroundSize: "cover",
                        opacity: 0.12,
                    }}
                />
                {/* Gradient Overlay */}
                <div
                    className="absolute inset-0"
                    style={{
                        background:
                            "linear-gradient(160deg, rgba(250,250,247,0.85) 0%, rgba(239,245,240,0.7) 50%, rgba(251,242,245,0.75) 100%)",
                    }}
                />
                {/* Dot Pattern */}
                <div
                    className="absolute inset-0"
                    style={{
                        backgroundImage:
                            "radial-gradient(circle, rgba(107,143,113,0.04) 1px, transparent 1px)",
                        backgroundSize: "24px 24px",
                    }}
                />
            </div>

            {/* Main Content Container */}
            <div className="relative z-10 w-full max-w-[1200px] mx-auto px-6 h-full flex flex-col md:flex-row items-center pt-24 pb-16 md:py-0">

                {/* Left: Text Content */}
                <motion.div
                    style={{ opacity: opacityText }}
                    className="flex-1 w-full order-2 md:order-1 mt-10 md:mt-0 flex flex-col items-center md:items-start text-center md:text-left z-20"
                >
                    <FadeIn delay={0.2} className="flex flex-col items-center md:items-start gap-3 mb-[var(--spacing-md)] mx-auto md:mx-0">
                        {/* 🚨 追加：切迫感を煽るプレヘッドライン */}
                        <div className="inline-block bg-[#FFF5F5] border border-[#FFE0E0] rounded-2xl md:rounded-full px-4 py-2 md:py-1.5 shadow-sm text-center mt-2 max-w-[95%]">
                            <span className="inline-block text-[0.75rem] font-bold tracking-wider text-[#D9534F] uppercase leading-tight" style={{ textWrap: 'balance' as any }}>
                                ⚠️ Before you regret saying "I wish I had known sooner..."
                            </span>
                        </div>
                        {/* 🚨 追加：権威性と評価のバッジ */}
                        <div className="flex flex-wrap justify-center md:justify-start gap-2">
                            <span className="bg-[var(--color-sage)] text-white text-[0.7rem] font-bold px-3 py-1.5 rounded-sm tracking-wider shadow-sm uppercase">
                                By a Fertility Specialist
                            </span>
                            <div className="inline-flex items-center gap-1 bg-gradient-to-r from-[var(--color-gold-pale)] to-white border border-[#C9922E40] rounded-sm px-3 py-1.5 shadow-sm">
                                <span className="text-[var(--color-gold)] text-[0.8rem] leading-none">★★★★★</span>
                                <span className="text-[0.75rem] text-[var(--color-text-dark)] font-bold leading-none mt-[1px]">5.0 <span className="font-normal text-[var(--color-text-muted)] text-[0.65rem]">(Amazon)</span></span>
                            </div>
                        </div>
                    </FadeIn>

                    <FadeIn delay={0.4}>
                        <h1 className="font-['Zen_Kaku_Gothic_New'] text-[clamp(2rem,5vw,3.5rem)] font-black text-[var(--color-text-dark)] leading-[1.2] mb-6 tracking-tight">
                            Taking Care of Yourself Today <br className="hidden md:block" />
                            <span className="text-[var(--color-sage)]">Multiplies Your Choices for Tomorrow</span>
                        </h1>
                    </FadeIn>

                    <FadeIn delay={0.6}>
                        <p className="text-[0.95rem] md:text-[1.1rem] text-[var(--color-text-mid)] leading-relaxed mb-8 max-w-[500px]">
                            What you need to know in your 20s and 30s<br className="hidden md:block" />
                            so you don't struggle with pregnancy later.<br />
                            24 medical facts every woman and partner should know,<br className="hidden md:block" />
                            compiled into one accessible book.
                        </p>
                    </FadeIn>

                    <FadeIn delay={0.8} className="w-full flex flex-col items-center md:items-start gap-3">
                        {/* CTA Button */}
                        <a
                            href="https://www.amazon.co.jp/Doctor%E2%80%99s-Guide-Womens-Health-Preconception/dp/B0F7XTWJ3X/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="cta-button btn-amazon inline-flex items-center justify-center rounded-full px-8 py-4 w-full sm:w-auto shadow-lg hover:scale-105 transition-transform"
                        >
                            <span className="text-[15px] tracking-wide font-bold">
                                Buy on Amazon <span className="arrow ml-1">→</span>
                            </span>
                        </a>
                        <div className="flex items-center gap-4 text-[0.8rem] text-[var(--color-text-muted)] font-medium">
                            <a href="/" className="hover:text-[var(--color-sage)] transition-colors underline">
                                Japanese Edition →
                            </a>
                            <span className="w-1 h-1 rounded-full bg-[var(--color-text-muted)] opacity-50" />
                            <span>Kindle & Paperback</span>
                        </div>
                    </FadeIn>
                </motion.div>

                {/* Right: Book Mockup */}
                <motion.div
                    style={{ y: yBook }}
                    className="flex-1 w-full order-1 md:order-2 flex justify-center md:justify-end relative z-10"
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 50 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ duration: 1, delay: 0.3, ease: [0.21, 1.11, 0.81, 0.99] }}
                        className="relative w-[280px] md:w-[420px] lg:w-[480px] drop-shadow-[0_25px_45px_rgba(0,0,0,0.25)] hero-mockup-float"
                    >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src="/mock-en.png"
                            alt="Book Mockup"
                            className="w-full h-auto scale-105 object-contain"
                        />
                    </motion.div>
                </motion.div>
            </div>

        </section>
    );
}
