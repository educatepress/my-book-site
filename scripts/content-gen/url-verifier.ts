import { setTimeout } from 'timers/promises';

/**
 * Verify if a URL is reachable by sending an HTTP HEAD request.
 * Returns true if the URL responds with a 2xx or 3xx status code.
 */
export async function verifyUrl(url: string): Promise<boolean> {
    try {
        const res = await fetch(url, {
            method: 'HEAD',
            redirect: 'follow',
            signal: AbortSignal.timeout(8000),
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
            }
        });
        // 403/401 indicates the page exists but blocked the bot. This is valid for anti-hallucination.
        return res.ok || res.status === 403 || res.status === 401;
    } catch {
        // Some sites block HEAD. Try GET as fallback.
        try {
            const res = await fetch(url, {
                method: 'GET',
                redirect: 'follow',
                signal: AbortSignal.timeout(8000),
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
                }
            });
            return res.ok || res.status === 403 || res.status === 401;
        } catch {
            return false;
        }
    }
}

/**
 * Verify all URLs found in a text block.
 * Returns the text with broken URLs removed, or throws if ALL URLs are broken.
 */
export async function extractAndVerifySourceUrl(text: string): Promise<string> {
    const urls = text.match(/https?:\/\/[^\s)\]"']+/g) || [];
    if (urls.length === 0) {
        throw new Error("❌ No source URL found in the generated text. Suspected hallucination.");
    }

    let hasValidUrl = false;
    let sanitized = text;

    for (const url of urls) {
        const isValid = await verifyUrl(url);
        if (isValid) {
            console.log(`  ✅ Source URL verified: ${url}`);
            hasValidUrl = true;
        } else {
            console.log(`  ❌ Source URL broken (removing): ${url}`);
            sanitized = sanitized.replace(url, '').replace(/\n\n+/g, '\n\n').trim();
        }
    }

    if (!hasValidUrl) {
        throw new Error("❌ All provided source URLs were invalid or broken. Suspected hallucination.");
    }

    return sanitized;
}

/**
 * Batch-verify an array of URLs.
 * Returns an object mapping each URL to its reachability status.
 */
export async function batchVerifyUrls(urls: string[]): Promise<Map<string, boolean>> {
    const results = new Map<string, boolean>();
    // Process in batches of 5 to avoid flooding
    const batchSize = 5;
    for (let i = 0; i < urls.length; i += batchSize) {
        const batch = urls.slice(i, i + batchSize);
        const checks = await Promise.all(
            batch.map(async url => {
                const ok = await verifyUrl(url);
                return { url, ok };
            })
        );
        for (const { url, ok } of checks) {
            results.set(url, ok);
        }
        // Small delay between batches
        if (i + batchSize < urls.length) {
            await setTimeout(500);
        }
    }
    return results;
}
