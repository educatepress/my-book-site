import type { Metadata } from 'next';
import PanelPage from '@/components/panel/panel-page';
import { PANEL_GROUPS } from '@/data/screening-panel';
import { authorLd } from '@/lib/aeo';

export const metadata: Metadata = {
    title: 'ブライダルチェックの結果を、自分で読む | TTC Guide',
    description: 'ブライダルチェック・不妊症スクリーニング検査の各項目について、目標値・意味・注意点を生殖医療専門医が整理しました。',
    alternates: { canonical: 'https://ttcguide.co/screening-panel', languages: { en: 'https://ttcguide.co/en/screening-panel' } },
};

function jsonLd() {
    const terms = PANEL_GROUPS.flatMap((g) =>
        g.items.map((it) => {
            const c = it.ja;
            return {
                '@type': 'DefinedTerm',
                name: c.name,
                description: `${c.target} — ${c.means} ${c.note}`,
                inDefinedTermSet: 'https://ttcguide.co/screening-panel',
            };
        })
    );
    return {
        '@context': 'https://schema.org',
        '@type': 'DefinedTermSet',
        '@id': 'https://ttcguide.co/screening-panel',
        name: 'ブライダルチェックの結果を、自分で読む | TTC Guide'.split(' | ')[0],
        inLanguage: 'ja',
        author: authorLd('ja'),
        hasDefinedTerm: terms,
    };
}

export default function Page() {
    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd()) }} />
            <PanelPage lang="ja" />
        </>
    );
}
