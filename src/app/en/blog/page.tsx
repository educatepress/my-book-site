import { getAllPosts } from "@/lib/mdx";
import Link from "next/link";

export const metadata = {
    title: "Blog & News | Fertility & Life Planning",
    description: "Latest medical insights and news from Dr. Takuma Sato, Reproductive Medicine Specialist.",
};

export default async function BlogIndexEn() {
    const posts = await getAllPosts('en');

    return (
        <div className="min-h-screen bg-[var(--color-surface)] py-12 md:py-32 px-4 sm:px-6 font-en">
            <div className="max-w-[800px] mx-auto">

                {/* 1. 威厳と静寂を感じさせるシンメトリーなヘッダー */}
                <header className="mb-16 md:mb-24 text-center flex flex-col items-center">
                    <Link href="/en" className="text-[var(--color-sage)] text-[0.75rem] font-bold hover:underline mb-8 inline-flex items-center tracking-[0.2em] uppercase transition-opacity hover:opacity-70">
                        <span className="mr-2">←</span> Back to Book Details
                    </Link>

                    {/* ラベル: 究極のトラッキングと大文字 */}
                    <span className="text-[0.7rem] font-bold text-[var(--color-sage)] tracking-[0.25em] uppercase mb-5 border border-[var(--color-sage-light)] rounded-full px-5 py-1.5">
                        Official Journal
                    </span>

                    {/* タイトル: 逆にトラッキングを詰めて塊の力強さを出す */}
                    <h1 className="font-['Zen_Kaku_Gothic_New'] text-[2.2rem] md:text-[3.2rem] font-black text-[var(--color-text-dark)] leading-[1.1] mb-6 tracking-tight">
                        Medical Insights & News
                    </h1>

                    {/* リード文: 行間をrelaxedにし、読みやすく */}
                    <p className="text-[1.05rem] text-[var(--color-text-mid)] leading-relaxed max-w-[550px]">
                        Expert knowledge on fertility, preconception care, and life planning shared by Dr. Takuma Sato.
                    </p>
                </header>

                {/* 記事リスト（Journal / Timeline Layout） */}
                <div className="grid gap-8 md:gap-10">
                    {posts.map((post) => (
                        <Link href={`/en/blog/${post.slug}`} key={post.slug} className="block group">
                            {/* ホバー時の「しおり（Bookmark）」インタラクションを仕込んだカード */}
                            <article className="bg-white rounded-[20px] sm:rounded-[24px] p-5 sm:p-8 md:p-10 shadow-sm border border-black/5 hover:shadow-[0_8px_30px_rgba(107,143,113,0.12)] hover:border-[var(--color-sage-pale)] transition-all duration-500 transform group-hover:-translate-y-1 relative overflow-hidden">

                                {/* 左端のアクセントライン（スピン） */}
                                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[var(--color-sage)] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                <div className="flex flex-col md:flex-row md:items-start gap-3 md:gap-8">

                                    {/* 左側：メタ情報（日付） - 極端なトラッキングで権威づけ */}
                                    <div className="shrink-0 pt-1.5 md:w-[130px]">
                                        <time className="text-[0.8rem] text-[var(--color-text-muted)] font-bold tracking-[0.2em] uppercase block">
                                            {post.frontmatter.date}
                                        </time>
                                    </div>

                                    {/* 右側：コンテンツ */}
                                    <div className="flex-1">
                                        {/* 英語タイトル：tracking-tight と leading-snug の組み合わせが至高 */}
                                        <h2 className="font-['Zen_Kaku_Gothic_New'] text-[1.15rem] sm:text-[1.4rem] md:text-[1.65rem] font-black text-[var(--color-text-dark)] group-hover:text-[var(--color-sage)] transition-colors duration-300 mb-3 leading-snug tracking-tight">
                                            {post.frontmatter.title}
                                        </h2>

                                        {/* 3. Excerpt */}
                                        <p className="text-[0.95rem] text-[var(--color-text-mid)] leading-[1.8] tracking-[0.02em] line-clamp-2 text-left mb-6">
                                            {post.frontmatter.excerpt}
                                        </p>

                                        {/* CTA: トラッキングを広げた大文字 */}
                                        <div className="text-[0.75rem] text-[var(--color-sage)] font-bold flex items-center tracking-[0.2em] uppercase">
                                            Read Article <span className="ml-2 transition-transform duration-300 group-hover:translate-x-2">→</span>
                                        </div>
                                    </div>

                                </div>
                            </article>
                        </Link>
                    ))}

                    {/* 記事ゼロの Empty State も洗練させる */}
                    {posts.length === 0 && (
                        <div className="text-center py-20 border border-dashed border-black/10 rounded-[24px]">
                            <p className="text-[1rem] text-[var(--color-text-muted)] tracking-wide">No articles published yet. Please check back later.</p>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
