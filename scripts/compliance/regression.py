#!/usr/bin/env python3
"""門そのものが壊れていないかを確かめる。fixtures/ の fail_* は落ち、pass_* は通り、warn_* は警告だけ。
  python3 scripts/compliance/regression.py"""
import glob, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from check_blog import check
ok = True
for f in sorted(glob.glob(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'fixtures', '*.mdx'))):
    b, w = check(f); name = os.path.basename(f)
    want_block = name.startswith('fail_'); want_warn = name.startswith('warn_')
    good = (bool(b) == want_block) and (not want_warn or (w and not b))
    print(('OK  ' if good else '★NG ') + name + ('  ' + '; '.join(b + w) if (b or w) else ''))
    ok &= good
print('回帰: 全件一致' if ok else '★回帰: 門が期待どおりに動いていない'); sys.exit(0 if ok else 1)
