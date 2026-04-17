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

// SEO Tags generating
export async function generateMetadata({ params }: PostProps): Promise<Metadata> {
    const { slug } = await params;
    const post = await getPostBySlug(slug, 'jp');
    if (!post) {
        return {};
    }
    return {
        title: `${post.frontmatter.title} | Blog`,
        description: post.frontmatter.excerpt,
        alternates: {
            canonical: `/blog/${slug}`,
        },
        openGraph: {
            title: post.frontmatter.title,
            description: post.frontmatter.excerpt,
            url: `/blog/${slug}`,
            type: 'article',
            publishedTime: post.frontmatter.date as string,
        }
    };
}

// Generate static params for SSG
export async function generateStaticParams() {
    const slugs = await getPostSlugs('jp');
    return slugs.map((slug) => ({
        slug: slug.replace(/\.mdx$/, ''),
    }));
}

export default async function BlogPost({ params }: PostProps) {
    const { slug } = await params;
    const post = await getPostBySlug(slug, 'jp');

    if (!post) {
        notFound();
    }

    const breadcrumbLd = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'ホーム', item: 'https://ttcguide.co' },
            { '@type': 'ListItem', position: 2, name: 'ブログ', item: 'https://ttcguide.co/blog' },
            { '@type': 'ListItem', position: 3, name: post.frontmatter.title },
        ],
    };

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: post.frontmatter.title,
        description: post.frontmatter.excerpt,
        datePublished: post.frontmatter.date,
        author: {
            '@type': 'Person',
            name: post.frontmatter.author || 'Takuma Sato, MD',
            url: 'https://ttcguide.co',
            jobTitle: 'Reproductive Medicine Specialist'
        },
        publisher: {
            '@type': 'MedicalOrganization',
            name: 'Dr. Takuma Sato',
            logo: {
                '@type': 'ImageObject',
                url: 'https://ttcguide.co/og-image.jpg'
            }
        }
    };

    return (
        /* 
           【修正点1】
           - px-6 を px-0 に (スマホでは端まで使う)
           - sm:px-6 以上で余白を復活させる
           - py-10 にしてスマホでの上下余白を適正化
        */
        <div className="min-h-screen bg-[var(--color-cream)] py-10 md:py-24 px-0 sm:px-6">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            {/* 
               【修正点2】
               - rounded-none (スマホでは角を丸めず横幅いっぱい) 
               - sm:rounded-[32px] (タブレット以上でデザイン復活)
               - border-x-0 (スマホでは左右の線を消して広く見せる)
            */}
            <article className="max-w-[760px] mx-auto bg-white rounded-none sm:rounded-[32px] p-5 sm:p-8 md:p-14 shadow-sm border-y sm:border border-black/5">

                <nav className="mb-8 px-2 sm:px-0">
                    <Link href="/blog" className="text-[var(--color-sage)] text-sm font-bold hover:underline inline-flex items-center tracking-wider py-2">
                        <span className="mr-2">←</span> 記事一覧へ戻る
                    </Link>
                </nav>

                <header className="mb-12 pb-10 border-b border-black/5">
                    <h1
                        className="font-['Zen_Kaku_Gothic_New'] text-[1.6rem] md:text-[2.2rem] font-black text-[var(--color-text-dark)] leading-[1.4] mb-6"
                        style={{ fontFeatureSettings: '"palt"' }}
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

                {/* 
                   【修正点3 & 4】
                   - prose-sm を基本にし、sm:prose-base でタブレット以上に対応
                   - prose-ulの左余白をスマホ用に最適化 (pl-4 sm:pl-8)
                   - 見出しサイズもスマホでは一段階小さく
                */}
                <div className="prose prose-sm sm:prose-base prose-sage max-w-none text-left
                        prose-headings:font-['Zen_Kaku_Gothic_New'] prose-headings:font-bold prose-headings:text-[var(--color-text-dark)]
                        prose-h2:text-[1.3rem] sm:prose-h2:text-[1.5rem] prose-h2:mt-10 sm:prose-h2:mt-12 prose-h2:mb-5 sm:prose-h2:mb-6 prose-h2:border-b prose-h2:border-black/5 prose-h2:pb-4
                        prose-h3:text-[1.15rem] sm:prose-h3:text-[1.25rem] prose-h3:mt-6 sm:prose-h3:mt-8 prose-h3:mb-3 sm:prose-h3:mb-4
                        prose-p:text-[var(--color-text-mid)] prose-p:leading-[1.8] prose-p:tracking-[0.02em] prose-p:mb-6 sm:prose-p:mb-8
                        prose-a:text-[var(--color-sage)] prose-a:no-underline hover:prose-a:underline
                        prose-strong:text-[var(--color-text-dark)] prose-strong:font-bold
                        prose-ul:my-6 prose-ul:pl-4 sm:prose-ul:pl-8 prose-li:text-[var(--color-text-mid)] prose-li:leading-[1.8] prose-li:tracking-[0.02em]
                        prose-blockquote:not-italic prose-blockquote:border-l-4 prose-blockquote:border-[var(--color-sage)] prose-blockquote:bg-[var(--color-surface)] prose-blockquote:py-2 prose-blockquote:px-6 prose-blockquote:rounded-r-lg prose-blockquote:text-[0.95rem] prose-blockquote:text-[var(--color-text-mid)]
                        prose-img:rounded-2xl prose-img:shadow-sm
                ">
                    <MDXRemote 
                        source={post.content} 
                        components={{
                            table: (props) => (
                                <div className="overflow-x-auto my-8">
                                    <table className="w-full text-left" {...props} />
                                </div>
                            ),
                        }} 
                    />
                </div>

                <footer className="mt-16 pt-12 border-t border-black/5">
                    <div className="bg-[#F4EFEA] rounded-[24px] p-6 md:p-8 flex flex-col sm:flex-row items-center sm:items-start gap-5 md:gap-6 w-full mt-12 border border-black/5 shadow-sm">
                        {/* 左：顔写真（絶対配置を廃止し、Flex内に素直に置く） */}
                        <div className="shrink-0">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img 
                                src="/author-blue.JPG" 
                                alt="佐藤 琢磨" 
                                className="w-[80px] h-[80px] md:w-[96px] md:h-[96px] rounded-full object-cover object-[center_top] border-[3px] border-white shadow-sm"
                            />
                        </div>

                        {/* 右：テキストとボタン */}
                        <div className="flex-1 flex flex-col items-center sm:items-start text-center sm:text-left w-full">
                            <p className="text-[0.7rem] font-bold text-[var(--color-sage)] tracking-widest mb-1">
                                この記事を書いた人
                            </p>
                            <div className="flex items-center gap-2 mb-3">
                                <h4 className="text-[1.15rem] font-bold text-[var(--color-text-dark)] leading-none">
                                    佐藤 琢磨
                                </h4>
                                <span className="text-[0.75rem] text-[var(--color-text-muted)] mt-0.5">
                                    生殖医療専門医
                                </span>
                            </div>
                            
                            <p className="text-[0.85rem] text-[var(--color-text-mid)] leading-[1.7] mb-5">
                                将来の妊娠・ライフプランに向けた正しい医学知識をわかりやすく発信しています。
                            </p>

                            <a
                                href="https://amazon.co.jp/dp/B0F7XTWJ3X?tag=ttcguide-blog-22"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center bg-[var(--color-sage)] hover:bg-[#5a7a5f] text-white text-[0.85rem] font-bold px-6 py-3 rounded-full transition-colors shadow-sm w-full sm:w-auto"
                            >
                                Amazonで書籍を見る →
                            </a>
                        </div>
                    </div>
                </footer>

            </article>
        </div>
    );
}
