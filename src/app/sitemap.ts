import { MetadataRoute } from 'next'
import { getAllPosts } from '@/lib/mdx'

// ★一覧だけは1時間ごとに再生成する(ISR)。
//   理由: getAllPosts() が「日付が今日以前の記事」だけを出す自動公開の仕組みを持っており、
//   完全な静的化だとデプロイまで日付の切り替わりに気づけない。
//   記事ページ本体は revalidate を付けない(内容が変わるのはデプロイ時だけなので、
//   181本を毎時再生成させると逆に Active CPU を使う)。
export const revalidate = 3600;


export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://ttcguide.co';

    // Get all posts for both languages
    const jpPosts = await getAllPosts('jp');
    const enPosts = await getAllPosts('en');

    // Helper to safely parse date
    const safeDate = (dateStr: any) => {
        const d = new Date(dateStr);
        return isNaN(d.getTime()) ? new Date() : d;
    };

    // Create blog post URLs
    const jpBlogUrls = jpPosts.map((post) => ({
        url: `${baseUrl}/blog/${post.slug}`,
        lastModified: safeDate(post.frontmatter.date),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
    }));

    const enBlogUrls = enPosts.map((post) => ({
        url: `${baseUrl}/en/blog/${post.slug}`,
        lastModified: safeDate(post.frontmatter.date),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
    }));

    return [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
        },
        {
            url: `${baseUrl}/en`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
        },
        {
            url: `${baseUrl}/blog`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/en/blog`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.9,
        },
        ...Array.from({ length: 24 }, (_, i) => ({
            url: `${baseUrl}/24-facts/${i + 1}`,
            lastModified: new Date(),
            changeFrequency: 'monthly' as const,
            priority: 0.7,
        })),
        ...Array.from({ length: 24 }, (_, i) => ({
            url: `${baseUrl}/en/24-facts/${i + 1}`,
            lastModified: new Date(),
            changeFrequency: 'monthly' as const,
            priority: 0.7,
        })),
        {
            url: `${baseUrl}/cases`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.7,
        },
        {
            url: `${baseUrl}/en/cases`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.7,
        },
        {
            url: `${baseUrl}/screening-panel`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/en/screening-panel`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/24-facts`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/en/24-facts`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/fertility-numbers`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/en/fertility-numbers`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/evidence-policy`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.5,
        },
        {
            url: `${baseUrl}/en/evidence-policy`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.5,
        },
        ...jpBlogUrls,
        ...enBlogUrls,
    ];
}
