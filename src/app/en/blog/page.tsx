import { getAllPosts } from "@/lib/mdx";
import Link from "next/link";

export const metadata = {
    title: "Blog & News | Fertility & Life Planning",
    description: "Insights and news from Fertility Specialist, Dr. Takuma Sato",
};

export default function BlogIndexEn() {
    const posts = getAllPosts('en');

    return (
        <div className="min-h-screen bg-[var(--color-surface)] py-20 px-6 font-en">
            <div className="max-w-[800px] mx-auto pt-10">

                <header className="mb-12">
                    <Link href="/en" className="text-[var(--color-sage)] text-sm font-bold hover:underline mb-4 inline-block">
                        ← Back to Home
                    </Link>
                    <h1 className="font-['Zen_Kaku_Gothic_New'] text-3xl md:text-4xl font-black text-[var(--color-text-dark)]">
                        Blog & News
                    </h1>
                    <p className="mt-4 text-[var(--color-text-mid)]">Latest insights on reproductive medicine and stories behind the book.</p>
                </header>

                <div className="grid gap-6">
                    {posts.map((post) => (
                        <Link href={`/en/blog/${post.slug}`} key={post.slug} className="block group">
                            <article className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-black/5 group-hover:shadow-md group-hover:border-[var(--color-sage-pale)] transition-all">
                                <div className="text-sm text-[var(--color-text-muted)] font-en mb-2">
                                    {post.frontmatter.date}
                                </div>
                                <h2 className="text-xl font-bold text-[var(--color-text-dark)] group-hover:text-[var(--color-sage)] transition-colors mb-3">
                                    {post.frontmatter.title}
                                </h2>
                                <p className="text-[0.95rem] text-[var(--color-text-mid)] line-clamp-2">
                                    {post.frontmatter.excerpt}
                                </p>
                                <div className="mt-4 text-[0.85rem] text-[var(--color-sage)] font-bold flex items-center">
                                    Read More <span className="ml-1 transition-transform group-hover:translate-x-1">→</span>
                                </div>
                            </article>
                        </Link>
                    ))}
                    {posts.length === 0 && (
                        <p className="text-[var(--color-text-muted)]">No articles available yet.</p>
                    )}
                </div>

            </div>
        </div>
    );
}
