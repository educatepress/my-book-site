"use client";

import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

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
            <div className="relative z-10 max-w-[1120px] mx-auto px-6 pt-24 pb-32 md:py-0 w-full flex flex-col md:flex-row items-center justify-between gap-[var(--spacing-xl)] md:gap-[var(--spacing-2xl)]">

                {/* Left Column: Text Content */}
                <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left">
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ ...transition, delay: 0 }}
                        className="inline-block bg-[var(--color-sage-pale)] text-[var(--color-sage)] border border-[var(--color-sage-light)] rounded-full px-4 py-1 mb-[var(--spacing-md)] mx-auto md:mx-0"
                    >
                        <span className="text-[0.75rem] font-bold tracking-[0.15em] whitespace-nowrap">
                            生殖医療専門医がやさしく解説
                        </span>
                    </motion.div>

                    <motion.h1
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ ...transition, delay: 0.08 }}
                        className="text-[clamp(1.85rem,5vw,3.2rem)] font-black leading-[1.3] text-[var(--color-text-dark)] mb-[var(--spacing-md)]"
                        style={{ fontFeatureSettings: '"palt"' }}
                    >
                        『20代で考える
                        <br />
                        <span className="text-[var(--color-sage)]">将来、妊娠で困らないための</span>
                        <br />
                        選択』
                    </motion.h1>

                    <motion.p
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ ...transition, delay: 0.16 }}
                        className="text-[1.05rem] text-[var(--color-text-mid)] leading-[1.9] mb-[var(--spacing-lg)] max-w-[500px]"
                    >
                        今の自分を大切にすることが、<br className="hidden md:block" />
                        未来の「選択肢」を増やす。<br />
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
                            href="https://amzn.to/3NcOWBl"
                            target="_blank"
                            rel="noopener noreferrer"
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
                        <div className="inline-flex items-center gap-1 bg-[var(--color-gold-pale)] border border-[#C9922E40] rounded-full px-4 py-1.5 mt-2">
                            <span className="text-[var(--color-gold)] text-sm">★★★★★</span>
                            <span className="text-[0.85rem] text-[var(--color-text-mid)] font-medium">5.0 (Amazon)</span>
                        </div>
                    </motion.div>
                </div>

                {/* Right Column: Book Mockup */}
                <motion.div
                    initial={{ x: 30, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ ...transition, delay: 0.2 }}
                    style={{ y: bookY }}
                    className="flex-shrink-0 w-[200px] md:w-[320px] lg:w-[380px] drop-shadow-2xl z-10"
                >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src="/mockup-jp.png"
                        alt="20代で考える 将来妊娠で困らないための選択"
                        className="w-full h-auto object-contain"
                    />
                </motion.div>
            </div>

            {/* Bottom Floating Bar */}
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ ...transition, delay: 0.4 }}
                className="absolute bottom-6 md:bottom-12 left-0 right-0 z-20 flex justify-center w-full px-4"
            >
                <div className="glass-panel flex items-center gap-4 px-6 py-3 rounded-full">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src="/author-white.jpg"
                        alt="Author"
                        className="w-12 h-12 rounded-full border-2 border-white object-cover"
                    />
                    <div>
                        <p className="text-[0.85rem] font-bold text-[var(--color-text-dark)] mb-0.5">佐藤 琢磨</p>
                        <p className="text-[0.7rem] text-[var(--color-text-mid)]">生殖医療専門医</p>
                    </div>
                    <div className="flex gap-2 ml-4">
                        {/* Using precise text icons for sophistication */}
                        <a href="https://note.com/takuma_sato" target="_blank" rel="noreferrer" aria-label="note">
                            <div className="text-[0.75rem] font-bold text-[var(--color-text-mid)] bg-white px-3 py-1.5 rounded-full shadow-sm hover:scale-105 transition-transform border border-black/5">note</div>
                        </a>
                        <a href="https://instagram.com/takuma.dr" target="_blank" rel="noreferrer" aria-label="Instagram">
                            <div className="text-[0.75rem] font-bold text-[var(--color-text-mid)] bg-white px-3 py-1.5 rounded-full shadow-sm hover:scale-105 transition-transform border border-black/5">Instagram</div>
                        </a>
                    </div>
                </div>
            </motion.div>
        </section>
    );
}
