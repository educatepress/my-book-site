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
    category?: string;
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

// 日本語混入を表示時に吸収するサニタイザー
const CATEGORY_JP_TO_EN: Record<string, string> = {
    '女性の健康': 'Women\'s Health',
    '不妊治療・生殖医療': 'Fertility & Reproductive Medicine',
    'プレコンセプションケア': 'Preconception Care',
    '男性不妊': 'Male Fertility',
    '体外受精': 'IVF',
};

const containsCJK = (s: unknown): boolean =>
    typeof s === 'string' && /[\u3000-\u9fff\uff00-\uffef]/.test(s);

const sanitizeFrontmatter = (
    data: Record<string, unknown>,
    lang: 'jp' | 'en'
): Record<string, unknown> => {
    if (lang !== 'en') return data;
    const out = { ...data };

    // category 日本語残留を英語に変換
    if (typeof out.category === 'string' && CATEGORY_JP_TO_EN[out.category]) {
        out.category = CATEGORY_JP_TO_EN[out.category];
    } else if (containsCJK(out.category)) {
        out.category = 'Fertility';
    }

    // 著者名が漢字なら標準名に置換
    if (containsCJK(out.author)) {
        out.author = 'Takuma Sato, MD';
    }

    // x_post に日本語が混入していたら表示で隠す
    if (containsCJK(out.x_post)) {
        out.x_post = '';
    }

    return out;
};

export async function getPostBySlug(slug: string, lang: 'jp' | 'en' = 'jp') {
    const realSlug = slug.replace(/\.mdx$/, '');

    // 1. Try Local File First
    const fullPath = path.join(contentDirectory, lang, `${realSlug}.mdx`);
    if (fs.existsSync(fullPath)) {
        const fileContents = fs.readFileSync(fullPath, 'utf8');
        const { data, content } = matter(fileContents);
        const sanitized = sanitizeFrontmatter(data, lang);
        return {
            slug: realSlug,
            content,
            frontmatter: {
                ...sanitized,
                title: (sanitized.title as string) || '',
                date: sanitized.date ? (sanitized.date instanceof Date ? (sanitized.date as Date).toISOString().split('T')[0] : String(sanitized.date)) : '',
                excerpt: (sanitized.excerpt as string) || '',
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
                const sanitized = sanitizeFrontmatter(data, lang);
                return {
                    slug: realSlug,
                    content,
                    frontmatter: {
                        ...sanitized,
                        title: (sanitized.title as string) || '',
                        date: sanitized.date ? (sanitized.date instanceof Date ? (sanitized.date as Date).toISOString().split('T')[0] : String(sanitized.date)) : '',
                        excerpt: (sanitized.excerpt as string) || '',
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
