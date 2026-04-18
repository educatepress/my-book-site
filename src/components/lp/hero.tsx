"use client";

import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { trackCtaClick } from "@/lib/track-cta";

export default function Hero() {
    const heroRef = useRef<HTMLDivElement>(null);

    // Parallax effect for the book image
    const { scrollYProgress } = useScroll({
        target: heroRef,
        offset: ["start start", "end start"],
    });
    const bookY = useTransform(scrollYProgress, [0, 1], [0, -40]);

    // Framer Motion shared transition settings
    const transition = { duration: 0.6, ease: [0.25, 0.1, 0.25, 1.0] as const };

    return (
        <section ref={heroRef} className="relative min-h-[100svh] w-full flex items-center justify-center overflow-hidden">
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

            {/* Main Content */}
            <div className="relative z-10 max-w-[1120px] mx-auto px-6 pt-12 pb-20 md:py-0 w-full flex flex-col md:flex-row items-center justify-between gap-[var(--spacing-xl)] md:gap-[var(--spacing-2xl)]">

                {/* Left Column: Text Content */}
                <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left">
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ ...transition, delay: 0 }}
                        className="flex flex-col items-center md:items-start gap-3 mb-[var(--spacing-md)] mx-auto md:mx-0"
                    >
                        {/* 🚨 追加：切迫感を煽るプレヘッドライン */}
                        <div className="inline-block bg-[#FFF5F5] border border-[#FFE0E0] rounded-2xl md:rounded-full px-4 py-2 md:py-1.5 shadow-sm text-center mt-2 max-w-[95%]">
                            <span className="inline-block text-[0.8rem] font-bold tracking-wider text-[#D9534F] leading-tight" style={{ textWrap: 'balance' as any }}>
                                ⚠️「あと1年早く知っていれば…」と後悔する前に。
                            </span>
                        </div>
                        {/* 🚨 追加：権威性と評価のバッジ */}
                        <div className="flex flex-wrap justify-center md:justify-start gap-2">
                            <span className="bg-[var(--color-sage)] text-white text-[0.7rem] font-bold px-3 py-1.5 rounded-sm tracking-wider shadow-sm">
                                生殖医療専門医 著
                            </span>
                            <div className="inline-flex items-center gap-1 bg-gradient-to-r from-[var(--color-gold-pale)] to-white border border-[#C9922E40] rounded-sm px-3 py-1.5 shadow-sm">
                                <span className="text-[var(--color-gold)] text-[0.8rem] leading-none">★★★★★</span>
                                <span className="text-[0.75rem] text-[var(--color-text-dark)] font-bold leading-none mt-[1px]">5.0 <span className="font-normal text-[var(--color-text-muted)] text-[0.65rem]">(Amazon)</span></span>
                            </div>
                        </div>
                    </motion.div>

                    <motion.h1
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ ...transition, delay: 0.08 }}
                        className="text-[clamp(1.85rem,5vw,3.2rem)] font-black leading-[1.4] md:leading-[1.3] text-[var(--color-text-dark)] mb-[var(--spacing-md)]"
                        style={{ fontFeatureSettings: '"palt"' }}
                    >
                        『20代で考える
                        <br className="hidden md:block" />
                        <span className="text-[var(--color-sage)]">将来、妊娠で困らないための選択</span>』
                    </motion.h1>

                    <motion.p
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ ...transition, delay: 0.16 }}
                        className="text-[1.05rem] text-[var(--color-text-mid)] leading-[1.9] mb-[var(--spacing-lg)] max-w-[500px] text-left md:text-left"
                    >
                        今の自分を大切にすることが、<br className="hidden md:block" />
                        未来の「選択肢」を増やす。<br className="hidden md:block" />
                        20代・30代の女性とパートナーに、<br className="hidden md:block" />
                        今から知っておくべき24の医学的事実を一冊に。
                    </motion.p>

                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ ...transition, delay: 0.24 }}
                        className="w-full flex justify-center md:justify-start"
                    >
                        <a
                            href="https://amazon.co.jp/dp/B0F7XTWJ3X?tag=ttcguide-lp-22"
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => trackCtaClick("lp-jp", "cta", "hero")}
                            className="cta-button btn-amazon inline-flex items-center justify-center rounded-full px-8 py-4 w-full sm:w-auto"
                        >
                            <span className="text-[15px] tracking-wide font-bold">
                                Amazonで購入する <span className="arrow ml-1">→</span>
                            </span>
                        </a>
                    </motion.div>

                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ ...transition, delay: 0.32 }}
                        className="mt-[var(--spacing-sm)] flex flex-col items-center md:items-start gap-2"
                    >
                        <div className="text-[0.8rem] text-[var(--color-text-muted)]">
                            <a href="/en" className="text-link-hover font-en font-medium mr-2">English Edition →</a>
                            ｜ Kindle版 ¥1,250
                        </div>
                    </motion.div>
                </div>

                {/* Right Column: Book Mockup */}
                <motion.div
                    initial={{ x: 30, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ ...transition, delay: 0.2 }}
                    style={{ y: bookY }}
                    // 🚨 モックアップを拡大し、影を深くしてシズル感を出す
                    className="flex-shrink-0 w-[240px] md:w-[380px] lg:w-[440px] drop-shadow-[0_25px_45px_rgba(0,0,0,0.25)] z-10"
                >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src="/mockup-jp.png"
                        alt="20代で考える 将来妊娠で困らないための選択"
                        className="w-full h-auto object-contain md:scale-105"
                        width={440}
                        height={600}
                        loading="eager"
                    />
                </motion.div>
            </div>
        </section>
    );
}
