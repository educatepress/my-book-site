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
                <span className="flex-1 font-bold text-[0.95rem] text-[var(--color-text-dark)] leading-relaxed pr-4 font-en">
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
                            <p className="flex-1 text-[0.9rem] text-[var(--color-text-mid)] leading-relaxed font-en">
                                {a}
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default function FaqSectionEn() {
    const faqs = [
        {
            q: "Can I become infertile even in my 20s?",
            a: "Yes. Even with regular periods, you may struggle to conceive due to issues like fallopian tube problems or male factors. Having an early baseline checkup will help keep your future options op",
        },
        {
            q: "What is the 'best age' for pregnancy?",
            a: "Generally, pregnancy rates peak in the late 20s to around 30. However, individual differences are huge. It's important to look comprehensively not just at age, but also at AMH levels, menstrual cycles, and any diseases that pose an infertility risk.",
        },
        {
            q: "When should I see a doctor?",
            a: "We recommend consulting a doctor if you haven't conceived after 1 year if under 35, or after 6 months if 35 or older. Consulting a fertility specialist early can save you time and detours.",
        },
    ];

    return (
        <section className="bg-[var(--color-white)] py-[6rem] px-6 font-en">
            <div className="max-w-[800px] mx-auto">
                <FadeIn className="text-center mb-[var(--spacing-xl)]">
                    <h3 className="font-['Zen_Kaku_Gothic_New'] text-[1.5rem] font-bold text-[var(--color-text-dark)] mb-2 tracking-tight">Frequently Asked Questions</h3>
                    <p className="text-[0.75rem] text-[var(--color-text-muted)]">
                        *Supervised by Takuma Sato, Reproductive Medicine Specialist
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
