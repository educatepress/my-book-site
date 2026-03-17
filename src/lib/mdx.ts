import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

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

export function getPostSlugs(lang: 'jp' | 'en' = 'jp') {
    const dirPath = path.join(contentDirectory, lang);
    if (!fs.existsSync(dirPath)) return [];
    return fs.readdirSync(dirPath).filter((file) => file.endsWith('.mdx'));
}

export function getPostBySlug(slug: string, lang: 'jp' | 'en' = 'jp') {
    const realSlug = slug.replace(/\.mdx$/, '');
    const fullPath = path.join(contentDirectory, lang, `${realSlug}.mdx`);

    if (!fs.existsSync(fullPath)) {
        return null;
    }

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

export function getAllPosts(lang: 'jp' | 'en' = 'jp') {
    const slugs = getPostSlugs(lang);
    const today = new Date().toISOString().split('T')[0];

    const posts = slugs
        .map((slug) => getPostBySlug(slug, lang))
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
