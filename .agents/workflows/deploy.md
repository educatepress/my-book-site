---
description: サイト変更後にgit commit/push/Vercelデプロイを実行するワークフロー
---

# デプロイワークフロー

サイト (`webpage.new`) に変更を加えた後、以下の手順でデプロイします。

// turbo-all

## 手順

1. 変更内容をビルドして検証する
```bash
cd /Users/satoutakuma/Desktop/webpage.new && npx next build
```

2. 変更をgitにステージ
```bash
cd /Users/satoutakuma/Desktop/webpage.new && git add -A
```

3. コミットメッセージを作成してコミット（メッセージは変更内容に合わせて変更）
```bash
cd /Users/satoutakuma/Desktop/webpage.new && git commit -m "変更内容の説明"
```

4. mainブランチにpush（Vercelが自動でビルド＆デプロイ）
```bash
cd /Users/satoutakuma/Desktop/webpage.new && git push origin main
```

5. デプロイ確認（Vercelダッシュボードまたは本番URL）
- 本番URL: https://doctors-guide-womens-health.vercel.app
- Vercelダッシュボード: https://vercel.com/ganapati1201-3732s-projects/webpage-new

## 注意事項
- git push時に認証を求められた場合は `educatepress` / PAT(Personal Access Token) を入力
- push後約30秒〜1分でVercelが自動デプロイを完了
- 画像ファイルを追加する場合は、事前に適切なサイズにリサイズすること（Webプレビューは400px幅で十分）
