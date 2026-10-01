// ★英語側のルートレイアウト。(ja) 側と対になる。詳しい経緯は (ja)/layout.tsx を参照。
//   ここが <html lang="en"> を出す。ヘッダー・フッターと canonical は
//   従来どおり (en)/en/layout.tsx が持つ。
import type { Metadata } from 'next';
import { fontVars } from '../fonts';
import SiteChrome from '@/components/common/site-chrome';
import { siteMetadata } from '../siteMetadata';
import '../globals.css';

export const metadata: Metadata = siteMetadata;

export default function EnRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={fontVars}>
      <body className="overflow-x-hidden w-full relative">
        {children}
        <SiteChrome />
      </body>
    </html>
  );
}
