import { getAllPosts } from "@/lib/mdx";
import Link from "next/link";
import BlogListClient from "@/components/blog/blog-list-client";
import type { Metadata } from "next";

// ★一覧だけは1時間ごとに再生成する(ISR)。
//   理由: getAllPosts() が「日付が今日以前の記事」だけを出す自動公開の仕組みを持っており、
//   完全な静的化だとデプロイまで日付の切り替わりに気づけない。
//   記事ページ本体は revalidate を付けない(内容が変わるのはデプロイ時だけなので、
//   181本を毎時再生成させると逆に Active CPU を使う)。
export const revalidate = 3600;


export const metadata: Metadata = {
    title: "Blog & News | Fertility & Life Planning",
    description: "Latest medical insights and news from Dr. Takuma Sato, Reproductive Medicine Specialist.",
    alternates: {
        canonical: "/en/blog",
        languages: {
            'ja': '/blog',
            'en-US': '/en/blog',
            'x-default': '/en/blog',
        },
    },
    openGraph: {
        title: "Blog & News | Fertility & Life Planning",
        description: "Latest medical insights and news from Dr. Takuma Sato.",
        url: '/en/blog',
        type: 'website',
    },
};

export default async function BlogIndexEn() {
    const posts = await getAllPosts('en');

    return (
        <div className="min-h-screen bg-[var(--color-surface)] py-12 md:py-32 px-4 sm:px-6 font-en">
            <div className="max-w-[800px] mx-auto">

                <header className="mb-16 md:mb-24 text-center flex flex-col items-center">
                    <Link href="/en" className="text-[var(--color-sage)] text-[0.75rem] font-bold hover:underline mb-8 inline-flex items-center tracking-[0.2em] uppercase transition-opacity hover:opacity-70">
                        <span className="mr-2">←</span> Back to Book Details
                    </Link>

                    <span className="text-[0.7rem] font-bold text-[var(--color-sage)] tracking-[0.25em] uppercase mb-5 border border-[var(--color-sage-light)] rounded-full px-5 py-1.5">
                        Official Journal
                    </span>

                    <h1 className="font-['Zen_Kaku_Gothic_New'] text-[2.2rem] md:text-[3.2rem] font-black text-[var(--color-text-dark)] leading-[1.1] mb-6 tracking-tight">
                        Medical Insights & News
                    </h1>

                    <p className="text-[1.05rem] text-[var(--color-text-mid)] leading-relaxed max-w-[550px]">
                        Expert knowledge on fertility, preconception care, and life planning shared by Dr. Takuma Sato.
                    </p>
                </header>

                <BlogListClient initialPosts={posts} lang="en" />

            </div>
        </div>
    );
}
