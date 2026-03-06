import type { Metadata } from "next";
import { Noto_Sans_JP } from "next/font/google";
import "./globals.css";

const notoSansJP = Noto_Sans_JP({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-noto-sans-jp",
});

export const metadata: Metadata = {
  title: "『20代で考える 将来妊娠で困らないための選択』｜公式紹介ページ",
  description: "生殖医療専門医が、20代・30代の女性に今から知ってほしい“24の医学的事実”をやさしく解説。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={`${notoSansJP.variable} font-sans`}>
        {children}
      </body>
    </html>
  );
}
