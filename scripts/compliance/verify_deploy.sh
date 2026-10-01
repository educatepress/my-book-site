#!/usr/bin/env bash
# デプロイ反映を確認してから、本番の全記事をチェックする。
#
# ★なぜこのスクリプトがあるか(2026-10-01)
#   「反映されたか」を確かめるとき、★前のコミットで入った文字列を目印に使うと、
#   まだデプロイ中の段階で「反映済み」と誤判定する。同じ失敗を3回した。
#   目印は必ず「このコミットでしか出ない文字列」にすること。
#   このスクリプトは git から直近コミットの追加行を拾って目印を自動で決める。
set -u
cd "$(dirname "$0")/../.."

# 1) 直近コミットで追加された本文行から、十分に特徴的な文字列を目印に選ぶ
read -r MARK_FILE MARK_TEXT < <(
  git show --format= --unified=0 HEAD -- 'src/content/blog/**/*.mdx' \
  | awk '/^\+\+\+ b\//{f=substr($2,3)} /^\+[^+]/{t=substr($0,2); if (length(t)>25 && t !~ /^[#*|>-]/) {print f, t; exit}}'
)
if [ -z "${MARK_TEXT:-}" ]; then
  echo "⚠ 直近コミットに記事の追加行が無い。目印を自動決定できないので手動で確認すること。"; exit 2
fi
SLUG=$(basename "$MARK_FILE" .mdx)
case "$MARK_FILE" in */en/*) URL="https://www.ttcguide.co/en/blog/$SLUG";; *) URL="https://www.ttcguide.co/blog/$SLUG";; esac
SNIP=$(printf '%s' "$MARK_TEXT" | cut -c1-40)

echo "目印: $URL"
echo "      「$SNIP」"

# 2) 反映を待つ
for i in $(seq 1 30); do
  if curl -s "$URL" | grep -qF "$SNIP"; then echo "✅ 反映済み ($((i*15))秒後)"; break; fi
  if [ "$i" = 30 ]; then echo "✗ 7分半待っても反映されない。Vercel のデプロイを確認すること。"; exit 1; fi
  sleep 15
done

# 3) 公開記事すべての HTTP ステータスを点検
#    ★ビルドが通ることと、ページが開けることは別(MDXはリクエスト時にコンパイルされる)
python3 - <<'PY'
# -*- coding: utf-8 -*-
import glob, os, subprocess, concurrent.futures
urls=[]
for lang,pre in (('jp','blog'),('en','en/blog')):
    for p in glob.glob(f'src/content/blog/{lang}/*.mdx'):
        if 'draft: true' in open(p,encoding='utf-8').read(): continue
        urls.append(f'https://www.ttcguide.co/{pre}/{os.path.basename(p)[:-4]}')
def ck(u):
    return u, subprocess.run(['curl','-s','-o','/dev/null','-w','%{http_code}',u],
                             capture_output=True,text=True).stdout.strip()
bad=[]
with concurrent.futures.ThreadPoolExecutor(max_workers=8) as ex:
    for u,c in ex.map(ck,urls):
        if c!='200': bad.append((c,u))
print(f'本番ステータス: {len(urls)}本 / 200以外 {len(bad)}本')
for c,u in bad: print('  ',c,u)
raise SystemExit(1 if bad else 0)
PY
