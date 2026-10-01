import type { Metadata } from 'next';
import NumbersPage from '@/components/numbers/numbers-page';
import { NUMBER_GROUPS, CLINICAL_RULES } from '@/data/fertility-numbers';
import { authorLd } from '@/lib/aeo';

export const metadata: Metadata = {
    title: 'Fertility Numbers, and What They Don’t Tell You | TTC Guide',
    description: 'Key fertility figures with their sources — and, for each one, what the number does not say. Compiled by a practising reproductive medicine specialist.',
    alternates: { canonical: 'https://ttcguide.co/en/fertility-numbers', languages: { ja: 'https://ttcguide.co/fertility-numbers' } },
};

function jsonLd() {
    const terms = NUMBER_GROUPS.flatMap((g) =>
        g.items.map((it) => ({
            '@type': 'DefinedTerm',
            name: `${it.value} — ${it.en.label}`,
            description: `${it.en.means} However: ${it.en.limit}`,
            inDefinedTermSet: 'https://ttcguide.co/en/fertility-numbers',
            citation: it.source,
        }))
    );
    return {
        '@context': 'https://schema.org',
        '@type': 'DefinedTermSet',
        '@id': 'https://ttcguide.co/en/fertility-numbers',
        name: 'Fertility Numbers, and What They Don’t Tell You',
        inLanguage: 'en',
        author: authorLd('en'),
        hasDefinedTerm: terms,
        about: CLINICAL_RULES.map((r) => ({ '@type': 'MedicalGuideline', name: r.en.rule, description: r.en.why })),
    };
}

export default function Page() {
    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd()) }} />
            <NumbersPage lang="en" />
        </>
    );
}
