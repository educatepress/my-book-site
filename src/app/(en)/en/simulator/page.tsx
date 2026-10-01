import SimulatorClient from "@/components/common/simulator-client";
import StickyCtaEn from "@/components/common/sticky-cta-en";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "IVF Success Rate Simulator | Dr. Takuma Sato",
    description: "Enter your age and AMH to run a Monte Carlo simulation with a 3,000-patient virtual cohort. Estimate cumulative pregnancy probability and treatment timelines for IVF.",
    alternates: {
        canonical: "/en/simulator",
        languages: {
            'ja': '/simulator',
            'en-US': '/en/simulator',
            'x-default': '/en/simulator',
        },
    },
    openGraph: {
        title: "IVF Success Rate Simulator",
        description: "Estimate cumulative pregnancy probability with a 3,000-patient Monte Carlo simulation.",
        url: '/en/simulator',
        type: 'website',
        images: [{ url: '/mock-en.png', width: 800, height: 1100 }],
    },
};

export default function SimulatorPage() {
    return (
        <main className="min-h-screen bg-[var(--color-cream)] font-en">
            <div className="py-10 md:py-24 px-4 sm:px-6">
                <SimulatorClient lang="en" />
            </div>

            {/* 関連リンク導線 */}
            <nav className="max-w-[760px] mx-auto pb-16 px-4 sm:px-6 grid sm:grid-cols-2 gap-4">
                <Link
                    href="/en"
                    className="block p-5 rounded-2xl bg-white border border-black/5 hover:shadow-md transition-shadow"
                >
                    <span className="block text-[0.7rem] text-[var(--color-text-muted)] tracking-widest uppercase font-bold mb-1">← Home</span>
                    <span className="block text-[0.95rem] text-[var(--color-text-dark)] font-bold">About the Book</span>
                </Link>
                <Link
                    href="/en/blog"
                    className="block p-5 rounded-2xl bg-white border border-black/5 hover:shadow-md transition-shadow"
                >
                    <span className="block text-[0.7rem] text-[var(--color-text-muted)] tracking-widest uppercase font-bold mb-1">Blog →</span>
                    <span className="block text-[0.95rem] text-[var(--color-text-dark)] font-bold">Latest Medical Insights</span>
                </Link>
            </nav>

            <StickyCtaEn />
        </main>
    );
}
