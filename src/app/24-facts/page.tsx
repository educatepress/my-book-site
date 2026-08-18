import type { Metadata } from 'next';
import FactsPage from '@/components/facts/facts-page';
import { FACT_CHAPTERS } from '@/data/twenty-four-facts';
import { authorLd } from '@/lib/aeo';

export const metadata: Metadata = {
    title: '将来、妊娠で困らないための24の事実 | TTC Guide',
    description: '生殖医療専門医が厳選した24の医学的事実。目次を全公開しています。生理学と疫学に基づくため、年月が経っても変わらない知識です。',
    alternates: { canonical: 'https://ttcguide.co/24-facts', languages: { en: 'https://ttcguide.co/en/24-facts' } },
};

/** Book + hasPart(ItemList) で「この本に何が書かれているか」をAIに読ませる */
function jsonLd() {
    const items = FACT_CHAPTERS.flatMap((ch) =>
        ch.facts.map((f) => ({
            '@type': 'ListItem',
            position: f.n,
            item: { '@type': 'CreativeWork', name: `事実${f.n} ${f.ja.title}`, abstract: f.ja.summary, isPartOf: ch.ja.title },
        }))
    );
    return {
        '@context': 'https://schema.org',
        '@type': 'Book',
        '@id': 'https://ttcguide.co/24-facts',
        name: '20代で考える 将来妊娠で困らないための選択',
        inLanguage: 'ja',
        author: authorLd('ja'),
        identifier: { '@type': 'PropertyValue', propertyID: 'ASIN', value: 'B0F7XTWJ3X' },
        about: ['不妊予防', 'プレコンセプションケア', '月経', '卵巣予備能', '不妊治療'],
        hasPart: { '@type': 'ItemList', numberOfItems: items.length, itemListElement: items },
    };
}

export default function Page() {
    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd()) }} />
            <FactsPage lang="ja" />
        </>
    );
}
