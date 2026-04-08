"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { BlogPostMetadata } from "@/lib/mdx";

interface BlogListClientProps {
    initialPosts: {
        slug: string;
        frontmatter: Partial<BlogPostMetadata>;
    }[];
    lang?: "jp" | "en";
}

// 日本語版ベースカテゴリ
const JP_CATEGORIES = [
    "すべて",
    "プレコンセプションケア",
    "女性の健康",
    "男性不妊・ケア",
    "不妊治療・生殖医療",
    "ニュース・制度・助成金"
];

// 英語版ベースカテゴリ（マッピング）
const EN_CATEGORIES = {
    "すべて": "All",
    "プレコンセプションケア": "Preconception Care",
    "女性の健康": "Women's Health",
    "男性不妊・ケア": "Men's Health",
    "不妊治療・生殖医療": "Fertility Treatments",
    "ニュース・制度・助成金": "News & Subsidies"
} as Record<string, string>;

export default function BlogListClient({ initialPosts, lang = "jp" }: BlogListClientProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("すべて");

    // カテゴリー名表示用のヘルパー
    const getCategoryDisplay = (cat: string) => {
        if (lang === "en") {
            return EN_CATEGORIES[cat] || cat;
        }
        return cat;
    };

    // 実際に記事が存在するカテゴリのみ抽出
    const usedCategories = useMemo(() => {
        const activeSet = new Set(initialPosts.map(p => p.frontmatter.category).filter(Boolean));
        return JP_CATEGORIES.filter(cat => cat === "すべて" || activeSet.has(cat));
    }, [initialPosts]);

    const filteredPosts = useMemo(() => {
        return initialPosts.filter((post) => {
            const fm = post.frontmatter;
            const matchesSearch = 
                !searchQuery || 
                (fm.title?.toLowerCase() || "").includes(searchQuery.toLowerCase()) || 
                (fm.excerpt?.toLowerCase() || "").includes(searchQuery.toLowerCase());
            
            const postCat = fm.category || "すべて"; // カテゴリなしは「すべて」に内包
            const matchesCategory = selectedCategory === "すべて" || postCat === selectedCategory;

            return matchesSearch && matchesCategory;
        });
    }, [initialPosts, searchQuery, selectedCategory]);

    return (
        <div className="w-full">
            {/* 検索＆フィルターセクション */}
            <div className="mb-12 flex flex-col gap-6">
                
                {/* 検索バー */}
                <div className="relative mx-auto w-full md:w-[600px]">
                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                        </svg>
                    </div>
                    <input
                        type="text"
                        placeholder={lang === "jp" ? "キーワードで記事を検索..." : "Search articles..."}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-6 py-3.5 bg-white border border-gray-200 rounded-full shadow-sm outline-none focus:ring-2 focus:ring-[var(--color-sage-light)] focus:border-[var(--color-sage)] transition-all min-w-[280px]"
                        style={{ display: 'block' }}
                    />
                </div>

                {/* カテゴリーピル */}
                <div className="flex flex-wrap items-center justify-center gap-2 mt-2 px-2">
                    {usedCategories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-4 py-1.5 rounded-full text-[0.85rem] font-bold tracking-wider transition-all duration-300 ${
                                selectedCategory === cat
                                    ? "bg-[var(--color-sage)] text-white shadow-md scale-105"
                                    : "bg-white text-[var(--color-text-muted)] border border-gray-100 hover:border-gray-300 hover:text-[var(--color-text-mid)]"
                            }`}
                        >
                            {getCategoryDisplay(cat)}
                        </button>
                    ))}
                </div>
            </div>

            {/* 見出し */}
            <div className="mb-6 flex justify-between items-end border-b border-gray-100 pb-2">
                <h3 className="font-bold text-[var(--color-text-dark)] tracking-wider">
                    {lang === "jp" ? "最新の記事" : "Latest Articles"}
                </h3>
                <span className="text-[0.8rem] text-[var(--color-text-muted)]">
                    {filteredPosts.length} {lang === "jp" ? "件見つかりました" : "results found"}
                </span>
            </div>

            {/* 記事リスト */}
            <div className="grid gap-8 md:gap-10">
                {filteredPosts.map((post) => (
                    <Link href={`/${lang === "en" ? "en/" : ""}blog/${post.slug}`} key={post.slug} className="block group">
                        <article className="bg-white rounded-[24px] p-8 md:p-10 shadow-sm border border-black/5 hover:shadow-[0_8px_30px_rgba(107,143,113,0.12)] hover:border-[var(--color-sage-pale)] transition-all duration-500 transform group-hover:-translate-y-1 relative overflow-hidden">

                            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[var(--color-sage)] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                            <div className="flex flex-col md:flex-row md:items-start gap-4 md:gap-8">
                                <div className="shrink-0 md:w-[130px] flex flex-row md:flex-col items-center md:items-start gap-4 md:gap-2">
                                    <time className="text-[0.8rem] md:text-[0.85rem] text-[var(--color-text-muted)] font-en tracking-widest uppercase block">
                                        {post.frontmatter.date}
                                    </time>
                                    
                                    {/* カテゴリーバッジ追加 */}
                                    {post.frontmatter.category && (
                                        <span className="inline-block px-2 py-0.5 text-[0.65rem] md:text-[0.7rem] bg-[var(--color-surface)] text-[var(--color-sage)] border border-[var(--color-sage-pale)] rounded-md tracking-wider font-bold">
                                            {getCategoryDisplay(post.frontmatter.category)}
                                        </span>
                                    )}
                                </div>

                                <div className="flex-1 mt-1 md:mt-0">
                                    <h2
                                        className="text-[1.2rem] md:text-[1.4rem] font-bold text-[var(--color-text-dark)] group-hover:text-[var(--color-sage)] transition-colors duration-300 mb-3 leading-[1.5]"
                                        style={{ fontFeatureSettings: '"palt"' }}
                                    >
                                        {post.frontmatter.title}
                                    </h2>

                                    <p className="text-[0.95rem] text-[var(--color-text-mid)] leading-[1.8] tracking-[0.02em] line-clamp-3 mb-5 text-left">
                                        {post.frontmatter.excerpt}
                                    </p>

                                    <div className="text-[0.85rem] text-[var(--color-sage)] font-bold flex items-center tracking-wider hover:opacity-80 transition-opacity">
                                        {lang === "jp" ? "続きを読む" : "Read More"} <span className="ml-2 transition-transform duration-300 group-hover:translate-x-2">→</span>
                                    </div>
                                </div>
                            </div>
                        </article>
                    </Link>
                ))}

                {filteredPosts.length === 0 && (
                    <div className="text-center py-20 bg-white rounded-[24px] border border-dashed border-gray-200">
                        <p className="text-[0.95rem] text-[var(--color-text-muted)] tracking-wider">
                            {lang === "jp" ? "該当する記事が見つかりませんでした。" : "No articles found matching your criteria."}
                        </p>
                        <button 
                            onClick={() => { setSearchQuery(""); setSelectedCategory("すべて"); }}
                            className="mt-6 text-[0.85rem] text-[var(--color-sage)] font-bold underline hover:opacity-80 transition-opacity"
                        >
                            {lang === "jp" ? "フィルターをクリアして全て見る" : "Clear filters and view all"}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
