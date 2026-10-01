// 本番で500になるMDXを出す前に捕まえる。
// ★ビルド(npm run build)は通る。ブログページはサーバーレンダリングのため、
//   MDXのコンパイルエラーはリクエスト時に初めて起きて500になる。
//   2026-10-01に「<0.7 ng/mL」等で6本が本番500になった。
import { compile } from '@mdx-js/mdx';
import fs from 'node:fs';
import matter from 'gray-matter';
import { globSync } from 'glob';

const files = process.argv.length > 2
  ? process.argv.slice(2)
  : globSync('src/content/blog/{jp,en}/*.mdx');

let fail = 0;
for (const f of files) {
  const { content } = matter(fs.readFileSync(f, 'utf8'));
  try { await compile(content); }
  catch (e) {
    fail++;
    console.log(`✗ ${f}\n    ${String(e.message).split('\n')[0]}`);
  }
}
console.log(`\nMDXコンパイル: ${files.length}本 / 失敗 ${fail}本`);
process.exit(fail ? 1 : 0);
