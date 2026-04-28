type ReferenceItem = {
    authors: string;
    title: string;
    journal?: string;
    year: number | string;
    pmid?: string;
    doi?: string;
    url?: string;
};

export function References({ items }: { items: ReferenceItem[] }) {
    if (!items || items.length === 0) return null;

    return (
        <section className="mt-12 pt-8 border-t border-black/10" aria-label="References">
            <h2 className="text-[1.15rem] sm:text-[1.3rem] font-bold text-[var(--color-text-dark)] mb-5 not-prose">
                References
            </h2>
            <ol className="not-prose space-y-3 text-[0.85rem] sm:text-[0.9rem] leading-[1.7] text-[var(--color-text-mid)] list-decimal pl-5">
                {items.map((ref, i) => {
                    const linkHref = ref.pmid
                        ? `https://pubmed.ncbi.nlm.nih.gov/${ref.pmid}/`
                        : ref.doi
                        ? `https://doi.org/${ref.doi}`
                        : ref.url;

                    return (
                        <li key={i} className="break-words">
                            <span>{ref.authors}. </span>
                            <span>&ldquo;{ref.title}.&rdquo; </span>
                            {ref.journal && <em className="not-italic font-medium">{ref.journal}</em>}
                            {ref.journal && <span>, </span>}
                            <span>{ref.year}.</span>
                            {linkHref && (
                                <>
                                    {' '}
                                    <a
                                        href={linkHref}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-[var(--color-sage)] underline underline-offset-2 break-all"
                                    >
                                        {ref.pmid ? `PMID: ${ref.pmid}` : ref.doi ? `DOI: ${ref.doi}` : 'Link'}
                                    </a>
                                </>
                            )}
                        </li>
                    );
                })}
            </ol>
        </section>
    );
}
