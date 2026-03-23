import { MetadataRoute } from 'next'
import { getAllPosts } from '@/lib/mdx'

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://ttcguide.co';

    // Get all posts for both languages
    const jpPosts = getAllPosts('jp');
    const enPosts = getAllPosts('en');

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
        ...jpBlogUrls,
        ...enBlogUrls,
    ];
}
