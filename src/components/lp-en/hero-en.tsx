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

            {/* Background Graphic/Video */}
            <motion.div
                style={{ y: yBackground }}
                className="absolute inset-0 w-full h-full z-0"
            >
                <div className="absolute inset-0 bg-white/40 z-10 mix-blend-overlay" />
                <div
                    className="w-full h-full bg-cover bg-center bg-no-repeat opacity-80"
                    style={{ backgroundImage: "url('/hero-woman.jpg')" }}
                />
                {/*
        <video 
          autoPlay 
          muted 
          loop 
          playsInline 
          className="w-full h-full object-cover opacity-70"
          poster="/hero-poster.jpg"
        >
          <source src="/hero-bg.webm" type="video/webm" />
          <source src="/hero-bg.mp4" type="video/mp4" />
        </video>
        */}
            </motion.div>

            {/* Main Content Container */}
            <div className="relative z-10 w-full max-w-[1200px] mx-auto px-6 h-full flex flex-col md:flex-row items-center pt-20 md:pt-0 pb-10">

                {/* Left: Text Content */}
                <motion.div
                    style={{ opacity: opacityText }}
                    className="flex-1 w-full order-2 md:order-1 mt-10 md:mt-0 flex flex-col items-center md:items-start text-center md:text-left"
                >
                    <FadeIn delay={0.2}>
                        <div className="inline-block border border-[var(--color-sage)] text-[var(--color-sage)] rounded-full px-4 py-1 mb-6 text-[0.85rem] font-bold tracking-wider">
                            Explained Simply by a Fertility Specialist
                        </div>
                    </FadeIn>

                    <FadeIn delay={0.4}>
                        <h1 className="font-['Zen_Kaku_Gothic_New'] text-[clamp(2rem,5vw,3.5rem)] font-black text-[var(--color-text-dark)] leading-[1.2] mb-6 tracking-tight">
                            Taking Care of Yourself Today <br className="hidden md:block" />
                            <span className="text-[var(--color-sage)]">Multiplies Your Choices for Tomorrow</span>
                        </h1>
                    </FadeIn>

                    <FadeIn delay={0.6}>
                        <p className="text-[0.95rem] md:text-[1.1rem] text-[var(--color-text-mid)] leading-[1.8] mb-8 max-w-[500px]">
                            What you need to know in your 20s and 30s so you don't struggle with pregnancy later.
                            24 medical facts every woman and partner should know, compiled into one accessible book.
                        </p>
                    </FadeIn>

                    <FadeIn delay={0.8} className="w-full flex flex-col items-center md:items-start">
                        {/* CTA Button */}
                        <a
                            href="https://www.amazon.co.jp/Doctor%E2%80%99s-Guide-Womens-Health-Preconception/dp/B0F7XTWJ3X/ref=tmm_pap_swatch_0"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="cta-button btn-amazon inline-flex items-center justify-center rounded-full px-8 py-4 w-full sm:w-auto mb-4"
                        >
                            <span className="text-[15px] tracking-wide">
                                📖 Buy on Amazon <span className="arrow ml-1">→</span>
                            </span>
                        </a>
                        <div className="flex items-center gap-4 text-[0.8rem] text-[var(--color-text-muted)]">
                            <a href="/" className="hover:text-[var(--color-sage)] transition-colors underline">
                                Japanese Edition →
                            </a>
                            <span className="w-1 h-1 rounded-full bg-[var(--color-text-muted)] opacity-50" />
                            <span>Kindle $9.99</span>
                        </div>
                    </FadeIn>

                    <FadeIn delay={1.0} className="mt-8">
                        <div className="flex items-center gap-2 text-[0.85rem] font-bold text-[var(--color-gold)] mb-1">
                            ★★★★★ <span className="text-[var(--color-text-dark)] font-medium">5.0 (Amazon)</span>
                        </div>
                    </FadeIn>
                </motion.div>

                {/* Right: Book Mockup */}
                <motion.div
                    style={{ y: yBook }}
                    className="flex-1 w-full order-1 md:order-2 flex justify-center md:justify-end"
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 50 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ duration: 1, delay: 0.3, ease: [0.21, 1.11, 0.81, 0.99] }}
                        className="relative w-[220px] md:w-[320px] drop-shadow-2xl hero-mockup-float"
                    >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src="/mock-en.png"
                            alt="Book Mockup"
                            className="w-full h-auto"
                        />
                    </motion.div>
                </motion.div>

            </div>

            {/* Floating Author Profile Snippet */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.2 }}
                className="absolute bottom-6 md:bottom-10 left-1/2 -translate-x-1/2 z-20 w-[90%] md:w-auto"
            >
                <div className="glass-panel flex items-center justify-between sm:justify-center gap-4 px-6 py-3 rounded-full">
                    <div className="flex items-center justify-center shrink-0 w-12 h-12 rounded-full border-2 border-white overflow-hidden bg-white">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src="/author-white.jpg"
                            alt="Takuma Sato"
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-[0.9rem] text-[var(--color-text-dark)] leading-tight">Takuma Sato</span>
                        <span className="text-[0.7rem] text-[var(--color-text-muted)] leading-tight">MD, PhD / Fertility Specialist</span>
                    </div>
                    <div className="hidden sm:flex items-center gap-3 ml-4 pl-4 border-l border-black/10">
                        <span className="text-[1.2rem] opacity-70">📝</span>
                        <span className="text-[1.2rem] opacity-70">📸</span>
                    </div>
                </div>
            </motion.div>

        </section>
    );
}
