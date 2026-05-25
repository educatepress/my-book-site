"use client";

import { useEffect, useState } from "react";

interface TocItem {
    id: string;
    text: string;
    level: number;
}

export default function TableOfContents({ lang = "jp" }: { lang?: "jp" | "en" }) {
    const [headings, setHeadings] = useState<TocItem[]>([]);
    const [activeId, setActiveId] = useState<string>("");

    useEffect(() => {
        const article = document.querySelector("article");
        if (!article) return;

        const elements = article.querySelectorAll("h2, h3");
        const items: TocItem[] = [];

        elements.forEach((el, i) => {
            if (!el.id) {
                el.id = `heading-${i}`;
            }
            items.push({
                id: el.id,
                text: el.textContent || "",
                level: el.tagName === "H2" ? 2 : 3,
            });
        });

        setHeadings(items);

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveId(entry.target.id);
                    }
                });
            },
            { rootMargin: "-80px 0px -70% 0px" }
        );

        elements.forEach((el) => observer.observe(el));
        return () => observer.disconnect();
    }, []);

    if (headings.length < 3) return null;

    return (
        <nav className="my-8 p-5 sm:p-6 bg-[var(--color-surface)] rounded-2xl border border-black/5">
            <p className="text-[0.75rem] font-bold text-[var(--color-sage)] tracking-[0.15em] uppercase mb-3">
                {lang === "jp" ? "目次" : "Table of Contents"}
            </p>
            <ol className="space-y-1.5 list-none m-0 p-0">
                {headings.map((h) => (
                    <li key={h.id} className={h.level === 3 ? "ml-4" : ""}>
                        <a
                            href={`#${h.id}`}
                            onClick={(e) => {
                                e.preventDefault();
                                document.getElementById(h.id)?.scrollIntoView({ behavior: "smooth" });
                            }}
                            className={`block text-[0.85rem] leading-[1.6] py-0.5 transition-colors duration-200 no-underline hover:text-[var(--color-sage)] ${
                                activeId === h.id
                                    ? "text-[var(--color-sage)] font-bold"
                                    : "text-[var(--color-text-muted)]"
                            }`}
                        >
                            {h.text}
                        </a>
                    </li>
                ))}
            </ol>
        </nav>
    );
}
