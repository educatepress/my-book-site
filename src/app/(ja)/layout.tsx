// ★日本語側のルートレイアウト。
//   以前は src/app/layout.tsx 1つで、headers() から x-pathname を読んで
//   <html lang> を ja/en に出し分けていた。headers() はルートレイアウトで呼ぶと
//   配下の全ルートを動的レンダリングに倒すため、★サイト全36ルートすべてが
//   「リクエストごとにサーバーで生成」になっていた(= Vercel の Active CPU を消費)。
//   lang を静的に出し分けるために、ルートレイアウトを言語ごとに分けた(Next のルートグループ)。
import type { Metadata } from 'next';
import { fontVars } from '../fonts';
import SiteChrome from '@/components/common/site-chrome';
import { siteMetadata } from '../siteMetadata';
import '../globals.css';

export const metadata: Metadata = siteMetadata;

export default function JaRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className={fontVars}>
      <body className="overflow-x-hidden w-full relative">
        {children}
        <SiteChrome />
      </body>
    </html>
  );
}
