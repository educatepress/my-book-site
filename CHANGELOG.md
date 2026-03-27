# webpage.new — プロジェクトドキュメント & 変更履歴
<!-- AUTO-GENERATED: 2026-03-20 -->

---

## 📋 変更ログ — 2026-03-26

### feat: 投稿後パトロール（稼働監視）の完全構築
- **APIルート実装**: `src/app/api/patrol/post-audit/route.ts` にてX、ブログ、Instagramの最新投稿時間を監視し、24時間未更新であればSlack (`#post-alerts`) へ通知する死活監視機能を実装。
- **アーキテクチャの強化**:
  - `fs.readFileSync` に起因するデッドロック問題を解消。
  - Instagram監視において、Facebook APIの60日トークン更新問題を避けるため Make.com のカスタムWebhookを利用した安定した**中継方式**を採用。API Key認証（`x-make-apikey`）対応済み。
- **Cron連携**: `vercel.json` にて毎日 10:30 JST (UTC 01:30) に自動発火するよう `post-patrol` を設定。

### fix: リール＆カルーセルの品質向上と不具合解消
- **音声ダブり・途切れの根治**:
  - `generate-script.ts`（リール台本プロンプト）において、グラフ用の副音声生成を廃止し、本編台本の一部（Act 3）として自然に数値を読み上げるようAI指示を完全統合。
  - `batch-generate.ts` から不要なグラフ専用音声の生成処理を削除。
- **テロップ・被り解消**: 
  - `ReelComposition.tsx` にて、グラフ表示中のテロップY軸退避幅を `-280px` から `-420px` へ拡大し、文字サイズ（Scale）を `0.75` に縮小することで全画面グラフの視認性を確保。
- **カルーセル図解生成の強化**: 
  - `carousel-prompt-en.md` のInfographic生成ルールを緩和し、数値を積極的に探り出して図解スライドを毎度作成するようにAIへ指示出し。

### style: LPモバイル表示の最適化
- **ヒーローセクション修正**: ピンク色のテキスト帯におけるモバイル幅オーバーフローを修正（`whitespace-nowrap` 削除、`text-wrap: balance` 指定）。
- **ブログリストの余白調整**: `.prose > ul` 箇条書きグレーボックスのインデントを削り、左右パディングをスリム化してモバイルでの可読領域を拡大。

---

## 📋 変更ログ — 2026-03-25

### feat: リール動画システムの根本設計修正（コンサル結果に基づく全面改修）

**背景・問題の特定**
- AIプロンプト（1本の流れる台本）とRemotionコード（別シーンを割り込み）の設計矛盾が判明
- グラフ専用音声がメイン音声と二重再生、テロップ遅延、CTAの音声カットという3つの問題の根本原因だった

**変更ファイル (reels-factory)**

- `src/ReelComposition.tsx`
  - メイン音声のVolume関数ミュート（インフォグラフィック区間）を**完全廃止** → `volume={1.0}` でフル再生
  - グラフ表示タイミングを`dropEndFrame`固定から**`offsetWords`内の数値発話フレームを自動検出**して動的同期に変更
  - `infographicStartFrame`を数値発話フレーム-15fで自動計算、グラフ終了を`dropFrame`に設定
  - グラフの`zIndex`を`25`→`15`に変更し、テロップの**背面**に美しく配置
  - グラフ専用ナレーション音声ブロック（`infographicVoiceoverUrl`）を**完全削除**
  - サムネイルカード（2秒）の間、VoiceoverとBGMの開始を`Sequence from={THUMBNAIL_DURATION}`で遅延させ完全無音化

- `src/components/ThumbnailCard.tsx` (**新規作成**)
  - SNSマーケティング心理学を統合したプレミアムサムネイルカードコンポーネント
  - フレーム0から**完全静止画ポスター表示**（入場アニメなし） → 45-60fで上方スイープ+フェードアウト
  - Instagramのカバー画像選択用に1.5秒間ホールド（無音）
  - デザイン要素: Gold Accent Line・EVIDENCE-BASEDバッジ・82px大見出し・Dr. Takuma Sato帰属・Chevronインジケーター

- `src/components/WordByWordText.tsx`
  - Whisperが分割した数字と単位を結合する**前処理**を追加（`mergedWords`変数）
  - `「48」+「percent」` → `「48%」`、`「600」+「milligrams」` → `「600mg」` としてピタッとくっつく
  - 旧来の`replace(/\bpercent\b/gi, '%')` 処理を削除（前処理で解決済み）
  - `words.forEach`→`mergedWords.forEach`に変更し結合済みデータでグループ化

- `src/Root.tsx`
  - カルーセルスライドの定義を`<Still>`（1フレーム限定）→`<Composition durationInFrames={200} fps={30}>`に変更
  - `--frame=150`指定での静止画キャプチャが可能になり、グラフアニメーション完了後の状態を確実に取得

- `scripts/render-carousel.ts`
  - `remotion still` コマンドに `--frame=150` を追加し、アニメーション完了後をキャプチャ

- `scripts/generate-script.ts`
  - `metricLabel`の指示を「**CRITICAL: MUST perfectly match the exact wording used in Act 3**」に変更
  - `narration`フィールドをプロンプトのJSONスキーマから**完全削除**

- `src/schema.ts`
  - `InfographicDataSchema`から`narration: z.string()`フィールドを**完全削除**

**動作確認**
- `npm run batch` → `coq10-may-improve-egg-quality-what-the-data-shows.mp4`（11.7 MB）正常生成
- `npm run carousel:render` → 全11枚キャプチャ成功（slide08にグラフ含む）

---

```
⚠️  TODO (次セッション)
- カルーセル: Instagram最大10枚制限に対応（現状11枚）
  → generate-carousel.ts のプロンプト修正でグラフ込み9スライド+CTA=合計10枚に抑える
- AIパトロールシステム: route.ts + vercel.json の組み込み
```

---

## 📋 変更ログ — 2026-03-24

### feat: インフォグラフィック自動生成システム（ブログ・カルーセル・リール）

**新規ファイル**
- `scripts/generate-infographic.ts` — canvasでブログJP/EN・カルーセル用PNG自動生成
- `tsconfig.scripts.json` — scripts専用TypeScript設定（Next.jsのtsconfig競合回避）

**変更ファイル (webpage.new)**
- `scripts/content-gen/write-blog-from-queue.ts`
  - JSONスキーマに `infographic` フィールドを追加（文献から数値アウトカムを抽出）
  - PNG生成後、`## 参考` セクション直前にグラフ画像をMDXへ自動挿入
- `scripts/content-gen/carousel-prompt-en.md`
  - `infographic` フィールドをJSONスキーマに追加、Infographic Rulesセクション追記
- `package.json` — `infographic:gen` コマンドを追加

**動作確認**
- `npm run infographic:gen` → PNG3枚生成成功（CoQ10デモデータ）

---

### 📋 変更ログ — 2026-03-24（reels-factory側）

**新規ファイル**
- `src/components/InfographicChart.tsx` — Remotion製アニメーショングラフコンポーネント（バーアニメ＋カウントアップ＋ElevenLabs音声対応）

**変更ファイル (reels-factory)**
- `src/schema.ts` — `InfographicDataSchema` + `infographic` / `infographicVoiceoverUrl` フィールドを追加（nullable対応済み）
- `scripts/generate-voice.ts` — `generateVoiceTo(text, filename)` をエクスポート追加
- `scripts/generate-script.ts`
  - `ScriptOutput` インターフェースに `infographic` フィールドを追加
  - プロンプト出力スキーマ・TTS表記ルールを追加（mg→milligrams、%→percent）
  - topics.jsonにinfographicデータを含め、原稿IDと紐付け
- `scripts/batch-generate.ts`
  - dotenv読み込みを追加
  - ステップ1.5追加: ElevenLabsでinfographic専用音声を生成（`infographic-<topicId>.mp3`）
  - voice:sync後にsynced-data.jsonへinfographicデータを追記してRemotionに引き渡す
- `src/ReelComposition.tsx`
  - `infographic` / `infographicVoiceoverUrl` propsを追加
  - Heartbeat Dip後の3秒に `InfographicChart` Sequenceを挿入
  - **voiceoverをdropEndFrameのSequenceで囲み音声重複を防止**（バグ修正）
- `src/carousel/SlideRenderer.tsx` — `"Infographic"` スライドタイプを追加

**バグ修正（2026-03-24夕方）**
| # | 問題 | 修正 |
|---|---|---|
| ① | グラフシーン中メイン音声が重複再生 | voiceoverを `<Sequence durationInFrames={dropEndFrame}>` で囲み停止 |
| ② | CoQ10 600mgが「milliliters」と誤変換 | SYSTEM_PROMPTにTTS表記ルール追加（略記禁止） |
| ③ | %テロップが消える | SYSTEM_PROMPTで「percent」と表記するよう強制 |

**テスト結果**
- `npm run script:gen` → "600 milligrams"・"68 percent" で正しく出力を確認 ✅
- `npm run batch` → フル動画生成成功（12MB、963フレーム）✅

---

## 📋 自動記録 — 2026-03-20
### 2026-03-21
- fix(x-post): strictly enforce JSON structure during Gemini retries and increase max retries to 3
- chore(x-post): sync `.env` with GitHub Action Repository Secrets for complete automation stability
- docs: update CHANGELOG with 2026-03-21 automated posting stabilization

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

### 2026-03-21

#### 🐦 X / ブログ自動投稿の完全安定化（エラー対策・認証同期）
- **問題（AI出力起因）:** X自動投稿スクリプト実行時、Geminiが文字数制限を超過してリトライ処理に入る際、不完全なJSON（`jpXPostThread` または `enXPostThread` の欠落）を返し、プログラムがクラッシュする事象が多発。
- **対策（AI出力起因）:** `write-x-from-queue.ts` の自己修復（Auto-Retry）プロンプトを強化。リトライ時にも「必ずJP・EN両方の完全なJSON構造を維持して返すこと」を文字列として強く再指示し、最大リトライ回数を3回に増加。テスト実行にて3回目で自己修復し投稿が完全に成功することを確認。（コミット: `2db1e9e`）
- **問題（認証起因）:** ローカルの `.env` で認証キーを直しても、自動化サーバー（GitHub Actions）の環境変数が同期されておらず、認証エラーが継続していた。
- **対策（認証起因）:** GitHubのリポジトリ設定（Settings > Secrets and variables > Actions）の `TWITTER_API_KEY`, `EN_TWITTER_~` 等を、最新のローカル `.env` と同値に同期・更新し、サーバー上でも完全自動で稼働する環境を確立。

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
