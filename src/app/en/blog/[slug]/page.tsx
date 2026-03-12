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
        alternates: {
            canonical: `/en/blog/${slug}`,
        },
        openGraph: {
            title: post.frontmatter.title,
            description: post.frontmatter.excerpt,
            url: `/en/blog/${slug}`,
            type: 'article',
            publishedTime: post.frontmatter.date as string,
        }
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

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: post.frontmatter.title,
        description: post.frontmatter.excerpt,
        datePublished: post.frontmatter.date,
        author: {
            '@type': 'Person',
            name: post.frontmatter.author || 'Takuma Sato, MD, PhD',
            url: 'https://doctors-guide-womens-health.vercel.app/en',
            jobTitle: 'Reproductive Medicine Specialist'
        },
        publisher: {
            '@type': 'MedicalOrganization',
            name: 'Dr. Takuma Sato',
            logo: {
                '@type': 'ImageObject',
                url: 'https://doctors-guide-womens-health.vercel.app/og-image.jpg'
            }
        }
    };

    return (
        <div className="min-h-screen bg-[var(--color-cream)] py-16 md:py-24 px-6 font-en">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            <article className="max-w-[760px] mx-auto bg-white rounded-[32px] p-8 md:p-14 shadow-sm border border-black/5">

                <nav className="mb-10">
                    <Link href="/en/blog" className="text-[var(--color-sage)] text-sm font-bold hover:underline inline-flex items-center tracking-wider">
                        <span className="mr-2">←</span> Back to Articles
                    </Link>
                </nav>

                <header className="mb-12 pb-10 border-b border-black/5">
                    <h1
                        className="font-['Zen_Kaku_Gothic_New'] text-[1.6rem] md:text-[2.2rem] font-black text-[var(--color-text-dark)] leading-tight mb-6"
                    >
                        {post.frontmatter.title}
                    </h1>
                    <div className="flex items-center gap-4 text-[0.85rem] text-[var(--color-text-muted)] font-en tracking-wider">
                        <time dateTime={post.frontmatter.date as string}>{post.frontmatter.date}</time>
                        {post.frontmatter.author && (
                            <>
                                <span className="w-1 h-1 rounded-full bg-[var(--color-text-muted)] opacity-50" />
                                <span className="uppercase">{post.frontmatter.author}</span>
                            </>
                        )}
                    </div>
                </header>

                <div className="prose prose-sage max-w-none 
                        prose-headings:font-['Zen_Kaku_Gothic_New'] prose-headings:font-bold prose-headings:text-[var(--color-text-dark)]
                        prose-h2:text-[1.5rem] prose-h2:mt-12 prose-h2:mb-6 prose-h2:border-b prose-h2:border-black/5 prose-h2:pb-4
                        prose-h3:text-[1.25rem] prose-h3:mt-8 prose-h3:mb-4
                        prose-p:text-[var(--color-text-mid)] prose-p:leading-relaxed prose-p:mb-8
                        prose-a:text-[var(--color-sage)] prose-a:no-underline hover:prose-a:underline
                        prose-strong:text-[var(--color-text-dark)] prose-strong:font-bold
                        prose-ul:my-6 prose-li:text-[var(--color-text-mid)] prose-li:leading-relaxed 
                        prose-blockquote:not-italic prose-blockquote:border-l-4 prose-blockquote:border-[var(--color-sage)] prose-blockquote:bg-[var(--color-surface)] prose-blockquote:py-2 prose-blockquote:px-6 prose-blockquote:rounded-r-lg prose-blockquote:text-[0.95rem] prose-blockquote:text-[var(--color-text-mid)]
                        prose-img:rounded-2xl prose-img:shadow-sm
                ">
                    <MDXRemote source={post.content} />
                </div>

                <footer className="mt-16 pt-12 border-t border-black/5">
                    <div className="bg-[var(--color-surface-mid)] rounded-2xl p-8 flex flex-col md:flex-row items-center md:items-start gap-6">
                        <div className="shrink-0">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src="/author-blue.JPG"
                                alt="Takuma Sato"
                                className="w-[80px] h-[80px] rounded-full object-cover border-2 border-white shadow-sm"
                            />
                        </div>
                        <div className="flex-1 text-center md:text-left">
                            <p className="text-[0.75rem] font-bold text-[var(--color-sage)] tracking-widest uppercase mb-1">About the Author</p>
                            <h3 className="font-['Zen_Kaku_Gothic_New'] text-[1.2rem] font-bold text-[var(--color-text-dark)] mb-2" style={{ fontFeatureSettings: '"palt"' }}>Takuma Sato <span className="text-[0.8rem] font-normal text-[var(--color-text-muted)] ml-2">MD, PhD</span></h3>
                            <p className="text-[0.85rem] text-[var(--color-text-mid)] leading-relaxed mb-4">
                                Reproductive Medicine Specialist sharing accessible medical knowledge for your future pregnancy and life plan.
                            </p>
                            <Link href="/en" className="inline-block text-[0.85rem] font-bold text-white bg-[var(--color-sage)] hover:bg-[var(--color-sage-dark)] transition-colors px-6 py-2.5 rounded-full">
                                View Author's Book →
                            </Link>
                        </div>
                    </div>
                </footer>

            </article>
        </div>
    );
}
