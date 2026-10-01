import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { redirectedSlugs } from './redirects';
import { getQueueItems } from '@/lib/sheets';

// ★2026-10-02: 1回のビルドで Google Sheets を187回叩いていたのを1回に束ねる。
//   全ページを静的化して181本をプリレンダリングするようになった結果、記事ページごとに
//   getPostSlugs() が呼ばれ、そのたびに Sheets を読んでいた(= ビルドが遅く、
//   Sheets API のレート制限にも近づく)。1回のビルド中に Sheets の内容は変わらない。
//   ★TTLを長くしないこと: 一覧と sitemap は revalidate=3600 の ISR で動くので、
//   ここを長く持たせると「Sheets に記事を足したのに一覧へ出てこない」原因になる。
//   ★失敗したらキャッシュを捨てて次回やり直す(Sheets が一時的に落ちたときに
//   「空の結果」を5分間使い続けないため)。
const QUEUE_TTL_MS = 5 * 60 * 1000;
type QueueResult = Awaited<ReturnType<typeof getQueueItems>>;
let queueCache: { at: number; promise: Promise<QueueResult> } | null = null;

function getQueueItemsCached(): Promise<QueueResult> {
    const now = Date.now();
    if (queueCache && now - queueCache.at < QUEUE_TTL_MS) {
        return queueCache.promise;
    }
    const promise = getQueueItems();
    queueCache = { at: now, promise };
    promise.catch(() => {
        if (queueCache?.promise === promise) queueCache = null;
    });
    return promise;
}

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
    /** true の記事は一覧・sitemap から除外する（2026-09-29 追加）。
     *  読者が取れる行動がない記事を、削除せずに下書きへ戻すための仕組み。
     *  門(scripts/compliance/check_blog.py)も draft を対象外にしている。 */
    draft?: boolean;
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
        const queue = await getQueueItemsCached();
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
    // ★301 を張った旧スラッグは一覧に出さない（2026-09-29）。
    //   ファイルを削除しても Google Sheets のキュー(status='posted')から拾われるため、
    //   統合済みの旧記事が一覧に復活していた。next.config.ts と同じ定義を唯一の正にする。
    const redirected = redirectedSlugs[lang];
    return Array.from(new Set(localSlugs)).filter((slug) => !redirected.has(slug));
}

// 日本語混入を表示時に吸収するサニタイザー
const containsCJK = (s: unknown): boolean =>
    typeof s === 'string' && /[\u3000-\u9fff\uff00-\uffef]/.test(s);

const sanitizeFrontmatter = (
    data: Record<string, unknown>,
    lang: 'jp' | 'en'
): Record<string, unknown> => {
    if (lang !== 'en') return data;
    const out = { ...data };

    // category は JP/EN 共通のキー(日本語)のまま通す。英語表示は blog-list-client の EN_CATEGORIES が担う。
    // (2026-09-26 まで、ここで英語化していたためフィルタのキーが一致せず EN 一覧の絞り込みが「All」しか出なかった)

    // 著者名を一律 Takuma Sato, MD に統一（漢字・英語表記揺れ問わず）
    const KNOWN_AUTHOR_VARIANTS = [
        /^佐藤[\s\u3000]*琢磨$/,
        /^Dr\.?\s+Takuma\s+Sato$/i,
        /^Takuma\s+Sato$/i,
        /^Takuma\s+Sato,\s+MD,?\s*PhD$/i,
    ];
    if (typeof out.author === 'string' && KNOWN_AUTHOR_VARIANTS.some(re => re.test(out.author as string))) {
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
                draft: data.draft === true || String(data.draft).toLowerCase() === 'true',
                title: (sanitized.title as string) || '',
                date: sanitized.date ? (sanitized.date instanceof Date ? (sanitized.date as Date).toISOString().split('T')[0] : String(sanitized.date)) : '',
                excerpt: (sanitized.excerpt as string) || '',
            } as Partial<BlogPostMetadata>,
        };
    }

    // 2. Try Remote (Google Sheets)
    try {
        const queue = await getQueueItemsCached();
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
                        draft: data.draft === true || String(data.draft).toLowerCase() === 'true',
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
        // ★下書き(draft: true)は一覧・sitemap に出さない
        .filter((post) => post!.frontmatter.draft !== true)
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
