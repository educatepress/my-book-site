'use client';

import { useEffect } from 'react';

/**
 * ai-referral-tracker — AI経由の流入を GA4 で可視化する（2026-08-18）
 *
 * GA4 の既定のチャネル分類では ChatGPT / Perplexity 等からの流入が Referral や
 * Direct に紛れ、AEO施策の効果が測れない。初回表示時に referrer とクエリを見て、
 * AI経由と判定できたら `ai_referral` イベントを送る。
 * 判定できたソースはセッション内で1回だけ送る（同一セッションの回遊で二重計上しない）。
 */
const AI_SOURCES: Array<[RegExp, string]> = [
    [/(^|\.)chatgpt\.com$/i, 'chatgpt'],
    [/(^|\.)chat\.openai\.com$/i, 'chatgpt'],
    [/(^|\.)perplexity\.ai$/i, 'perplexity'],
    [/(^|\.)claude\.ai$/i, 'claude'],
    [/(^|\.)copilot\.microsoft\.com$/i, 'copilot'],
    [/(^|\.)bing\.com$/i, 'bing-copilot'],
    [/(^|\.)gemini\.google\.com$/i, 'gemini'],
    [/(^|\.)poe\.com$/i, 'poe'],
    [/(^|\.)you\.com$/i, 'you'],
    [/(^|\.)phind\.com$/i, 'phind'],
];

const KEY = 'ai_referral_logged';

export default function AiReferralTracker() {
    useEffect(() => {
        try {
            if (sessionStorage.getItem(KEY)) return;

            let source: string | null = null;

            // ① リファラのホスト名で判定
            if (document.referrer) {
                const host = new URL(document.referrer).hostname;
                for (const [re, name] of AI_SOURCES) {
                    if (re.test(host)) { source = name; break; }
                }
            }
            // ② utm_source でも判定（AI側がリファラを送らない場合の保険）
            if (!source) {
                const utm = new URLSearchParams(window.location.search).get('utm_source');
                if (utm && /chatgpt|openai|perplexity|claude|copilot|gemini/i.test(utm)) source = utm.toLowerCase();
            }
            if (!source) return;

            sessionStorage.setItem(KEY, source);
            const w = window as unknown as { gtag?: (...args: unknown[]) => void };
            w.gtag?.('event', 'ai_referral', {
                ai_source: source,
                landing_path: window.location.pathname,
            });
        } catch {
            /* 計測は本体機能ではないので、失敗しても黙って諦める */
        }
    }, []);

    return null;
}
