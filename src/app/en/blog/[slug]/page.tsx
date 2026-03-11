import { getPostBySlug, getPostSlugs } from "@/lib/mdx";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import Link from "next/link";
import { Metadata } from "next";

interface PostProps {
    params: Promise<{
        slug: string;
    }>;
}

export async function generateMetadata({ params }: PostProps): Promise<Metadata> {
    const { slug } = await params;
    const post = getPostBySlug(slug, 'en');
    if (!post) {
        return {};
    }
    return {
        title: `${post.frontmatter.title} | Blog`,
        description: post.frontmatter.excerpt,
    };
}

export async function generateStaticParams() {
    const slugs = getPostSlugs('en');
    return slugs.map((slug) => ({
        slug: slug.replace(/\.mdx$/, ''),
    }));
}

export default async function BlogPostEn({ params }: PostProps) {
    const { slug } = await params;
    const post = getPostBySlug(slug, 'en');

    if (!post) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-[var(--color-cream)] py-20 px-6 font-en">
            <div className="max-w-[700px] mx-auto bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-black/5 mt-10">

                <nav className="mb-10">
                    <Link href="/en/blog" className="text-[var(--color-sage)] text-sm font-bold hover:underline inline-flex items-center">
                        <span className="mr-1">←</span> Back to Articles
                    </Link>
                </nav>

                <header className="mb-10 pb-10 border-b border-black/5">
                    <h1 className="font-['Zen_Kaku_Gothic_New'] text-2xl md:text-4xl font-black text-[var(--color-text-dark)] leading-snug mb-4">
                        {post.frontmatter.title}
                    </h1>
                    <div className="flex items-center gap-4 text-sm text-[var(--color-text-muted)] font-en">
                        <time>{post.frontmatter.date}</time>
                        {post.frontmatter.author && (
                            <>
                                <span className="w-1 h-1 rounded-full bg-[var(--color-text-muted)] opacity-50" />
                                <span>{post.frontmatter.author}</span>
                            </>
                        )}
                    </div>
                </header>

                {/* MDX Content */}
                <div className="prose prose-sage max-w-none 
                        prose-headings:font-['Zen_Kaku_Gothic_New'] prose-headings:font-bold prose-headings:text-[var(--color-text-dark)]
                        prose-p:text-[var(--color-text-mid)] prose-p:leading-loose prose-a:text-[var(--color-sage)] prose-a:no-underline hover:prose-a:underline
                        prose-strong:text-[var(--color-text-dark)] prose-li:text-[var(--color-text-mid)] prose-li:leading-relaxed">
                    <MDXRemote source={post.content} />
                </div>

            </div>
        </div>
    );
}
