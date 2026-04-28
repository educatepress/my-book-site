"use client";
import Link from "next/link";
import { useState } from "react";

export default function HeaderEn() {
    const [open, setOpen] = useState(false);

    return (
        <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-md border-b border-black/5 font-en">
            <div className="max-w-[1100px] mx-auto px-5 sm:px-8 py-3 flex items-center justify-between">
                <Link href="/en" className="text-[var(--color-text-dark)] font-bold text-[0.95rem] tracking-tight hover:text-[var(--color-sage)]">
                    TTC Guide
                </Link>

                {/* Desktop nav */}
                <nav className="hidden md:flex items-center gap-7 text-[0.85rem] font-medium text-[var(--color-text-mid)]">
                    <Link href="/en/blog" className="hover:text-[var(--color-sage)]">Blog</Link>
                    <Link href="/en/simulator" className="hover:text-[var(--color-sage)]">Simulator</Link>
                    <Link href="/" className="text-[var(--color-text-muted)] hover:text-[var(--color-sage)]" hrefLang="ja">日本語</Link>
                    <a
                        href="https://amzn.to/4tRV6qk"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-[var(--color-sage)] text-white px-5 py-2 rounded-full text-[0.8rem] font-bold hover:bg-[#5a7a5f]"
                    >
                        Buy Book →
                    </a>
                </nav>

                {/* Mobile menu button */}
                <button
                    onClick={() => setOpen(!open)}
                    className="md:hidden p-2 min-w-[44px] min-h-[44px] flex items-center justify-center"
                    aria-label="Menu"
                    aria-expanded={open}
                >
                    <span className="text-xl" aria-hidden="true">{open ? '×' : '☰'}</span>
                </button>
            </div>

            {/* Mobile drawer */}
            {open && (
                <div className="md:hidden border-t border-black/5 bg-white">
                    <nav className="flex flex-col py-2 px-5">
                        <Link href="/en/blog" className="py-3 border-b border-black/5 text-[var(--color-text-mid)]" onClick={() => setOpen(false)}>Blog</Link>
                        <Link href="/en/simulator" className="py-3 border-b border-black/5 text-[var(--color-text-mid)]" onClick={() => setOpen(false)}>Simulator</Link>
                        <Link href="/" className="py-3 border-b border-black/5 text-[var(--color-text-muted)]" hrefLang="ja" onClick={() => setOpen(false)}>日本語</Link>
                        <a href="https://amzn.to/4tRV6qk" target="_blank" rel="noopener noreferrer" className="py-3 text-[var(--color-sage)] font-bold">Buy Book →</a>
                    </nav>
                </div>
            )}
        </header>
    );
}
