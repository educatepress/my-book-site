import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { getQueueItems } from '@/lib/sheets';

const contentDirectory = path.join(process.cwd(), 'src/content/blog');

export interface BlogPostMetadata {
    title: string;
    date: string;
    excerpt: string;
    slug: string;
    coverImage?: string;
    author?: string;
    tags?: string[];
}

export async function getPostSlugs(lang: 'jp' | 'en' = 'jp'): Promise<string[]> {
    const dirPath = path.join(contentDirectory, lang);
    const localSlugs: string[] = [];
    
    if (fs.existsSync(dirPath)) {
        fs.readdirSync(dirPath)
          .filter((file) => file.endsWith('.mdx'))
          .forEach(file => localSlugs.push(file.replace(/\.mdx$/, '')));
    }

    // Remote (Google Sheets)
    try {
        const queue = await getQueueItems();
        const postedBlogs = queue.filter(q => q.type === 'blog' && q.status === 'posted');
        postedBlogs.forEach(q => {
            try {
                const recipe = JSON.parse(q.generation_recipe || '{}');
                if (recipe.slug) {
                    // Normalize slug name
                    localSlugs.push(recipe.slug);
                }
            } catch (e) {}
        });
    } catch (error) {
        console.error('Failed to fetch remote slugs from Sheets:', error);
    }

    // Deduplicate
    return Array.from(new Set(localSlugs));
}

export async function getPostBySlug(slug: string, lang: 'jp' | 'en' = 'jp') {
    const realSlug = slug.replace(/\.mdx$/, '');

    // 1. Try Local File First
    const fullPath = path.join(contentDirectory, lang, `${realSlug}.mdx`);
    if (fs.existsSync(fullPath)) {
        const fileContents = fs.readFileSync(fullPath, 'utf8');
        const { data, content } = matter(fileContents);
        return {
            slug: realSlug,
            content,
            frontmatter: {
                ...data,
                title: data.title || '',
                date: data.date ? (data.date instanceof Date ? data.date.toISOString().split('T')[0] : String(data.date)) : '',
                excerpt: data.excerpt || '',
            } as Partial<BlogPostMetadata>,
        };
    }

    // 2. Try Remote (Google Sheets)
    try {
        const queue = await getQueueItems();
        // Find row that matches the slug
        const postRow = queue.find(q => {
            if (q.type !== 'blog' || q.status !== 'posted') return false;
            if (q.title === realSlug) return true;
            try {
                const r = JSON.parse(q.generation_recipe || '{}');
                return r.slug === realSlug;
            } catch (e) { return false; }
        });

        if (postRow) {
            const recipe = JSON.parse(postRow.generation_recipe || '{}');
            const mdxString = lang === 'jp' ? recipe.jpBlog : recipe.enBlog;
            if (mdxString) {
                const { data, content } = matter(mdxString);
                return {
                    slug: realSlug,
                    content,
                    frontmatter: {
                        ...data,
                        title: data.title || '',
                        date: data.date ? (data.date instanceof Date ? data.date.toISOString().split('T')[0] : String(data.date)) : '',
                        excerpt: data.excerpt || '',
                    } as Partial<BlogPostMetadata>,
                };
            }
        }
    } catch (error) {
        console.error(`Failed to fetch remote post for slug: ${realSlug}`);
    }

    return null;
}

export async function getAllPosts(lang: 'jp' | 'en' = 'jp') {
    const slugs = await getPostSlugs(lang);
    const today = new Date().toISOString().split('T')[0];

    // resolve all posts concurrently
    const postsPromises = slugs.map((slug) => getPostBySlug(slug, lang));
    const resolvedPosts = await Promise.all(postsPromises);

    const posts = resolvedPosts
        .filter((post) => post !== null)
        // Filter out posts with a date in the future (Auto-Publishing feature)
        .filter((post) => {
            const postDate = post!.frontmatter.date || '1970-01-01';
            return postDate <= today;
        })
        .sort((post1, post2) => {
            const date1 = post1!.frontmatter.date || '1970-01-01';
            const date2 = post2!.frontmatter.date || '1970-01-01';
            return date1 > date2 ? -1 : 1;
        });
        
    return posts;
}
