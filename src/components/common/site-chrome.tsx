// ★<body> の末尾に入る計測スクリプト類。2つのルートレイアウトで共有する。
import { GoogleAnalytics } from '@next/third-parties/google';
import Script from 'next/script';
import AiReferralTracker from '@/components/common/ai-referral-tracker';

export default function SiteChrome() {
  return (
    <>
      <GoogleAnalytics gaId="G-576MQ3QBDX" />
      <AiReferralTracker />
      <Script
        defer
        data-domain="ttcguide.co"
        src="https://plausible.io/js/script.outbound-links.js"
        strategy="afterInteractive"
      />
    </>
  );
}
