"use client";

import FadeIn from "@/components/common/fade-in";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { trackCtaClick } from "@/lib/track-cta";
import Link from "next/link";
import Image from "next/image";

export default function FinalCtaEn() {
    const ctaRef = useRef<HTMLDivElement>(null);
    const [copied, setCopied] = useState(false);
    const [currentUrl, setCurrentUrl] = useState("");

    useEffect(() => {
        // Set URL only on the client side to avoid hydration mismatch
        setCurrentUrl(window.location.href);
    }, []);

    // Parallax effect for the book image
    const { scrollYProgress } = useScroll({
        target: ctaRef,
        offset: ["start end", "end start"],
    });
    const bookY = useTransform(scrollYProgress, [0, 1], [20, -20]);

    const handleCopy = () => {
        try {
            navigator.clipboard.writeText(window.location.href);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (e) {
            console.error("Clipboard copy failed", e);
        }
    };

    return (
        <section ref={ctaRef} className="relative overflow-hidden pt-[8rem] pb-[10rem] px-6 font-en">
            {/* Background Gradient & Pattern */}
            <div
                className="absolute inset-0 z-0"
                style={{
                    background: "linear-gradient(150deg, var(--color-sage-dark) 0%, var(--color-sage) 45%, var(--color-blush) 100%)",
                }}
            >
                <div
                    className="absolute inset-0"
                    style={{
                        backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
                        backgroundSize: "28px 28px",
                        opacity: 0.06,
                    }}
                />
            </div>

            <div className="relative z-10 max-w-[800px] mx-auto flex flex-col items-center text-center">

                <FadeIn className="flex flex-col items-center w-full">
                    {/* Header Image */}
                    <motion.div style={{ y: bookY }} className="w-[200px] md:w-[280px] mb-12 drop-shadow-2xl">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src="/mock-en.png"
                            alt="Book Mockup"
                            className="w-full h-auto"
                        />
                    </motion.div>

                    {/* Label */}
                    <p className="text-[0.75rem] text-white/80 tracking-[0.2em] font-bold mb-5 uppercase">
                        Available Now in Kindle & Paperback
                    </p>

                    {/* Main Title */}
                    <h2 className="font-['Zen_Kaku_Gothic_New'] text-[clamp(1.6rem,4vw,2.4rem)] font-black text-white leading-tight mb-6">
                        For your future self,<br />start with a few pages today.
                    </h2>

                    <p className="text-[1.05rem] text-white/80 leading-relaxed mb-10 max-w-[500px]">
                        Accessible medical knowledge backed by a fertility specialist.<br />
                        Read the Kindle Edition in 3-minute chunks on your phone.
                    </p>

                    {/* CTA Button */}
                    <a
                        href="https://amzn.to/4tRV6qk"
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => trackCtaClick("lp-en", "cta", "final")}
                        className="cta-button btn-amazon inline-flex items-center justify-center rounded-full px-10 py-5 w-full sm:w-auto mb-6"
                    >
                        <span className="text-[16px] tracking-wide">
                            📖 Buy on Amazon <span className="arrow ml-1">→</span>
                        </span>
                    </a>

                    <a href="/" className="text-[0.85rem] text-white underline hover:opacity-80 transition-opacity">
                        View Japanese Version →
                    </a>



                    {/* Partner Share */}
                    <div className="flex flex-col items-center bg-black/10 rounded-[24px] p-6 w-full max-w-[400px] mb-[4rem]">
                        <p className="text-[0.85rem] text-white/90 font-bold mb-4">
                            If you think your partner should read this
                        </p>
                        <div className="flex flex-wrap justify-center gap-3">
                            <a
                                href={currentUrl ? `https://line.me/R/msg/text/?${encodeURIComponent('Taking care of yourself today expands your choices for tomorrow. 24 medical facts for women in their 20s and 30s and their partners. ' + currentUrl)}` : '#'}
                                target="_blank"
                                rel="noreferrer"
                                className="bg-[#06C755] hover:bg-[#05B34C] text-white text-[0.8rem] font-bold px-4 py-2 rounded-full transition-colors flex items-center gap-1 shadow-sm"
                            >
                                Share on LINE
                            </a>
                            <button
                                onClick={handleCopy}
                                className={`border border-white/50 bg-white/10 hover:bg-white/20 text-white text-[0.8rem] px-4 py-2 rounded-full transition-colors flex items-center gap-1 ${copied ? 'text-[var(--color-sage-light)] border-[var(--color-sage-light)]' : ''}`}
                            >
                                {copied ? "✓ Copied!" : "Copy URL 📋"}
                            </button>
                        </div>
                    </div>

                    <Link href="/en/blog" className="text-white hover:underline mb-10 text-[0.95rem] font-bold font-en">
                        📝 Dr. Sato's Blog & News →
                    </Link>

                    <p className="text-[0.75rem] text-white/40">
                        This page is supervised by Reproductive Medicine Specialist Takuma Sato. © Educate Press
                    </p>

                </FadeIn>
            </div>
        </section>
    );
}
