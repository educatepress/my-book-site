import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import FactDetail, { findFact } from '@/components/facts/fact-detail';
import { FACT_DETAILS } from '@/data/fact-details';
import { authorLd } from '@/lib/aeo';

export function generateStaticParams() {
    return Array.from({ length: 24 }, (_, i) => ({ n: String(i + 1) }));
}

export async function generateMetadata({ params }: { params: Promise<{ n: string }> }): Promise<Metadata> {
    const { n } = await params;
    const found = findFact(Number(n));
    if (!found) return {};
    const c = found.fact.ja;
    return {
        title: `${c.title} | TTC Guide`,
        description: c.summary,
        alternates: { canonical: `https://ttcguide.co/24-facts/${n}` },
    };
}

export default async function Page({ params }: { params: Promise<{ n: string }> }) {
    const { n } = await params;
    const num = Number(n);
    const found = findFact(num);
    if (!found || !FACT_DETAILS[num]) notFound();
    const c = found.fact.ja;
    const d = FACT_DETAILS[num].ja;
    const ld = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: c.title,
        description: c.summary,
        articleBody: `${d.detail} ${d.action}`,
        inLanguage: 'ja',
        isPartOf: { '@type': 'Book', '@id': 'https://ttcguide.co/24-facts' },
        author: authorLd('ja'),
    };
    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
            <FactDetail n={num} lang="ja" />
        </>
    );
}
