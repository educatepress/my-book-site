import { getPostBySlug, getPostSlugs } from "@/lib/mdx";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import Link from "next/link";
import { Metadata } from "next";

// 🚨 追加：MDX内で呼び出される「中間CTA」のカスタムコンポーネント（デザイン化されたバナー）
const mdxComponents = {
    MiddleCta: () => (
        <div className="not-prose my-12 bg-gradient-to-br from-[var(--color-sage-pale)] to-[var(--color-surface)] rounded-[24px] border border-[var(--color-sage)]/20 shadow-sm relative overflow-hidden group">
            <div className="p-6 md:p-8 relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-6 md:gap-8">
                <div className="shrink-0 w-[120px] md:w-[140px]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/mockup-jp.png" alt="『20代で考える 将来妊娠で困らないための選択』" className="w-full h-auto drop-shadow-lg group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="flex-1 text-center sm:text-left flex flex-col justify-center h-full pt-1">
                    <p className="text-[0.75rem] font-bold text-[var(--color-sage)] tracking-widest mb-2 uppercase">
                        📖 専門医が教える、後悔しないための知識
                    </p>
                    <h4 className="text-[1.15rem] md:text-[1.3rem] font-bold text-[var(--color-text-dark)] mb-3 leading-snug font-['Zen_Kaku_Gothic_New']" style={{ fontFeatureSettings: '"palt"' }}>
                        「いつか」のために、<br className="hidden sm:block" />今から知っておくべき24の事実
                    </h4>
                    <p className="text-[0.85rem] md:text-[0.9rem] text-[var(--color-text-mid)] mb-5 leading-[1.7]">
                        この記事の内容をはじめ、将来の妊娠に向けた正しい医学的知識を体系的に一冊にまとめました。スマホでサクッと読めるKindle版も好評発売中です。
                    </p>
                    <a 
                        href="https://amzn.to/3NcOWBl" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center bg-[var(--color-sage)] hover:bg-[#5a7a5f] text-white text-[0.85rem] font-bold px-6 py-3.5 rounded-full transition-colors shadow-sm w-full sm:w-auto"
                    >
                        Amazonで詳しく見る →
                    </a>
                </div>
            </div>
        </div>
    )
};

interface PostProps {
    params: Promise<{
        slug: string;
    }>;
}

// SEO Tags generating
export async function generateMetadata({ params }: PostProps): Promise<Metadata> {
    const { slug } = await params;
    const post = getPostBySlug(slug, 'jp');
    if (!post) {
        return {};
    }
    return {
        title: `${post.frontmatter.title} | さとうドクターのBlog`,
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
    const slugs = getPostSlugs('jp');
    return slugs.map((slug) => ({
        slug: slug.replace(/\.mdx$/, ''),
    }));
}

// 🚨 追加：記事の文字数から読了目安時間を自動計算（日本語は1分間に約500文字読めると仮定）
function calculateReadingTime(text: string): number {
    const plainText = text.replace(/<\/?[^>]+(>|$)/g, "").replace(/[#*`_>\[\]()]/g, "");
    return Math.max(1, Math.ceil(plainText.length / 500));
}

export default async function BlogPost({ params }: PostProps) {
    const { slug } = await params;
    const post = getPostBySlug(slug, 'jp');

    if (!post) {
        notFound();
    }

    const readingTime = calculateReadingTime(post.content);

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: post.frontmatter.title,
        description: post.frontmatter.excerpt,
        datePublished: post.frontmatter.date,
        author: {
            '@type': 'Person',
            name: post.frontmatter.author || 'Takuma Sato, MD',
            url: 'https://doctors-guide-womens-health.vercel.app',
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
        <div className="min-h-screen bg-[var(--color-cream)] py-16 md:py-24 px-6 relative overflow-x-clip">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            <article className="max-w-[760px] mx-auto bg-white rounded-[32px] p-6 md:p-14 shadow-sm border border-black/5 relative z-10">

                <nav className="mb-8 md:mb-10">
                    <Link href="/blog" className="text-[var(--color-sage)] text-sm font-bold hover:underline inline-flex items-center tracking-wider bg-[var(--color-sage-pale)] px-4 py-2 rounded-full transition-colors">
                        <span className="mr-2">←</span> 記事一覧へ戻る
                    </Link>
                </nav>

                <header className="mb-10 md:mb-12 pb-8 md:pb-10 border-b border-black/5">
                    {/* AEO対策：冒頭で権威性を示すバッジ */}
                    <div className="inline-flex items-center gap-2 mb-4">
                        <span className="bg-[var(--color-sage)] text-white text-[0.7rem] font-bold px-3 py-1.5 rounded-full tracking-widest shadow-sm">
                            生殖医療専門医が解説
                        </span>
                    </div>

                    <h1
                        className="font-['Zen_Kaku_Gothic_New'] text-[1.5rem] md:text-[2.2rem] font-black text-[var(--color-text-dark)] leading-[1.4] mb-6"
                        style={{ fontFeatureSettings: '"palt"' }}
                    >
                        {post.frontmatter.title}
                    </h1>
                    
                    <div className="flex flex-wrap items-center gap-3 text-[0.85rem] text-[var(--color-text-muted)] font-en tracking-wider">
                        {/* 🚨 追加：読了目安時間の表示（タイパの保証） */}
                        <div className="flex items-center gap-1.5 bg-[var(--color-surface)] text-[var(--color-text-dark)] px-3 py-1.5 rounded-full font-bold border border-black/5 shadow-sm">
                            <span>⏱️</span>
                            <span>約 {readingTime} 分で読めます</span>
                        </div>

                        <div className="flex items-center gap-3 ml-1">
                            <time dateTime={post.frontmatter.date as string}>{post.frontmatter.date}</time>
                            {post.frontmatter.author && (
                                <>
                                    <span className="w-1 h-1 rounded-full bg-[var(--color-text-muted)] opacity-50 hidden sm:block" />
                                    <span className="uppercase hidden sm:block font-medium">{post.frontmatter.author}</span>
                                </>
                            )}
                        </div>
                    </div>
                </header>

                <div className="prose prose-sage max-w-none text-left md:text-justify
                        prose-headings:font-['Zen_Kaku_Gothic_New'] prose-headings:font-bold prose-headings:text-[var(--color-text-dark)]
                        prose-h2:text-[1.4rem] md:prose-h2:text-[1.6rem] prose-h2:mt-12 prose-h2:mb-6 prose-h2:border-b-2 prose-h2:border-[var(--color-sage-pale)] prose-h2:pb-3
                        prose-h3:text-[1.15rem] md:prose-h3:text-[1.25rem] prose-h3:mt-8 prose-h3:mb-4 prose-h3:pl-4 prose-h3:border-l-4 prose-h3:border-[var(--color-sage)]
                        prose-p:text-[0.95rem] md:prose-p:text-[1rem] prose-p:text-[var(--color-text-mid)] prose-p:leading-[1.9] prose-p:tracking-[0.02em] prose-p:mb-8
                        prose-a:text-[var(--color-sage)] prose-a:font-bold prose-a:underline hover:prose-a:opacity-80
                        prose-strong:text-[var(--color-text-dark)] prose-strong:font-bold prose-strong:bg-[linear-gradient(transparent_60%,var(--color-gold-pale)_60%)]
                        
                        /* 💡 修正：Smart Brevityの箇条書き（Why it matters）を見やすく装飾 */
                        prose-ul:my-8 prose-ul:bg-white prose-ul:p-6 md:prose-ul:p-8 prose-ul:rounded-2xl prose-ul:border prose-ul:border-black/5 prose-ul:shadow-sm
                        prose-li:text-[0.95rem] md:prose-li:text-[1rem] prose-li:text-[var(--color-text-dark)] prose-li:leading-[1.8] prose-li:tracking-[0.02em] prose-li:font-medium prose-li:marker:text-[var(--color-sage)]
                        
                        prose-blockquote:not-italic prose-blockquote:border-l-4 prose-blockquote:border-[var(--color-sage)] prose-blockquote:bg-[var(--color-surface)] prose-blockquote:py-3 prose-blockquote:px-6 prose-blockquote:rounded-r-xl prose-blockquote:text-[0.95rem] prose-blockquote:text-[var(--color-text-mid)]
                        prose-img:rounded-2xl prose-img:shadow-sm
                ">
                    {/* 🚨 修正：MDX内で <MiddleCta /> をレンダリングできるように components を渡す */}
                    <MDXRemote source={post.content} components={mdxComponents} />
                </div>

                <footer className="mt-16 pt-12 border-t border-black/5">
                    {/* 👇 先ほど修正した「絶対に崩れないプロフィールカード」 */}
                    <div className="bg-[#F4EFEA] rounded-[24px] p-6 md:p-8 flex flex-col sm:flex-row items-center sm:items-start gap-5 md:gap-6 w-full mt-8 border border-black/5 shadow-sm">
                        <div className="shrink-0">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img 
                                src="/author-blue.JPG" 
                                alt="佐藤 琢磨" 
                                className="w-[80px] h-[80px] md:w-[96px] md:h-[96px] rounded-full object-cover object-[center_top] border-[3px] border-white shadow-sm"
                            />
                        </div>
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
                                href="https://doctors-guide-womens-health.vercel.app/" 
                                className="inline-flex items-center justify-center bg-[var(--color-sage)] hover:bg-[#5a7a5f] text-white text-[0.85rem] font-bold px-6 py-3 rounded-full transition-colors shadow-sm w-full sm:w-auto"
                            >
                                著書を詳しく見る →
                            </a>
                        </div>
                    </div>
                </footer>

            </article>
        </div>
    );
}

