"use client";

import { useState } from "react";
import { motion } from "framer-motion";

interface AccordionProps {
    title: React.ReactNode;
    children: React.ReactNode;
    icon?: React.ReactNode;
    isOpenDefault?: boolean;
}

export default function Accordion({ title, children, icon, isOpenDefault = false }: AccordionProps) {
    const [isOpen, setIsOpen] = useState(isOpenDefault);

    return (
        <div className="w-full rounded-[16px] overflow-hidden mb-3">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full flex items-center justify-between text-left p-4 transition-colors duration-300 ${isOpen ? "bg-[var(--color-sage-pale)]" : "bg-white"
                    }`}
                aria-expanded={isOpen}
            >
                <div className="flex items-center gap-3">
                    {icon}
                    <span className="font-bold text-[0.95rem] text-[var(--color-text-dark)]">{title}</span>
                </div>
                <motion.div
                    animate={{ rotate: isOpen ? 90 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="text-[var(--color-sage)] ml-2 shrink-0"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="9 18 15 12 9 6" />
                    </svg>
                </motion.div>
            </button>

            {/* Grid animation trick for smooth expanding/collapsing */}
            <div
                className="grid transition-[grid-template-rows] duration-300 ease-out"
                style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
            >
                <div className="overflow-hidden bg-[var(--color-surface)]">
                    <div className="p-4 text-[0.85rem] text-[var(--color-text-mid)] leading-relaxed">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
