"use client";

import FadeIn from "@/components/common/fade-in";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { trackCtaClick } from "@/lib/track-cta";
import Link from "next/link";
import Image from "next/image";

export default function FinalCta() {
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
        // Ideally this uses navigator.clipboard, wrapping in a try catch
        try {
            navigator.clipboard.writeText(window.location.href);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (e) {
            console.error("Clipboard copy failed", e);
        }
    };

    return (
        <section ref={ctaRef} className="relative overflow-hidden pt-[8rem] pb-[10rem] px-6">
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
                    <motion.div style={{ y: bookY }} className="w-[180px] md:w-[260px] mb-8 drop-shadow-2xl">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src="/mockup-jp.png"
                            alt="『20代で考える 将来妊娠で困らないための選択』"
                            className="w-full h-auto"
                        />
                    </motion.div>

                    {/* Label */}
                    <p className="text-[0.8rem] text-white/70 tracking-[0.15em] font-bold mb-12">
                        Kindle版・ペーパーバック版 好評発売中
                    </p>

                    {/* Main Title */}
                    <h2 className="font-['Zen_Kaku_Gothic_New'] text-[clamp(1.6rem,4vw,2.4rem)] font-black text-white leading-tight mb-6" style={{ fontFeatureSettings: '"palt"' }}>
                        &quot;将来の自分&quot;のために、<br />今日の数ページから。
                    </h2>

                    <p className="text-[1.05rem] text-white/80 leading-relaxed mb-10 max-w-[500px]">
                        スマホで3分から読めるKindle版。<br />
                        医師が書いた&quot;安心できる医療知識&quot;。
                    </p>

                    {/* CTA Button */}
                    <a
                        href="https://amazon.co.jp/dp/B0F7XTWJ3X?tag=ttcguide-lp-22"
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => trackCtaClick("lp-jp", "cta", "final")}
                        className="cta-button btn-amazon inline-flex items-center justify-center rounded-full px-10 py-5 w-full sm:w-auto mb-6"
                    >
                        <span className="text-[16px] tracking-wide font-bold">
                            Amazonで購入する <span className="arrow ml-1">→</span>
                        </span>
                    </a>

                    <a href="/en" className="text-[0.85rem] text-white underline hover:opacity-80 transition-opacity">
                        English Edition →
                    </a>



                    {/* Partner Share */}
                    <div className="flex flex-col items-center bg-black/10 rounded-[24px] p-6 w-full max-w-[400px] mb-[4rem]">
                        <p className="text-[0.85rem] text-white/90 font-bold mb-4">
                            パートナーにも読んでほしいと思ったら
                        </p>
                        <div className="flex gap-3">
                            <a
                                href={currentUrl ? `https://line.me/R/msg/text/?${encodeURIComponent('今の自分を大切にすることが、未来の「選択肢」を増やす。20代・30代の女性とパートナーに、今から知っておくべき24の医学的事実を一冊に。 ' + currentUrl)}` : '#'}
                                target="_blank"
                                rel="noreferrer"
                                className="bg-[#06C755] hover:bg-[#05B34C] text-white text-[0.8rem] font-bold px-4 py-2 rounded-full transition-colors flex items-center gap-1 shadow-sm"
                            >
                                LINEで送る
                            </a>
                            <button
                                onClick={handleCopy}
                                className={`border border-white/50 bg-white/10 hover:bg-white/20 text-white text-[0.8rem] px-4 py-2 rounded-full transition-colors flex items-center gap-1 ${copied ? 'text-[var(--color-sage-light)] border-[var(--color-sage-light)]' : ''}`}
                            >
                                {copied ? "✓ コピーしました" : "URLをコピー 📋"}
                            </button>
                        </div>
                    </div>

                    <Link href="/blog" className="text-white hover:underline mb-10 text-[0.95rem] font-bold">
                        さとうドクターのBlog & News はこちら →
                    </Link>

                    <p className="text-[0.75rem] text-white/40">
                        このページは生殖医療専門医 佐藤琢磨が監修しています。© Educate Press
                    </p>

                </FadeIn>
            </div>
        </section>
    );
}
