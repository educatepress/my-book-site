"use client";

import { motion, useScroll, useMotionValueEvent, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { trackCtaClick } from "@/lib/track-cta";

export default function StickyCta() {
    const { scrollY } = useScroll();
    const [isVisible, setIsVisible] = useState(false);

    // Heroセクションを過ぎたあたり(600px)でスッと表示させる
    useMotionValueEvent(scrollY, "change", (latest) => {
        setIsVisible(latest > 600);
    });

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20 }}
                    className="fixed bottom-4 sm:bottom-6 left-0 right-0 z-50 flex justify-center w-full px-4 pointer-events-none"
                >
                    <div className="pointer-events-auto w-full max-w-[460px] bg-white/90 backdrop-blur-xl p-1.5 sm:p-2 rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.12)] border border-black/5 flex items-center justify-between gap-2">
                        <div className="pl-3.5 hidden sm:flex items-center gap-3">
                            <div className="flex items-center gap-1">
                                <span className="text-[var(--color-gold)] text-[0.7rem] leading-none">★★★★★</span>
                                <span className="text-[0.7rem] font-bold text-[var(--color-text-dark)] leading-none">5.0</span>
                            </div>
                            <span className="text-[0.65rem] text-[var(--color-text-muted)] font-medium">Kindle ¥1,250</span>
                        </div>
                        <a
                            href="https://amzn.to/3NcOWBl"
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => trackCtaClick("lp-jp", "sticky", "sticky-bar")}
                            className="cta-button btn-amazon flex-1 sm:flex-none inline-flex items-center justify-center rounded-full px-6 py-3 w-full sm:w-auto shadow-md hover:scale-105 transition-transform"
                        >
                            <span className="text-[14px] tracking-wide font-bold">
                                Amazonで購入する <span className="arrow ml-1">→</span>
                            </span>
                        </a>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
