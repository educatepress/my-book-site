import type { Metadata } from 'next';
import { Zen_Kaku_Gothic_New, Noto_Sans_JP, DM_Sans } from 'next/font/google';
import './globals.css';

// Fonts configuration
const zenKaku = Zen_Kaku_Gothic_New({
  weight: ['400', '700', '900'],
  subsets: ['latin'],
  variable: '--font-zen-kaku',
  display: 'swap',
});

const notoSansJP = Noto_Sans_JP({
  weight: ['400', '500', '700'],
  subsets: ['latin'],
  variable: '--font-noto-sans',
  display: 'swap',
});

const dmSans = DM_Sans({
  weight: ['400', '500', '700'],
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://doctors-guide-womens-health.vercel.app'),
  title: '『20代で考える 将来妊娠で困らないための選択』 - 生殖医療専門医 佐藤琢磨',
  description: '今の自分を大切にすることが、未来の「選択肢」を増やす。20代・30代の女性とパートナーに、今から知っておくべき24の医学的事実を一冊に。',
  verification: {
    google: 'aTPMEdxI6hTwRQB5mDiqtTtaJsVfMeD3pNCZdbnPguo',
  },
  openGraph: {
    title: '『20代で考える 将来妊娠で困らないための選択』',
    description: '生殖医療専門医がやさしく解説。産婦人科医が「先に知っていると差がつく」24の医学的事実を整理した一冊です。',
    images: [{ url: '/mockup-jp.png', width: 800, height: 1100 }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className={`${zenKaku.variable} ${notoSansJP.variable} ${dmSans.variable}`}>
      <body className="overflow-x-hidden w-full relative">
        {children}
      </body>
    </html>
  );
}
