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

# ★変数の直後に日本語が続く箇所は ${VAR} と書くこと。
#   $VAR「...」のように書くと bash が「」を変数名の一部と解釈して unbound variable になる。

# 1) 直近コミットで追加された本文行から、十分に特徴的な文字列を目印に選ぶ
# ★目印はマークダウン記法を含まない行から選ぶこと。
#   「**強調**」を含む行を目印にすると、HTML では <strong> になるため永遠に一致しない。
MARK=$(python3 - <<'PYEOF'
import re, subprocess
out = subprocess.run(['git','show','--format=','--unified=0','HEAD','--','src/content/blog'],
                     capture_output=True, text=True).stdout
f = None
for line in out.split('\n'):
    if line.startswith('+++ b/'):
        f = line[6:]
    elif line.startswith('+') and not line.startswith('+++') and f:
        t = line[1:].strip()
        # マークダウン記法・リンク・表・見出し・箇条書きを含む行は目印にしない
        if len(t) > 30 and not re.search(r'[*_`\[\]()|#>★]', t):
            print(f + '\t' + t[:60])
            break
PYEOF
)
MARK_FILE=${MARK%%$'\t'*}
MARK_TEXT=${MARK#*$'\t'}

# ★目印が空のまま進むと、grep が必ず当たって「反映済み」と誤判定する。
#   直近コミットが記事本文を変えていない場合(ドキュメントのみ等)はここで止める。
if [ -z "${MARK_TEXT// /}" ] || [ "${#MARK_TEXT}" -lt 20 ]; then
  echo "⚠ 直近コミットに記事本文の追加行が無いため、反映確認は行えない。"
  echo "  本番ステータスの点検だけ実行する。"
  SKIP_WAIT=1
fi

SLUG=$(basename "$MARK_FILE" .mdx)
case "$MARK_FILE" in */en/*) URL="https://www.ttcguide.co/en/blog/$SLUG";; *) URL="https://www.ttcguide.co/blog/$SLUG";; esac
SNIP="$MARK_TEXT"

echo "目印: $URL"
echo "      「${SNIP}」"

# 2) 反映を待つ
if [ -z "${SKIP_WAIT:-}" ]; then
for i in $(seq 1 30); do
  if curl -s "$URL" | grep -qF "$SNIP"; then echo "✅ 反映済み ($((i*15))秒後)"; break; fi
  if [ "$i" = 30 ]; then echo "✗ 7分半待っても反映されない。Vercel のデプロイを確認すること。"; exit 1; fi
  sleep 15
done
fi

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
