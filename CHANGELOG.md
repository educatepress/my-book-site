# webpage.new — プロジェクトドキュメント & 変更履歴
<!-- AUTO-GENERATED: 2026-03-20 -->
## 📋 自動記録 — 2026-03-20

### 2026-03-19
- docs: update CHANGELOG with 2026-03-19 changes (simulator fix, preview UI, X post fix)
- fix(x-post): restore googleSearch with prompt-based JSON + robust try/catch parser for reliable fact-checked posts
- fix(x-post): remove googleSearch tool from Gemini API call to fix 400 error with structured JSON output

### 2026-03-18
- feat(preview): add 2 more preview images per lang, swipe UI with 2.5-card view and fade edge; update EN model spec link
- fix(simulator): update descriptions to match v4 spec, replace disclaimer with model spec link
- fix(simulator): move tObj definition before useMemo to prevent TDZ ReferenceError crash
- fix(simulator): use dynamic import with ssr:false to prevent client-side hydration error
- fix(build): resolve deploy errors - add use client, install recharts, rename tsx to jsx
- feat(simulator): implement dynamic i18n (ja/en) for v4 simulator
- feat(simulator): replace with v4 simulator component
- docs: update CHANGELOG with latest LP and UI improvements
- fix(lp): remove duplicated simulator cta cards from final sections
- fix(lp): set jp ogp to mockup, solve horizontal overflow on mobile, enhance en typography
- feat(simulator): apply user provided latest monte carlo simulator logic
- style(lp): change book-detail layout from two-column to single-column to fix horizontal overflow
- fix(lp): prevent horizontal scroll and differentiate ogp images for EN/JP
- fix(lp): revert EN hero book to mock-en.png and use JP video background
- style(lp): adjust preview image layout, convert SNS links to icons, fix hero image for EN, set EN review count to 12
- fix(blog): remove clinic references and redirect to book LP, update prompt
- fix(blog): change date of folic acid post to today to avoid auto-publish filter
- fix(blog): resolve mdx parsing error, replace folic acid blog, clean markdown syntax, fix text-justify layout
- docs: add CHANGELOG.md with project vision, channel strategy, and change history
- chore: update X queue status [skip ci]
- feat: replace simulator with Monte Carlo engine (3000 patient cohort), remove ChatGPT links

### 2026-03-17
- feat: auto-deploy blog workflow, robust JSON parse, new blog post, X queue update
- fix: improve tweet-on-publish workflow (duplicate guard, npx tsx), add deploy workflow
- feat: activate preview images, add ART simulator with clinical logic & disclaimer (JP/EN)

---


> **最終更新:** 2026-03-19  
> **監修:** 佐藤琢磨（生殖医療専門医）  
> **リポジトリ:** [educatepress/my-book-site](https://github.com/educatepress/my-book-site)  
> **本番URL:** https://doctors-guide-womens-health.vercel.app

---

## 🎯 プロジェクトビジョン

**「エビデンスに基づく女性の健康情報を、最も信頼できる形で届ける」**ための統合デジタルプラットフォーム。

生殖医療専門医である佐藤琢磨が監修する医学的に正確なコンテンツを、複数チャネルで有機的に連携させ、**書籍販売 → 信頼構築 → 患者教育 → 医院認知**のサイクルを自動化する。

### ターゲット
- 20〜30代の女性（妊活前〜妊活中）
- そのパートナー
- プレコンセプションケアに興味のある層

---

## 🏗️ 全体コンセプト & チャネル戦略

### チャネル構成図

```
[X (Twitter)] ← 認知・啓蒙（エビデンスベースのTips）
     ↓
[Instagram Reels] ← 視覚的な啓蒙・共感形成
     ↓
[LP (本サイト)] ← 信頼構築・書籍購入への導線
  ├─ ブログ（SEO流入）
  ├─ IVFシミュレーター（ツール価値）
  └─ 書籍紹介（購入CTA）
     ↓
[Amazon] ← 最終コンバージョン（書籍購入）
```

### 各チャネルの役割

| チャネル | 役割 | 自動化状況 |
|---------|------|-----------|
| **X (JP/EN)** | エビデンスベースの医学Tips配信。PubMed等のソースURL付き | ✅ 毎日09:00自動投稿（キューベース） |
| **ブログ (JP/EN)** | SEO流入。Gemini AIが研究データから記事生成 | ✅ 火・金 自動生成→自動デプロイ |
| **Instagram Reels** | 視覚的な啓蒙コンテンツ。感情的共感を形成 | 🔄 コンテンツカレンダー作成済み、自動生成パイプライン構築中 |
| **LP（本サイト）** | 書籍の魅力を最大限に伝える。立ち読み、レビュー、シミュレーター | ✅ Vercel自動デプロイ |
| **IVFシミュレーター** | 独自ツールとしての価値提供。SEO・SNSからの流入先 | ✅ モンテカルロエンジン（3,000人コホート） |
| **Amazon** | 最終コンバージョン先。Kindle版・ペーパーバック | — |

### 自動化パイプライン

```
[月次] リサーチデータ更新 → コンテンツキュー生成
  ↓
[毎日] X自動投稿（JP/EN、キューから1件ずつ）
[火・金] ブログ自動生成 → 自動デプロイ → X告知
[週次] Reels用コンテンツ生成（計画中）
```

---

## 📋 変更履歴

### 2026-03-19

#### 🐛 IVFシミュレーター — ランタイムクラッシュ修正
- **原因:** `tObj`（翻訳オブジェクト）が `useMemo` コールバック内で参照されていたが、`const tObj = t[lang] || t.ja;` の定義がそれよりも後ろの行にあったためTemporal Dead Zone (TDZ) の `ReferenceError` が発生
- **症状:** 初回レンダーは成功するが、30ms後にシミュレーション結果がセットされた瞬間にクラッシュ（「一瞬表示→エラー」）
- **修正:** `const tObj` の定義を `useMemo` よりも前に移動
- **コミット:** `43c94fc`

#### 📝 シミュレーター説明文の正確化
- LP（JP/EN）のシミュレーターCTA説明文から**BMI・CDC/SARTの言及を削除**し、v4の実際の仕様に合わせた内容に更新
  - 旧: 「年齢・AMH・BMI等のパラメータから…CDC/SARTの全米データに基づいた…」
  - 新: 「年齢とAMHを入力するだけで、モンテカルロ法による3,000人の仮想コホートシミュレーションを実行」
- JP/ENページの `meta description`（SEO）も同様に更新
- シミュレーター内の disclaimer「結果の解釈は担当医にご相談ください」を削除し、**モデル仕様書へのリンク**に差し替え
  - JP: [仕様書](https://docs.google.com/document/d/155aJ6seHdNveVleyPGuUdJCyqEtlOTvx/)
  - EN: [仕様書](https://docs.google.com/document/d/11HO3WyanF6R8LgTKP7Pl-ZvEQt-HKufL/)
- **コミット:** `089753e`

#### 📖 立ち読みセクションのスワイプUI改善
- 立ち読み画像を **3枚 → 5枚** に増加（JP/EN各2枚追加）
- デスクトップ表示を **2.5枚分の幅に制限**し、スワイプを促すUXに変更
- **右端フェードグラデーション**を追加（「続きがある」ことを視覚的に示唆）
- 追加画像4枚は1750px原寸から400px幅にリサイズ・圧縮（63-75KB）
- **コミット:** `7c5276f`

#### 🐦 X自動投稿スクリプト — Google Search復元 + JSONパーサー堅牢化
- **問題:** Gemini APIの `googleSearch` ツールと `responseMimeType: "application/json"` の併用が非サポート → 毎回400エラーで投稿失敗
- **修正方針:** Google Searchによるファクトチェック機能を維持しつつ、構造化出力をプロンプトベースJSON + try/catchパーサーに変更
- **3段階のJSON抽出:** (1) 全体JSON (2) コードブロック内抽出 (3) ブレース直接抽出
- 必須フィールドチェック（`jpXPostThread`, `enXPostThread`）とリトライロジックを統合
- 未使用の `Type` import を削除
- **コミット:** `d1ea601`

---

### 2026-03-18

#### 🐦 X自動投稿スクリプトの全面リファクタリング (`write-x-from-queue.ts`)
- **スレッド形式統一:** JP/EN両方を `v2.tweetThread()` によるスレッド投稿に統一（JP3〜4ツイート、EN2〜4ツイート）
- **構造化出力:** `responseMimeType: "application/json"` + `responseSchema` によりJSONパースエラーを完全排除
- **自己修復リトライ:** 文字数超過時にAIへ自動フィードバックし再生成（最大2回）
- **AI臭さ排除:** ネガティブプロンプト（定型共感文の禁止）＋ランダム切り口注入（4種）でマンネリ防止
- **医療コンプライアンス自己検閲:** `thoughtProcess`フィールドでAIが事前に医療広告ガイドライン違反を自己チェック→ログ出力
- **シャドウバン対策:** ツイート1〜2はリンク禁止、最終ツイートにのみLP URL + ソースURLを配置
- **LP送客:** 教育的文脈でLPへの誘導を最終ツイートに組み込み（JP/EN個別URL定数化）
- **コンプライアンスガードレール:** レッドライン7項目（虚偽誇大・恐怖煽り等）＋イエローライン3項目＋推奨フックパターン
- **URL検証DRY化:** `verifyThreadUrls`ヘルパー関数に抽出、LP URLの検証スキップ対応

#### 📱 LPレイアウト・UIの大幅改善 & OGP対応
- **モバイル横スクロール（見切れ）の根本解決:**
  - `globals.css` の `word-break: keep-all` を削除し、画面幅の過剰な押し広げを防止
  - 書籍立ち読みセクション（`book-detail`）を横並び2カラムから縦1カラム（目次の下）に再配置
- **英語テキストのタイポグラフィ最適化:**
  - `.font-en` に対して `text-wrap: pretty / balance` を適用し、単語・チャンク単位での自然な改行を実現
- **OGP画像（LINE・SNSシェア用）の最適化:**
  - JP版: 街の画像から書籍モックアップ（`mockup-jp.png`）へ変更
  - EN版: メタデータを追加し英語版モックアップ（`mock-en.png`）が正しくシェアされるように設定
- **その他のUI微調整:**
  - EN版Heroエリアの背景をJP版の実装に合わせ、かつ書籍モックは英語版のままに修正
  - 著者プロフィールの余分な引用符を削除し、SNSリンクをアイコンのみのシンプルな表示に統一
  - ページ最下部（Final CTA）に重複していた2つ目のシミュレーターカードを削除
  - EN版のレビュー件数を12件に統一

#### 📝 ブログ記事と設定の修正
- 「葉酸」記事が表示されないバグを修正（未来の日付設定を現在日時に修正）
- ブログおよび一覧内で散見された架空の「クリニックへの誘導」文言を全削除し、すべて書籍のLPへの案内へと差し替え

#### 🔬 IVFシミュレーター — モンテカルロエンジン差し替え (v4)
- **計算エンジンを完全刷新:** 単純な掛け算 → 3,000人仮想コホートのモンテカルロ法
- **4つの致命的バグを解消:**
  1. PGT-A正常胚の妊娠率を年齢非依存の固定値（55%）に修正
  2. 負の二項分布（Negative Binomial）を導入し、採卵数の過分散（ばらつき）を正確にモデリング
  3. Frailtyモデル（虚弱モデル）を実装し、移植不成功が続くごとの着床率低下（毎度12%減）を加味
  4. イベント駆動型のドロップアウト（胚枯渇や連続不成功による治療終了）を再現
- **追加の細かな改善:**
  - `art-simulator.tsx` を React + TypeScript (+recharts) の最新版に刷新
  - 日本語固定だったv4 UIを `lang` プロパティに基づいて英語へ完全翻訳表示できる多言語化（i18n）を実装
  - UIデザイン微調整（`text-wrap`, ツールチップ表示, ResponsiveContainerの挙動調整）
  1. PGT-A正常胚の固定確率化（年齢非依存の55%）
  2. 負の二項分布による採卵数の過分散再現
  3. Frailtyモデル（反復着床不全の確率減衰）
  4. イベント駆動型ドロップアウト（胚ゼロ・移植失敗時の離脱）
- **ChatGPTシミュレーターへの外部リンクを完全削除**（JP/EN両方のLP）
- 内製シミュレーター(`/simulator`, `/en/simulator`)へのCTAに差し替え
- `sticky-cta`の拡張子欠損（`.tsx`なし）を修正
- **コミット:** `4ddfc52`

---

### 2026-03-17

#### 🚀 ワークフロー自動化 & ブログ・X投稿テスト
- `auto-blog-post.yml`: PR作成方式 → main直接push方式に変更（自動デプロイ）
- `tweet-on-publish.yml`: `ts-node` → `npx tsx`、`git diff`で新規追加ファイルのみ検出（重複投稿防止）
- `post-to-twitter.ts`: `TARGET_FILE`環境変数対応（GitHub Actionsから投稿対象を明示）
- `auto-generate.ts`: JSONパース堅牢化（3段階フォールバック）
- ブログ自動生成テスト成功:「プレコンセプションケアって何？今日からできること」
- X投稿テスト成功: EN版スレッド投稿（排卵日タイミングの誤解）
- 重複ファイル3件削除（`content-queue 2.json`, `write-x-from-queue 2.ts`, `auto-blog-post 2.yml`）
- `/deploy`ワークフロー作成（AGセッション用自動デプロイ手順）
- **コミット:** `d2f5749`, `ce0444d`

#### 📊 シミュレーター計算ロジック開示 & 免責事項
- 計算ロジックのアコーディオン（折りたたみ式）追加（JP/EN）
  - サイクルの臨床的定義
  - 各要因の影響と確率減衰モデルの解説
- 免責事項（常時表示・柔らかいトーン）追加（JP/EN）
- **コミット:** `924143e`（→ `9ebdd19`に統合）

#### 📸 立ち読み画像 & ARTシミュレーター内製化
- 立ち読み画像6枚の有効化（JP3枚 + EN3枚）
- 画像リサイズ（500KB→54〜87KB、約90%削減）
- ARTシミュレーターの新規作成（`/simulator`, `/en/simulator`）
- JP版LPにシミュレーターCTAセクション追加
- `.git`破損によりgit履歴リセット＆force push
- **コミット:** `9ebdd19`

---

### 2026-03-16（以前の作業からの参照）

#### ブログ自動生成システム
- Gemini AIによるJP/ENブログ記事の自動生成
- Reelsコンテンツカレンダーとのテーマ同期
- コンテンツキューシステム（`content-queue.json`）

#### X自動投稿システム
- 日次X投稿（JP/EN）の自動化
- URL検証機能（ハルシネーション防止）
- PubMed等のソースURL必須

#### LP構築
- 著者プロフィールセクション（SNSリンク付き）
- レビューセクション
- FAQ（アコーディオン）
- 書籍購入CTA（Amazon）
- 横方向はみ出し修正（overflow-x-clip）

---

## 🔧 技術スタック

| カテゴリ | 技術 |
|---------|------|
| フレームワーク | Next.js 16 (App Router) |
| 言語 | TypeScript, React |
| ホスティング | Vercel (自動デプロイ) |
| CI/CD | GitHub Actions |
| AI | Gemini 2.5 Flash (ブログ・X生成) |
| SNS連携 | Twitter API v2 (JP/EN) |
| コンテンツ | MDX (ブログ記事) |

---

## 📁 主要ファイル構成

```
webpage.new/
├── src/
│   ├── app/
│   │   ├── page.tsx              # JP LP
│   │   ├── en/page.tsx           # EN LP
│   │   ├── simulator/page.tsx    # JP シミュレーター
│   │   ├── en/simulator/page.tsx # EN シミュレーター
│   │   ├── blog/                 # JP ブログ
│   │   └── en/blog/              # EN ブログ
│   ├── components/
│   │   ├── common/
│   │   │   └── art-simulator.tsx # シミュレーター本体
│   │   ├── lp/                   # JP LPコンポーネント
│   │   └── lp-en/                # EN LPコンポーネント
│   └── content/blog/             # MDXブログ記事
├── scripts/content-gen/          # 自動生成スクリプト
├── .github/workflows/            # GitHub Actions
│   ├── auto-blog-post.yml        # ブログ自動生成→デプロイ
│   ├── daily-x-post.yml          # X日次投稿
│   ├── tweet-on-publish.yml      # ブログ公開時X告知
│   └── queue-check-notify.yml    # キュー残量通知
└── .agents/workflows/
    └── deploy.md                 # AGセッション用デプロイ手順
```
