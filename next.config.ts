import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 2026-09-26 ブログ整理: EN記事のスラッグから "-en" 接尾辞を外し JP と同名にした(hreflang の対応が取れるように)。
  // 旧URLは 301 で新URLへ。テスト投稿 hello-world は book-release-announcement に統合。
  async redirects() {
    return [
      { source: '/en/blog/acog-2026-endometriosis-guidelines-no-wait-for-surgery-en', destination: '/en/blog/acog-2026-endometriosis-guidelines-no-wait-for-surgery', permanent: true },
      { source: '/en/blog/amh-egg-freezing-reality-en', destination: '/en/blog/amh-egg-freezing-reality', permanent: true },
      { source: '/en/blog/hello-world-en', destination: '/en/blog/book-release-announcement', permanent: true },
      { source: '/en/blog/folic-acid-preconception-care-en', destination: '/en/blog/folic-acid-preconception-care', permanent: true },
      { source: '/en/blog/folic-acid-the-critical-timing-for-pregnancy-preparation-en', destination: '/en/blog/folic-acid-the-critical-timing-for-pregnancy-preparation', permanent: true },
      { source: '/en/blog/low-hcg-not-miscarriage-en', destination: '/en/blog/low-hcg-not-miscarriage', permanent: true },
      { source: '/en/blog/manage-chronic-conditions-preconception-en', destination: '/en/blog/manage-chronic-conditions-preconception', permanent: true },
      { source: '/en/blog/mental-health-maternity-journey-en', destination: '/en/blog/mental-health-maternity-journey', permanent: true },
      { source: '/en/blog/natural-vs-programmed-fet-outcomes-en', destination: '/en/blog/natural-vs-programmed-fet-outcomes', permanent: true },
      { source: '/en/blog/postpartum-guidelines-exercise-pfmt-en', destination: '/en/blog/postpartum-guidelines-exercise-pfmt', permanent: true },
      { source: '/en/blog/preconception-care-today-en', destination: '/en/blog/preconception-care-today', permanent: true },
      { source: '/en/blog/preconception-checkup-guide-en', destination: '/en/blog/preconception-checkup-guide', permanent: true },
      { source: '/en/blog/safe-effective-exercise-pregnancy-en', destination: '/en/blog/safe-effective-exercise-pregnancy', permanent: true },
      { source: '/en/blog/tokyo-fertility-subsidy-2026-updates-en', destination: '/en/blog/tokyo-fertility-subsidy-2026-updates', permanent: true },
      { source: '/en/blog/coq10-egg-quality-fertilization-rate-en', destination: '/en/blog/coq10-egg-quality-fertilization-rate', permanent: true },
      { source: '/blog/hello-world', destination: '/blog/book-release-announcement', permanent: true },
    ];
  },
};

export default nextConfig;
