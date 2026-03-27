import { getAllPosts } from "@/lib/mdx";
import Link from "next/link";

export const metadata = {
    title: "Blog & News | 不妊予防・ライフプラン",
    description: "生殖医療専門医 佐藤琢磨によるブログ・最新情報",
};

export default async function BlogIndex() {
    const posts = await getAllPosts('jp');

    return (
        <div className="min-h-screen bg-[var(--color-surface)] py-20 md:py-32 px-6">
            <div className="max-w-[800px] mx-auto">

                {/* 1. シンメトリーで威厳のあるヘッダー */}
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

                {/* 記事リスト */}
                <div className="grid gap-8 md:gap-10">
                    {posts.map((post) => (
                        <Link href={`/blog/${post.slug}`} key={post.slug} className="block group">
                            {/* 4. マイクロインタラクションを仕込んだカード */}
                            <article className="bg-white rounded-[24px] p-8 md:p-10 shadow-sm border border-black/5 hover:shadow-[0_8px_30px_rgba(107,143,113,0.12)] hover:border-[var(--color-sage-pale)] transition-all duration-500 transform group-hover:-translate-y-1 relative overflow-hidden">

                                {/* 左端の「しおり」アクセントライン */}
                                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[var(--color-sage)] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                {/* 2. ジャーナル風の2カラムレイアウト */}
                                <div className="flex flex-col md:flex-row md:items-start gap-3 md:gap-8">

                                    {/* 左側：メタ情報（日付） */}
                                    <div className="shrink-0 pt-1 md:w-[120px]">
                                        <time className="text-[0.8rem] md:text-[0.85rem] text-[var(--color-text-muted)] font-en tracking-widest uppercase block">
                                            {post.frontmatter.date}
                                        </time>
                                    </div>

                                    {/* 右側：コンテンツ */}
                                    <div className="flex-1">
                                        {/* 3. タイトルの約物詰め */}
                                        <h2
                                            className="text-[1.3rem] md:text-[1.5rem] font-bold text-[var(--color-text-dark)] group-hover:text-[var(--color-sage)] transition-colors duration-300 mb-4 leading-[1.4]"
                                            style={{ fontFeatureSettings: '"palt"' }}
                                        >
                                            {post.frontmatter.title}
                                        </h2>

                                        {/* 3. 抜粋の箱組み（text-justify削除）と字送り */}
                                        <p className="text-[0.95rem] text-[var(--color-text-mid)] leading-[1.8] tracking-[0.02em] line-clamp-2 mb-6 text-left">
                                            {post.frontmatter.excerpt}
                                        </p>

                                        <div className="text-[0.85rem] text-[var(--color-sage)] font-bold flex items-center tracking-wider">
                                            続きを読む <span className="ml-2 transition-transform duration-300 group-hover:translate-x-2">→</span>
                                        </div>
                                    </div>

                                </div>
                            </article>
                        </Link>
                    ))}

                    {/* 記事ゼロの状態も美しく */}
                    {posts.length === 0 && (
                        <div className="text-center py-20">
                            <p className="text-[0.95rem] text-[var(--color-text-muted)] tracking-wider">記事がまだありません。</p>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
