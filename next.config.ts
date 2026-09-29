import type { NextConfig } from "next";
import { blogRedirects } from "./src/lib/redirects";

const nextConfig: NextConfig = {
  // 2026-09-26 ブログ整理: EN記事のスラッグから "-en" 接尾辞を外し JP と同名にした(hreflang の対応が取れるように)。
  // 旧URLは 301 で新URLへ。テスト投稿 hello-world は book-release-announcement に統合。
  // 2026-09-28 重複統合: 同一クエリに複数本ぶつけていた群を1本に集約し、旧slugは統合先へ301。
  // ★2026-09-29: 定義そのものは src/lib/redirects.ts に移した。一覧(mdx.ts)も同じ定義を見る。
  async redirects() {
    return blogRedirects;
  },
};

export default nextConfig;
