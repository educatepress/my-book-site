import type { Metadata } from 'next';
import NumbersPage from '@/components/numbers/numbers-page';
import { NUMBER_GROUPS, CLINICAL_RULES } from '@/data/fertility-numbers';
import { authorLd } from '@/lib/aeo';

export const metadata: Metadata = {
    title: '妊活の数字と、その限界 | TTC Guide',
    description: '妊娠・不妊予防に関する数字を、出典と「その数字が言わないこと」とセットで生殖医療専門医がまとめました。',
    alternates: { canonical: 'https://ttcguide.co/fertility-numbers', languages: { en: 'https://ttcguide.co/en/fertility-numbers' } },
};

/**
 * DefinedTermSet で各数字を機械可読な用語集として出す(TRUST=Translation)。
 * description に「意味」だけでなく「限界」も含めるのが肝: AIが数字を単独で切り出して
 * 誤用するのを防ぎ、限界ごと引用させる。
 */
function jsonLd() {
    const terms = NUMBER_GROUPS.flatMap((g) =>
        g.items.map((it) => ({
            '@type': 'DefinedTerm',
            name: `${it.value} — ${it.ja.label}`,
            description: `${it.ja.means} ただし: ${it.ja.limit}`,
            inDefinedTermSet: 'https://ttcguide.co/fertility-numbers',
            citation: it.source,
        }))
    );
    return {
        '@context': 'https://schema.org',
        '@type': 'DefinedTermSet',
        '@id': 'https://ttcguide.co/fertility-numbers',
        name: '妊活の数字と、その限界',
        inLanguage: 'ja',
        author: authorLd('ja'),
        hasDefinedTerm: terms,
        about: CLINICAL_RULES.map((r) => ({ '@type': 'MedicalGuideline', name: r.ja.rule, description: r.ja.why })),
    };
}

export default function Page() {
    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd()) }} />
            <NumbersPage lang="ja" />
        </>
    );
}
