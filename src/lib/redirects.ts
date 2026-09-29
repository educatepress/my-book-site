// ブログのリダイレクト定義（301）。
// ★next.config.ts と src/lib/mdx.ts の両方がここを参照する（2026-09-29 切り出し）。
//   ファイルを削除して 301 を張っても、Google Sheets のキュー(status='posted')から
//   スラッグが拾われるため、統合済みの旧記事が一覧に復活していた。
//   redirects を唯一の正とし、ここに source があるスラッグは一覧にも出さない。
export const blogRedirects = [
      { source: '/en/blog/acog-2026-endometriosis-guidelines-no-wait-for-surgery-en', destination: '/en/blog/endometriosis-diagnosis-fertility', permanent: true },
      { source: '/en/blog/amh-egg-freezing-reality-en', destination: '/en/blog/amh-egg-freezing-reality', permanent: true },
      { source: '/en/blog/hello-world-en', destination: '/en/blog/book-release-announcement', permanent: true },
      { source: '/en/blog/folic-acid-preconception-care-en', destination: '/en/blog/folic-acid-preconception-care', permanent: true },
      { source: '/en/blog/folic-acid-the-critical-timing-for-pregnancy-preparation-en', destination: '/en/blog/folic-acid-preconception-care', permanent: true },
      { source: '/en/blog/low-hcg-not-miscarriage-en', destination: '/en/blog/low-hcg-not-miscarriage', permanent: true },
      { source: '/en/blog/manage-chronic-conditions-preconception-en', destination: '/en/blog/manage-chronic-conditions-preconception', permanent: true },
      { source: '/en/blog/mental-health-maternity-journey-en', destination: '/en/blog/mental-health-maternity-journey', permanent: true },
      { source: '/en/blog/natural-vs-programmed-fet-outcomes-en', destination: '/en/blog/natural-vs-programmed-fet-outcomes', permanent: true },
      { source: '/en/blog/postpartum-guidelines-exercise-pfmt-en', destination: '/en/blog/postpartum-guidelines-exercise-pfmt', permanent: true },
      { source: '/en/blog/preconception-care-today-en', destination: '/en/blog/preconception-care-today', permanent: true },
      { source: '/en/blog/preconception-checkup-guide-en', destination: '/en/blog/preconception-checkup-guide', permanent: true },
      { source: '/en/blog/safe-effective-exercise-pregnancy-en', destination: '/en/blog/safe-effective-exercise-pregnancy', permanent: true },
      { source: '/en/blog/tokyo-fertility-subsidy-2026-updates-en', destination: '/en/blog/tokyo-fertility-subsidy-2026-updates', permanent: true },
      { source: '/en/blog/coq10-egg-quality-fertilization-rate-en', destination: '/en/blog/coq10-egg-quality-evidence', permanent: true },
      { source: '/en/blog/coq10-egg-quality-fertilization-rate', destination: '/en/blog/coq10-egg-quality-evidence', permanent: true },
      { source: '/en/blog/acupuncture-fertility-evidence', destination: '/en/blog/acupuncture-infertility-evidence-placebo', permanent: true },
      { source: '/en/blog/vitamin-d-fertility', destination: '/en/blog/vitamin-d-fertility-outcomes', permanent: true },
      { source: '/en/blog/sperm-dna-fragmentation-what-to-know', destination: '/en/blog/sperm-dna-fragmentation-infertility-hidden-cause', permanent: true },
      { source: '/en/blog/folic-acid-the-critical-timing-for-pregnancy-preparation', destination: '/en/blog/folic-acid-preconception-care', permanent: true },
      { source: '/en/blog/male-fertility-diet-processed-food-endocrine-disruptors', destination: '/en/blog/male-fertility-diet-impact', permanent: true },
      { source: '/en/blog/the-power-of-two-partner-support-fertility-treatment-stress', destination: '/en/blog/fertility-partner-communication-gap', permanent: true },
      { source: '/en/blog/microplastics-fertility-impact', destination: '/en/blog/environmental-hormones-fertility-threat', permanent: true },
      { source: '/en/blog/acog-2026-endometriosis-guidelines-no-wait-for-surgery', destination: '/en/blog/endometriosis-diagnosis-fertility', permanent: true },
      { source: '/blog/coq10-egg-quality-fertilization-rate', destination: '/blog/coq10-egg-quality-evidence', permanent: true },
      { source: '/blog/coq10-egg-quality-over-35', destination: '/blog/coq10-egg-quality-evidence', permanent: true },
      { source: '/blog/acupuncture-fertility-evidence', destination: '/blog/acupuncture-infertility-evidence-placebo', permanent: true },
      { source: '/blog/vitamin-d-fertility', destination: '/blog/vitamin-d-fertility-outcomes', permanent: true },
      { source: '/blog/sperm-dna-fragmentation-what-to-know', destination: '/blog/sperm-dna-fragmentation-infertility-hidden-cause', permanent: true },
      { source: '/blog/folic-acid-the-critical-timing-for-pregnancy-preparation', destination: '/blog/folic-acid-preconception-care', permanent: true },
      { source: '/blog/male-fertility-diet-processed-food-endocrine-disruptors', destination: '/blog/male-fertility-diet-impact', permanent: true },
      { source: '/blog/the-power-of-two-partner-support-fertility-treatment-stress', destination: '/blog/fertility-partner-communication-gap', permanent: true },
      { source: '/blog/microplastics-fertility-impact', destination: '/blog/environmental-hormones-fertility-threat', permanent: true },
      { source: '/blog/acog-2026-endometriosis-guidelines-no-wait-for-surgery', destination: '/blog/endometriosis-diagnosis-fertility', permanent: true },
      { source: '/blog/hello-world', destination: '/blog/book-release-announcement', permanent: true },
];

/** 301 の source になっているブログのスラッグ（言語別）。一覧から除外するために使う。 */
export const redirectedSlugs: Record<'jp' | 'en', Set<string>> = (() => {
    const jp = new Set<string>();
    const en = new Set<string>();
    for (const r of blogRedirects) {
        const m = /^\/(en\/)?blog\/(.+)$/.exec(r.source);
        if (!m) continue;
        (m[1] ? en : jp).add(m[2]);
    }
    return { jp, en };
})();
