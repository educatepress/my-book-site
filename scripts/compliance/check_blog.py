#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""ブログ記事の門(事実と引用)。the-skin-atelier の check_all.ts を my-book-site 用に移植(2026-09-26)。
  python3 scripts/compliance/check_blog.py            # 全記事
  python3 scripts/compliance/check_blog.py path.mdx   # 1本
落ちる(exit 1)もの:
  ① 台帳(pmid_titles.json)に無い PMID       … PubMedで確認して台帳に登録するまで使えない
  ② 本文のインライン引用 (姓, 年) が、その記事の参考文献のPMIDの著者・年と合わない
  ③ 参考文献欄に DOI / PMC番号 / 巻号ページ  … 書誌は「題名 + PMID」だけ(書くほど捏造の面積が増える)
  ④ MDX が 500 になる生記法 (<Link> / ::: / {.class} / import)
  ⑤ frontmatter の必須キー欠落 (title/date/excerpt/author/category) と不正カテゴリ
警告(exit 0)のもの:
  ⑥ 「臨床試験で」「研究で示され」「メタ解析」等の枕詞があるのに、記事に PMID が1つも無い(型B)
  ⑦ title / excerpt に % や倍の数値があるのに PMID が無い(型B・逆相関)
"""
import json, os, re, sys, glob

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
LEDGER = json.load(open(os.path.join(HERE, 'pmid_titles.json'), encoding='utf-8'))
CATS = {'プレコンセプションケア', '女性の健康', '男性不妊・ケア', '不妊治療・生殖医療', 'ニュース・制度・助成金'}
EVIDENCE = re.compile(r'臨床試験|ランダム化|RCT|メタ解析|メタアナリシス|系統的レビュー|システマティックレビュー|コホート研究|研究で(?:は)?(?:示|明らか|報告|確認)|clinical trial|meta-analys|systematic review|randomi[sz]ed', re.I)

def split(text):
    m = re.match(r'^---\n(.*?)\n---\n', text, re.S)
    if not m: return None, text
    fm = {}
    for line in m.group(1).split('\n'):
        k, _, v = line.partition(':')
        if _: fm[k.strip()] = v.strip().strip('"\'')
    return fm, text[m.end():]

def refs_block(body):
    m = re.search(r'\n#{2,3}\s*(?:参考|References|出典|引用|Sources)[^\n]*\n(.*?)(?=\n#{2,3}\s|\Z)', body, re.S)
    return m.group(1) if m else ''

def check(path):
    text = open(path, encoding='utf-8').read()
    fm, body = split(text)
    blocking, warn = [], []
    if fm is None:
        return ['frontmatter が無い'], []
    for k in ('title', 'date', 'excerpt', 'author', 'category'):
        if not fm.get(k): blocking.append(f'frontmatter に {k} が無い')
    if fm.get('category') and fm['category'] not in CATS:
        blocking.append(f'category が規定外: {fm["category"]}')
    # ④ MDX 生記法
    if re.search(r'<[A-Za-z]+[\s>]', body) or re.search(r'^:::', body, re.M) or re.search(r'\)\{\.', body) or re.search(r'^import\s', body, re.M):
        blocking.append('MDX が落ちる記法(<タグ>/:::/{.class}/import)が本文にある')
    # ④-2 生成の残骸・存在しない診療施設(2026-09-27 全件監査で見つかった型)
    for pat, msg in (
        (r'提供された参考文献はありません|論文が見つかりませんでした|参考URL/PMID|Tier A/B|Tier B|Please insert specific PMID|PMID: N/A', '生成テンプレの残骸が本文に残っている'),
        (r'デモ用|demo-(?:jp|en)\.png', 'ダミーデータの図(デモ用)を参照している'),
        (r'当院|当クリニック|ご来院', '存在しない診療施設(当院)を示す語がある(ttcguide.co は書籍・情報サイト)'),
        (r'^TW:|Your feelings are valid|感情は有効', '生成プロンプト由来の定型句(TW:/Your feelings are valid)が残っている'),
    ):
        if re.search(pat, body, re.M): blocking.append(msg)
    # ① PMID 台帳
    pmids = set(a or b for a, b in re.findall(r'PMID[:\s]*(\d{5,8})|pubmed\.ncbi\.nlm\.nih\.gov/(\d{5,8})', text))
    unknown = sorted(p for p in pmids if p not in LEDGER)
    for p in unknown: blocking.append(f'台帳に無い PMID {p} (PubMedで確認して pmid_titles.json に登録)')
    # ③ 書誌の余計な情報
    rb = refs_block(body)
    if re.search(r'10\.\d{4,9}/', rb): blocking.append('参考文献に DOI がある(題名+PMID だけにする)')
    if re.search(r'PMC\d{5,}', rb): blocking.append('参考文献に PMC 番号がある(題名+PMID だけにする)')
    if re.search(r'\d+\(\d+\):\s*[\dA-Za-z]+', rb): blocking.append('参考文献に 巻(号):頁 がある(題名+PMID だけにする)')
    # ② インライン引用の照合
    known = {p: LEDGER[p] for p in pmids if p in LEDGER}
    PUBLISHERS = ('Wolters Kluwer', 'McGraw-Hill', 'Elsevier', 'Springer', 'Cambridge', 'Oxford', 'Wiley', 'Lippincott', 'Medscape')
    main_text = body.replace(rb, '') if rb else body
    for m in re.finditer(r'[（(]([^（）()]{2,80}?)[）)]', main_text):
        inner = m.group(1)
        if any(pub in inner for pub in PUBLISHERS): continue
        for cm in re.finditer(r'([A-Z][A-Za-z\'\-]+(?:\s+[A-Z][A-Za-z\'\-]+)?)\s*(?:[A-Z]{1,3}\b)?,?\s*(?:et\s+al\.?,?\s*)?(?:[^;,]*?,\s*)?((?:19|20)\d{2})', inner):
            surname, year = cm.group(1).split()[-1] if not re.match(r'^(van|de|von|del|da)\s', cm.group(1)) else cm.group(1), cm.group(2)
            ok = any(surname.lower() in [a.lower() for a in L.get('authors', [])] and year in (L.get('year'), L.get('pubyear')) for L in known.values())
            if not ok: blocking.append(f'インライン引用 ({inner[:50]}) が参考文献のPMID(著者・年)と合わない')
    # ⑥⑦ 型B
    if not pmids and EVIDENCE.search(body):
        warn.append('「臨床試験で/研究で示され/メタ解析」等があるのに PMID が無い(型B: 枕詞を消すか PMID を付ける)')
    if not pmids and re.search(r'\d+(?:\.\d+)?\s*[%％倍]', (fm.get('title', '') + ' ' + fm.get('excerpt', ''))):
        warn.append('title/excerpt に数値(%・倍)があるのに PMID が無い(型B)')
    return blocking, warn

def main():
    files = sys.argv[1:] or sorted(glob.glob(os.path.join(ROOT, 'src/content/blog/*/*.mdx')))
    ng = nw = 0
    for f in files:
        b, w = check(f)
        rel = os.path.relpath(f, ROOT)
        if b:
            ng += 1; print(f'\n✗ {rel}'); [print('    ' + x) for x in b]
        if w:
            nw += 1; print(f'\n△ {rel}'); [print('    ' + x) for x in w]
    print(f'\n門: {len(files)}本 / 公開できない {ng}本 / 警告 {nw}本')
    sys.exit(1 if ng else 0)

if __name__ == '__main__':
    main()
