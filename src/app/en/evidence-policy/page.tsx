import type { Metadata } from 'next';

/** Evidence Policy (EN) — mirrors /evidence-policy. Keep claims identical to actual practice. */
export const metadata: Metadata = {
    title: 'Evidence Policy | TTC Guide',
    description: 'How articles on this site are sourced, what we promise, and what we do not sell.',
    alternates: { canonical: 'https://ttcguide.co/en/evidence-policy', languages: { ja: 'https://ttcguide.co/evidence-policy' } },
};

const items = [
    ['Who writes this site', 'Every article is written and reviewed by Takuma Sato, MD, a practicing reproductive medicine specialist — not a content team.'],
    ['What counts as evidence', 'Peer-reviewed literature, clinical guidelines (ASRM, ESHRE, NICE, WHO, ACOG, JSOG) and standard textbooks (Speroff, Williams Obstetrics). Personal opinions and clinic marketing pages do not.'],
    ['Citations', 'Each article ends with a named References section. Where evidence is limited, the article says so plainly.'],
    ['What we never do', 'No cure claims, no fear-based framing, no unverifiable statistics. Medical decisions always belong with you and your own specialist.'],
    ['What we sell', "The author's books — nothing else. No supplements, no courses, no coaching, no attached clinic."],
    ['Conflicts of interest', 'Book links carry an Amazon Associates tag. There are no other financial relationships.'],
];

export default function EvidencePolicyPage() {
    return (
        <div className="min-h-screen bg-[var(--color-cream)] py-16 px-6">
            <article className="max-w-[720px] mx-auto bg-white rounded-[24px] p-8 md:p-12 shadow-sm border border-black/5">
                <h1 className="text-2xl md:text-3xl font-black mb-3 text-[var(--color-text-dark)]">Evidence Policy</h1>
                <p className="text-sm text-[var(--color-text-muted)] mb-10">How articles here are sourced, what we promise, and what we don&apos;t sell.</p>
                <dl className="space-y-8">
                    {items.map(([t, d]) => (
                        <div key={t}>
                            <dt className="font-bold text-[var(--color-sage)] mb-1">{t}</dt>
                            <dd className="leading-relaxed text-[0.95rem]">{d}</dd>
                        </div>
                    ))}
                </dl>
                <p className="mt-12 text-xs text-[var(--color-text-muted)]">General information, not medical advice. Please consult your own specialist for personal decisions.</p>
            </article>
        </div>
    );
}
