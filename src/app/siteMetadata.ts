// ★サイト共通の metadata。(ja)/(en) の2つのルートレイアウトで同じものを使う。
//   ルートレイアウトを2つに分けた目的は <html lang> を静的に出し分けることだけなので、
//   metadata は分割前と1文字も変えない（EN ページの既定タイトルが和文のままなのは
//   分割前からの挙動。直すなら別の変更として行う）。
import type { Metadata } from 'next';

export const siteMetadata: Metadata = {
  metadataBase: new URL('https://ttcguide.co'),
  title: '『20代で考える 将来妊娠で困らないための選択』 - 生殖医療専門医 佐藤琢磨',
  description: '今の自分を大切にすることが、未来の「選択肢」を増やす。20代・30代の女性とパートナーに、今から知っておくべき24の医学的事実を一冊に。',
  verification: {
    google: 'aTPMEdxI6hTwRQB5mDiqtTtaJsVfMeD3pNCZdbnPguo',
  },
  alternates: {
    canonical: 'https://ttcguide.co',
    languages: {
      'ja': 'https://ttcguide.co',
      'en': 'https://ttcguide.co/en',
      'x-default': 'https://ttcguide.co',
    },
  },
  openGraph: {
    title: '『20代で考える 将来妊娠で困らないための選択』',
    description: '生殖医療専門医がやさしく解説。「先に知っていると差がつく」24の医学的事実を整理した一冊です。',
    images: [{ url: '/logocircle.png' }],
  },
  twitter: {
    card: 'summary',
    images: ['/logocircle.png'],
  },
};
