"use client";

import FadeIn from "@/components/common/fade-in";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface FaqItemProps {
    q: string;
    a: string;
    isOpenDefault?: boolean;
}

const FaqItem = ({ q, a, isOpenDefault = false }: FaqItemProps) => {
    const [isOpen, setIsOpen] = useState(isOpenDefault);

    return (
        <div
            className={`w-full rounded-[16px] mb-3 border transition-colors duration-300 ${isOpen ? "bg-white border-transparent shadow-sm" : "bg-white border-[rgba(107,143,113,0.1)]"
                }`}
        >
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-start gap-3 p-4 md:p-5 text-left"
                aria-expanded={isOpen}
            >
                <span className="shrink-0 w-6 h-6 rounded-full bg-[var(--color-blush-pale)] text-[var(--color-blush)] flex items-center justify-center text-[0.8rem] font-bold font-en mt-0.5">
                    Q
                </span>
                <span className="flex-1 font-bold text-[0.95rem] text-[var(--color-text-dark)] leading-relaxed pr-4">
                    {q}
                </span>
                <motion.div
                    animate={{ rotate: isOpen ? 90 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="text-[var(--color-text-muted)] mt-1"
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="9 18 15 12 9 6" />
                    </svg>
                </motion.div>
            </button>

            <AnimatePresence initial={false}>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                    >
                        <div className="flex items-start gap-3 px-4 md:px-5 pb-5 pt-1">
                            <span className="shrink-0 w-6 h-6 rounded-full bg-[var(--color-surface-mid)] text-[var(--color-text-mid)] flex items-center justify-center text-[0.8rem] font-bold font-en mt-0.5">
                                A
                            </span>
                            <p className="flex-1 text-[0.9rem] text-[var(--color-text-mid)] leading-[1.8]">
                                {a}
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default function FaqSection() {
    const faqs = [
        {
            q: "20代でも不妊になることはありますか？",
            a: "あります。生理が規則的でも卵管のトラブルやパートナー側の要因などで妊娠しにくい場合があります。早めに基礎検査を受けておくと、将来の選択肢を広く保つことができます。",
        },
        {
            q: "妊娠の「ベストな年齢」は何歳ですか？",
            a: "一般的には20代後半〜30歳前後が妊娠率のピークとされますが、個人差が大きいため、年齢だけでなくAMH値・月経周期・不妊リスクとなる疾患の有無なども総合的に見ることが大切です。",
        },
        {
            q: "いつ病院を受診したらいいか、目安はありますか？",
            a: "35歳未満で1年、35歳以上で半年妊娠しなければ一度相談をおすすめします。生殖医療専門医に早めに相談することで、遠回りの時間を減らせます。",
        },
    ];

    return (
        <section className="bg-[var(--color-white)] py-[6rem] px-6">
            <div className="max-w-[800px] mx-auto">
                <FadeIn className="text-center mb-[var(--spacing-xl)]">
                    <h3 className="text-[1.5rem] font-bold text-[var(--color-text-dark)] mb-2">よくある質問</h3>
                    <p className="text-[0.75rem] text-[var(--color-text-muted)]">
                        ※生殖医療専門医 佐藤琢磨 監修
                    </p>
                </FadeIn>

                <div className="flex flex-col">
                    {faqs.map((faq, idx) => (
                        <FadeIn key={idx} delay={idx * 0.1}>
                            <FaqItem q={faq.q} a={faq.a} isOpenDefault={false} />
                        </FadeIn>
                    ))}
                </div>
            </div>
        </section>
    );
}
