---
description: セッション開始時にCHANGELOG.mdを確認し、最新の変更履歴を把握する
---

# 変更履歴の確認

セッション開始時に必ず実行してください。

## 手順

1. CHANGELOG.mdを確認する
```bash
cat /Users/satoutakuma/Desktop/webpage.new/CHANGELOG.md
```

2. 変更履歴の内容を把握し、必要に応じて最新のgitログと照合する
```bash
cd /Users/satoutakuma/Desktop/webpage.new && git log --oneline -10
```

## 変更を加えた場合

サイトやスクリプトに変更を加えた場合は、必ず `/deploy` の前に CHANGELOG.md を更新してください。

### 更新ルール
- 日付ごとに `### YYYY-MM-DD` セクションを追加
- 変更内容を簡潔に箇条書き
- コミットハッシュを明記
- 新機能、バグ修正、UI変更、ワークフロー変更など、カテゴリ分けする
