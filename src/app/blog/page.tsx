import { getAllPosts } from "@/lib/mdx";
import Link from "next/link";
import BlogListClient from "@/components/blog/blog-list-client";

export const metadata = {
    title: "Blog & News | 不妊予防・ライフプラン",
    description: "生殖医療専門医 佐藤琢磨によるブログ・最新情報",
};

export default async function BlogIndex() {
    const posts = await getAllPosts('jp');

    return (
        <div className="min-h-screen bg-[var(--color-surface)] py-12 md:py-32 px-4 sm:px-6">
            <div className="max-w-[800px] mx-auto">

                <header className="mb-16 md:mb-24 text-center flex flex-col items-center">
                    <Link href="/" className="text-[var(--color-sage)] text-[0.85rem] font-bold hover:underline mb-8 inline-flex items-center tracking-widest transition-opacity hover:opacity-70">
                        <span className="mr-2">←</span> LPトップへ戻る
                    </Link>

                    <span className="text-[0.7rem] font-bold text-[var(--color-sage)] tracking-[0.2em] uppercase mb-4 border border-[var(--color-sage-light)] rounded-full px-4 py-1">
                        Official Blog
                    </span>

                    <h1
                        className="font-['Zen_Kaku_Gothic_New'] text-[2rem] md:text-[2.8rem] font-black text-[var(--color-text-dark)] leading-tight mb-5"
                        style={{ fontFeatureSettings: '"palt"' }}
                    >
                        Blog & News
                    </h1>

                    <p className="text-[0.95rem] text-[var(--color-text-mid)] leading-[1.8] max-w-[500px]">
                        生殖医療に関する最新情報や、書籍の裏話などをお届けします。
                    </p>
                </header>

                <BlogListClient initialPosts={posts} lang="jp" />

            </div>
        </div>
    );
}
