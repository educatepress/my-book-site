// ★フォント定義は2つのルートレイアウト((ja)/(en))で共有する。
//   next/font はモジュールのトップレベルで呼ぶ必要があるため、ここに切り出している。
//   片方だけ直して見た目がずれるのを防ぐのが目的。
import { Zen_Kaku_Gothic_New, Noto_Sans_JP, DM_Sans } from 'next/font/google';

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

export const fontVars = `${zenKaku.variable} ${notoSansJP.variable} ${dmSans.variable}`;
