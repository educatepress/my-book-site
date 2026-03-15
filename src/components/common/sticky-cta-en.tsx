"use client";

import { motion, useScroll, useMotionValueEvent, AnimatePresence } from "framer-motion";
import { useState } from "react";

export default function StickyCtaEn() {
    const { scrollY } = useScroll();
    const [isVisible, setIsVisible] = useState(false);

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
                    className="fixed bottom-4 sm:bottom-6 left-0 right-0 z-50 flex justify-center w-full px-4 pointer-events-none font-en"
                >
                    <div className="pointer-events-auto w-full max-w-[480px] bg-white/95 backdrop-blur-md p-2 sm:p-2.5 rounded-full shadow-[0_12px_40px_rgba(0,0,0,0.18)] border border-black/5 flex items-center justify-between">
                        <div className="pl-4 hidden sm:flex flex-col justify-center">
                            <div className="flex items-center gap-1 mb-0.5">
                                <span className="text-[var(--color-gold)] text-[0.7rem] leading-none">★★★★★</span>
                                <span className="text-[0.75rem] font-bold text-[var(--color-text-dark)] leading-none mt-[1px]">5.0</span>
                            </div>
                            <p className="text-[0.7rem] font-bold text-[var(--color-text-muted)] tracking-wider">
                                Kindle Edition
                            </p>
                        </div>
                        <a
                            href="https://www.amazon.co.jp/Doctor%E2%80%99s-Guide-Womens-Health-Preconception/dp/B0F7XTWJ3X/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="cta-button btn-amazon flex-1 sm:flex-none inline-flex items-center justify-center rounded-full px-8 py-3.5 w-full sm:w-auto m-0 shadow-md hover:scale-105 transition-transform"
                        >
                            <span className="text-[15px] tracking-wide font-bold">
                                Buy on Amazon <span className="arrow ml-1">→</span>
                            </span>
                        </a>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
