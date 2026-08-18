import type { Metadata } from 'next';
import PanelPage from '@/components/panel/panel-page';
import { PANEL_GROUPS } from '@/data/screening-panel';
import { authorLd } from '@/lib/aeo';

export const metadata: Metadata = {
    title: 'How to Read a Preconception Screening Panel | TTC Guide',
    description: 'What each test in a preconception / fertility screening panel aims for, what it indicates, and what to watch out for.',
    alternates: { canonical: 'https://ttcguide.co/en/screening-panel', languages: { ja: 'https://ttcguide.co/screening-panel' } },
};

function jsonLd() {
    const terms = PANEL_GROUPS.flatMap((g) =>
        g.items.map((it) => {
            const c = it.en;
            return {
                '@type': 'DefinedTerm',
                name: c.name,
                description: `${c.target} — ${c.means} ${c.note}`,
                inDefinedTermSet: 'https://ttcguide.co/en/screening-panel',
            };
        })
    );
    return {
        '@context': 'https://schema.org',
        '@type': 'DefinedTermSet',
        '@id': 'https://ttcguide.co/en/screening-panel',
        name: 'How to Read a Preconception Screening Panel | TTC Guide'.split(' | ')[0],
        inLanguage: 'en',
        author: authorLd('en'),
        hasDefinedTerm: terms,
    };
}

export default function Page() {
    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd()) }} />
            <PanelPage lang="en" />
        </>
    );
}
