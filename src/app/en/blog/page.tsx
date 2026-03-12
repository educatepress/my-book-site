import { getAllPosts } from "@/lib/mdx";
import Link from "next/link";

export const metadata = {
    title: "Blog & News | Fertility & Life Planning",
    description: "Insights and news from Fertility Specialist, Dr. Takuma Sato",
};

export default function BlogIndexEn() {
    const posts = getAllPosts('en');

    return (
        <div className="min-h-screen bg-[var(--color-surface)] py-20 md:py-32 px-6 font-en">
            <div className="max-w-[800px] mx-auto">

                {/* 1. Sync header with symmetry */}
                <header className="mb-16 md:mb-24 text-center flex flex-col items-center">
                    <Link href="/en" className="text-[var(--color-sage)] text-[0.85rem] font-bold hover:underline mb-8 inline-flex items-center tracking-widest transition-opacity hover:opacity-70">
                        <span className="mr-2">←</span> Back to Home
                    </Link>

                    <span className="text-[0.7rem] font-bold text-[var(--color-sage)] tracking-[0.2em] uppercase mb-4 border border-[var(--color-sage-light)] rounded-full px-4 py-1">
                        Official Blog
                    </span>

                    <h1
                        className="font-['Zen_Kaku_Gothic_New'] text-[2rem] md:text-[2.8rem] font-black text-[var(--color-text-dark)] leading-tight mb-5"
                    >
                        Blog & News
                    </h1>

                    <p className="text-[0.95rem] text-[var(--color-text-mid)] leading-[1.8] max-w-[500px]">
                        Latest insights on reproductive medicine and stories behind the book.
                    </p>
                </header>

                {/* 2. Journal layout */}
                <div className="grid gap-8 md:gap-10">
                    {posts.map((post) => (
                        <Link href={`/en/blog/${post.slug}`} key={post.slug} className="block group">
                            <article className="bg-white rounded-[24px] p-8 md:p-10 shadow-sm border border-black/5 hover:shadow-[0_8px_30px_rgba(107,143,113,0.12)] hover:border-[var(--color-sage-pale)] transition-all duration-500 transform group-hover:-translate-y-1 relative overflow-hidden">

                                {/* 4. Micro-interaction bookmark line */}
                                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[var(--color-sage)] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                <div className="flex flex-col md:flex-row md:items-start gap-3 md:gap-8">

                                    <div className="shrink-0 pt-1 md:w-[120px]">
                                        <time className="text-[0.8rem] md:text-[0.85rem] text-[var(--color-text-muted)] font-en tracking-widest uppercase block">
                                            {post.frontmatter.date}
                                        </time>
                                    </div>

                                    <div className="flex-1">
                                        <h2
                                            className="text-[1.3rem] md:text-[1.5rem] font-bold text-[var(--color-text-dark)] group-hover:text-[var(--color-sage)] transition-colors duration-300 mb-4 leading-[1.4]"
                                        >
                                            {post.frontmatter.title}
                                        </h2>

                                        <p className="text-[0.95rem] text-[var(--color-text-mid)] leading-[1.8] tracking-[0.02em] line-clamp-2 text-justify mb-6">
                                            {post.frontmatter.excerpt}
                                        </p>

                                        <div className="text-[0.85rem] text-[var(--color-sage)] font-bold flex items-center tracking-wider">
                                            Read More <span className="ml-2 transition-transform duration-300 group-hover:translate-x-2">→</span>
                                        </div>
                                    </div>

                                </div>
                            </article>
                        </Link>
                    ))}

                    {posts.length === 0 && (
                        <div className="text-center py-20">
                            <p className="text-[0.95rem] text-[var(--color-text-muted)] tracking-wider">No articles available yet.</p>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
