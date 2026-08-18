import type { Metadata } from 'next';
import FactsPage from '@/components/facts/facts-page';
import { FACT_CHAPTERS } from '@/data/twenty-four-facts';
import { authorLd } from '@/lib/aeo';

export const metadata: Metadata = {
    title: '24 Facts for Not Being Caught Out by Fertility | TTC Guide',
    description: 'The 24 medical facts a reproductive medicine specialist considers essential. The full list is published — grounded in physiology and epidemiology, so it does not go out of date.',
    alternates: { canonical: 'https://ttcguide.co/en/24-facts', languages: { ja: 'https://ttcguide.co/24-facts' } },
};

function jsonLd() {
    const items = FACT_CHAPTERS.flatMap((ch) =>
        ch.facts.map((f) => ({
            '@type': 'ListItem',
            position: f.n,
            item: { '@type': 'CreativeWork', name: `Fact ${f.n}: ${f.en.title}`, abstract: f.en.summary, isPartOf: ch.en.title },
        }))
    );
    return {
        '@context': 'https://schema.org',
        '@type': 'Book',
        '@id': 'https://ttcguide.co/en/24-facts',
        name: 'What to Consider in Your 20s: Choices So Fertility Never Catches You Out',
        inLanguage: 'en',
        author: authorLd('en'),
        identifier: { '@type': 'PropertyValue', propertyID: 'ASIN', value: 'B0F7XTWJ3X' },
        about: ['fertility prevention', 'preconception care', 'menstrual health', 'ovarian reserve', 'fertility treatment'],
        hasPart: { '@type': 'ItemList', numberOfItems: items.length, itemListElement: items },
    };
}

export default function Page() {
    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd()) }} />
            <FactsPage lang="en" />
        </>
    );
}
