import { getAllPosts } from "@/lib/mdx";
import Link from "next/link";
import BlogListClient from "@/components/blog/blog-list-client";

// ★一覧だけは1時間ごとに再生成する(ISR)。
//   理由: getAllPosts() が「日付が今日以前の記事」だけを出す自動公開の仕組みを持っており、
//   完全な静的化だとデプロイまで日付の切り替わりに気づけない。
//   記事ページ本体は revalidate を付けない(内容が変わるのはデプロイ時だけなので、
//   181本を毎時再生成させると逆に Active CPU を使う)。
export const revalidate = 3600;


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
