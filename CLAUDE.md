# KDP 書籍販売マーケティング事業 — 完全引き継ぎ書

**最終更新:** 2026-04-17
**対象:** webpage.new (my-book-site) + reels-factory の2リポ（book ブランドのみ）
**除外:** hiroo-open（美容皮膚科。分離済み、別プロジェクトとして独立運用）

---

## 1. 事業概要

- **事業:** 生殖医療（不妊治療）書籍の Amazon KDP 販売促進
- **著者:** 現役の生殖専門医（取締役 = オーナー）
- **AI の役割:** CEO / CTO として戦略立案・実装・運用を全面委任されている。取締役は実務に入らない
- **書籍:** 日本語版 + 英語版の計2冊
- **Amazon リンク:**
  - JP: `https://amazon.co.jp/dp/B0F7XTWJ3X`
  - EN: `https://amzn.to/4tRV6qk`（取締役指定の短縮 URL）
- **30日戦略書:** `webpage.new/strategy.md`（2026-04-15 起案・取締役承認済）

---

## 2. リポジトリ構成

### webpage.new（= my-book-site）
- **GitHub:** `educatepress/my-book-site`（最新: `2560119`）
- **技術:** Next.js（App Router）+ TypeScript + Tailwind
- **Vercel デプロイ:** `https://ttcguide.co`
- **役割:**
  - LP（日本語 `/` + 英語 `/en`）
  - ブログ（`src/content/blog/jp/` + `src/content/blog/en/`、MDX）
  - Vercel Cron（6本の自動化 API）
  - Slack 承認ハンドラ（`/api/slack/interactive`）
  - X 自動投稿（GitHub Actions `daily-x-post.yml`）
  - ブログ自動生成（`scripts/content-gen/write-blog-from-queue.ts`）
  - コンテンツキュー管理（`scripts/content-gen/content-queue.json`、106件）

### reels-factory
- **GitHub:** `educatepress/reels-factory`（最新: `9119c0b`）
- **技術:** Remotion 4.0 + React 19 + TypeScript + Tailwind v4
- **役割:**
  - PubMed ベースの Deep Research（`scripts/research-auto.ts`）
  - リール動画生成（Remotion + Google Cloud TTS + Whisper）
  - Instagram カルーセル生成（10枚スライド PNG）
  - Google Drive アップロード + Cloudinary CDN
  - Slack 承認メッセージ送信
  - Make.com webhook でIG投稿トリガー

---

## 3. システムアーキテクチャ

```
[Topics Bank / ThemeSchedule]  ← Google Sheets
         │
    ┌────┴────────────────────────────┐
    │                                 │
[reels-factory]                 [webpage.new Vercel Cron]
 GitHub Actions (05:00 JST)      auto-generator-text (15:00 JST)
    │                             auto-generator-visual (15:05 JST)
    ├─ research-auto.ts              │
    ├─ generate-script.ts        Gemini 2.5 Flash で
    ├─ generate-voice.ts         Blog + X + Reel + Carousel を生成
    ├─ render (Remotion)             │
    ├─ upload-to-drive.ts        Google Sheets Queue に pending 追加
    └─ Cloudinary upload             │
         │                      pre-patrol cron (15:15 JST)
         │                       AI 監査 → Slack 承認メッセージ
         │                           │
         └──── Slack ────────────────┘
                  │
           取締役「承認」クリック
                  │
         /api/slack/interactive
          ├─ status = 'approved'
          ├─ scheduled_date = 翌日 JST
          └─ reels-factory 系: 即 Make.com → IG 投稿
                  │
         daily-publisher cron (10:00 JST)
          ├─ X: Twitter API v2 で投稿
          ├─ Blog: GitHub API で my-book-site にコミット → Vercel 自動デプロイ
          └─ IG: Make.com webhook 発射
```

---

## 4. Vercel Cron（webpage.new）

| パス | UTC | JST | 役割 |
|---|---|---|---|
| `/api/cron/daily-publisher` | 01:00 | 10:00 | approved + 今日の scheduled_date を投稿 |
| `/api/cron/post-patrol` | 01:30 | 10:30 | 投稿後のコンプライアンス監査 |
| `/api/cron/x-monitor` | 03:00 | 12:00 | X 投稿のパフォーマンス監視 |
| `/api/cron/auto-generator-text` | 06:00 | 15:00 | Blog + X テキスト生成 |
| `/api/cron/auto-generator-visual` | 06:05 | 15:05 | Reel + Carousel 生成 |
| `/api/cron/pre-patrol` | 06:15 | 15:15 | AI 監査 → Slack 承認送信 |

### GitHub Actions（webpage.new）
| ワークフロー | スケジュール | 役割 |
|---|---|---|
| `daily-x-post.yml` | 00:00 UTC (09:00 JST) | ThemeSchedule から X 投稿 |

### GitHub Actions（reels-factory）
| ワークフロー | スケジュール | 役割 |
|---|---|---|
| 本体の cron | 20:00 UTC (05:00 JST) | research → script → render → upload → Slack |

### macOS launchd（ローカル fallback）
| plist | 役割 |
|---|---|
| `com.ttcguide.daily-blog-publish.plist` | ブログ生成 + git push（09:00 JST）|

---

## 5. Google Sheets キュー管理

- **スプレッドシート ID:** `1HkBDRsLcCyyx59CdgU-H-LoVIAM6KkC9NPqMjtAfpsY`
- **認証:** サービスアカウント方式（OAuth は廃止済み）
- **シート構成:**
  - `シート1`（メインキュー）: 18列 A〜R
  - `Topics`（ネタ帳）: theme_id, brand, theme_text, status, used_date
  - `ThemeSchedule`（X投稿スケジュール）: date, brand, themeArea, theme, ...
  - `prompts`（ブランド別プロンプト設定）: brand, persona, target_audience, ...

### HEADERS（18列 — sheets.ts と sheets-rest.ts で完全一致必須）
```
content_id, brand, type, title, cloudinary_url, cloudinary_public_id, gdrive_url,
generation_recipe, status, patrol_pre_result, scheduled_date, post_url,
posted_at, patrol_post_result, cloudinary_deleted, slack_ts, error_detail, ymyl_evidence
```

### ステータスフロー
```
pending → (pre-patrol) → pending (patrol_pre_result='done')
  → (Slack承認) → approved (scheduled_date=翌日JST)
  → (daily-publisher) → posted
```

---

## 6. 環境変数

### webpage.new（Vercel + .env.local）

| 変数 | 用途 | 備考 |
|---|---|---|
| `GEMINI_API_KEY` | Gemini 2.5 Flash（コンテンツ生成・AI監査） | |
| `GOOGLE_SERVICE_ACCOUNT_JSON` | Google Sheets 認証（JSON文字列） | Vercel 必須 |
| `GOOGLE_SHEETS_QUEUE_ID` | スプレッドシート ID | |
| `SLACK_BOT_TOKEN` | Slack Bot（book 用 App） | `xoxb-...` |
| `SLACK_CHANNEL_ID` | `#ttcpreconception_co` | |
| `TWITTER_API_KEY` | X JP アカウント | |
| `TWITTER_API_SECRET` | | |
| `TWITTER_ACCESS_TOKEN` | | |
| `TWITTER_ACCESS_SECRET` | | |
| `EN_TWITTER_API_KEY` | X EN アカウント | |
| `EN_TWITTER_API_SECRET` | | |
| `EN_TWITTER_ACCESS_TOKEN` | | |
| `EN_TWITTER_ACCESS_SECRET` | | |
| `GITHUB_TOKEN` | ブログ自動コミット用 | |
| `CRON_SECRET` | Vercel Cron 認証 | |
| `MAKE_PUBLISH_WEBHOOK_URL` | Make.com → IG 投稿 | |
| `CLOUDINARY_CLOUD_NAME` | `dunz2fvdw` | |
| `CLOUDINARY_API_KEY` | | |
| `CLOUDINARY_API_SECRET` | | |
| `PEXELS_API_KEY` | 素材動画 | |
| `OPENAI_API_KEY` | Whisper（音声タイムスタンプ） | |

### reels-factory（.env）

| 変数 | 用途 |
|---|---|
| `GEMINI_API_KEY` | リサーチ + スクリプト生成 |
| `GOOGLE_SERVICE_ACCOUNT_JSON` | Google Sheets / Drive 認証 |
| `GOOGLE_DRIVE_FOLDER_ID` | `1uuQ5eu4LP7l5LnXT1hnVj885jvIYLtZ_` |
| `GOOGLE_SHEETS_QUEUE_ID` | 同上（共有スプレッドシート） |
| `SLACK_BOT_TOKEN` | Slack 承認メッセージ送信 |
| `SLACK_CHANNEL_ID` | `#ttcpreconception_co` |
| `MAKE_WEBHOOK_URL` | Make.com 元祖 webhook |
| `MAKE_PUBLISH_WEBHOOK_URL` | Make.com 公開用 webhook |
| `CLOUDINARY_*` | 動画/画像 CDN |
| `PEXELS_API_KEY` | 背景動画素材 |
| `OPENAI_API_KEY` | Whisper |

---

## 7. 外部サービス連携

### Slack
- **App 名:** Reels Factory Bot（book 専用）
- **Interactive URL:** `https://www.ttcguide.co/api/slack/interactive`
- **Interactivity:** ON
- **チャンネル:** `#ttcpreconception_co`
- **用途:** 承認ボタン（approve/reject）、AI 監査結果スレッド、エラー通知
- **注意:** atelier 用は別 App（`hiroo-open.com` 宛）に分離済み

### Make.com
- **用途:** Slack 承認後に Instagram へカルーセル/リールを自動投稿
- **フロー:** Node.js → webhook POST → Make scenario → IG Business API
- **webhook ペイロード:**
  ```json
  { "type": "carousel", "title": "slug", "brand": "book", "cloudinary_url": "...", "captionText": "..." }
  ```
- **注意:** `MAKE_IG_PUBLISH_WEBHOOK_URL` と `MAKE_PUBLISH_WEBHOOK_URL` は同じ用途だが名前が不統一。daily-publisher に fallback チェーン実装済み

### Cloudinary
- **アカウント:** `dunz2fvdw`
- **用途:** リール MP4 + カルーセル PNG の公開 URL 生成（IG API が要求）
- **アップロード:** `reels-factory/scripts/upload-to-drive.ts` が実行

### Google Drive
- **サービスアカウント鍵:** `reels-factory/credentials/drive-service-account.json`
- **フォルダ ID:** `1uuQ5eu4LP7l5LnXT1hnVj885jvIYLtZ_`
- **用途:** batch-data.json + カルーセル/リール素材の保管

### Twitter / X
- **JP アカウント:** daily-x-post.yml + daily-publisher cron
- **EN アカウント:** daily-x-post.yml（EN_TWITTER_* キー）
- **API バージョン:** v2（tweet エンドポイント）
- **データソース:** ThemeSchedule シート（date + brand='book' でマッチ）

---

## 8. 主要ファイルマップ

### webpage.new
```
src/lib/
├── sheets.ts           ← キュー管理の中核（サービスアカウント認証、18列 HEADERS）
├── sheets-rest.ts      ← Slack handler 用（content_id ベース更新）
├── brand.ts            ← Brand 型 + brandBadge()（book 専用に簡略化済み）
└── env-helper.ts       ← 環境変数 fallback

src/app/api/
├── slack/interactive/route.ts  ← Slack 承認ハンドラ（scheduled_date=翌日JST）
├── cron/daily-publisher/       ← 日次投稿（X/Blog/IG）
├── cron/pre-patrol/            ← AI 監査 + Slack 承認送信
├── cron/auto-generator-text/   ← Blog + X テキスト生成
├── cron/auto-generator-visual/ ← Reel + Carousel 生成
├── cron/post-patrol/           ← 投稿後監査
├── cron/x-monitor/             ← X パフォーマンス監視
└── patrol/pre-audit/           ← コンプライアンス監査 API

scripts/content-gen/
├── write-blog-from-queue.ts    ← ブログ生成パイプライン（P0バグ修正済み）
├── write-x-from-queue.ts       ← X 投稿生成
├── content-queue.json          ← ローカルキュー（106件）
├── queue-manager.ts            ← キュー操作ユーティリティ
├── generate-daily-blog.ts      ← 日次ブログ生成
├── carousel-prompt-en.md       ← EN カルーセルプロンプト ★改変禁止
└── carousel-prompt-template.md ← JP カルーセルプロンプト ★改変禁止

scripts/daily-blog-publish.sh   ← launchd 用シェル（ブログ生成 + git push）
```

### reels-factory
```
scripts/
├── pipeline.ts          ← 全工程一気通貫（research→script→voice→render→upload→slack）
├── research-auto.ts     ← PubMed + Gemini で日次2トピック生成
├── generate-script.ts   ← リール台本（5幕構造）
├── generate-voice.ts    ← Google Cloud TTS (WaveNet)
├── generate-carousel.ts ← カルーセル JSON 生成
├── render-carousel.ts   ← Remotion で PNG レンダリング
├── render-auto.ts       ← 自動レンダリング
├── batch-generate.ts    ← バッチ動画生成
├── upload-to-drive.ts   ← Drive + Cloudinary アップロード
├── send-slack-approval.ts ← Slack 承認メッセージ
├── fetch-pexels-video.ts  ← 背景動画取得
└── plan-10day-themes.ts   ← 10日分テーマ計画

src/
├── ReelComposition.tsx  ← Remotion リール構成
├── carousel/            ← カルーセルスライド構成
├── Root.tsx             ← Remotion ルート
└── schema.ts            ← Zod スキーマ

docs/
├── *_原稿案.txt         ← 日付別リサーチ結果
├── deep-research-*/     ← Deep Research プロンプト集
├── research-sessions/   ← PubMed セッションログ
└── logs/                ← パイプライン実行ログ
```

---

## 9. 過去の障害と対策

| # | 障害 | 原因 | 修正 | 日付 |
|---|---|---|---|---|
| 1 | ブログ6日間停止 | `write-blog-from-queue.ts` の拡張子消失（コミット `b83000d` で削除） | `.ts` ファイル再作成 + import 修正 + retry ロジック追加 | 04-15 |
| 2 | Slack承認が反映されない | `sheets-rest.ts` HEADERS から `brand` 欠落 → status が1列ズレて書き込み | HEADERS を 18列に統一 | 04-16 |
| 3 | Sheets API 認証失敗 | OAuth Refresh Token 失効 (`invalid_grant`) | サービスアカウント方式に移行 | 04-16 |
| 4 | 承認後のアイテムが投稿されない | `scheduled_date = today` だが cron は翌朝実行 → 孤立 | `scheduled_date = tomorrowJst` に修正 | 04-15 |
| 5 | IG投稿がスキップされる | `MAKE_IG_PUBLISH_WEBHOOK_URL` 未定義（`MAKE_PUBLISH_WEBHOOK_URL` のみ） | fallback チェーン追加 | 04-17 |
| 6 | Gemini 503 でブログ生成失敗 | API 過負荷（一時的） | 指数バックオフ retry 追加（最大5回） | 04-15 |
| 7 | 同一キューアイテムで毎日失敗 | 4/7 に生成済みだが status が pending のまま（キュー状態ドリフト） | 手動で status を generated に更新 | 04-15 |

---

## 10. 厳格ルール

### プロンプト改変禁止
`scripts/content-gen/` および `reels-factory/scripts/` 配下のコンテンツ生成プロンプト（ブログ/X/リール/カルーセル用）は **医師監修済みの核資産** であり、原則として改変してはならない。エビデンスベース（PubMed 参照）の品質が担保されている。バグ修正・インフラ修復は自由。プロンプト改変が必要な場合は取締役に事前確認。

### 取締役承認が必要な事項
- 医学的主張を含むブログ記事の初出
- LP 構造変更、ブランド名義の対外発言
- 価格・キャンペーン施策
- 予算支出を伴う外部サービス追加

### AI CEO 自律裁量の範囲
上記以外のマーケ・技術・コンテンツに関する意思決定は AI が自律実行。週次レポートで事後共有。

---

## 11. 30日戦略の要点（詳細は strategy.md）

- **ノーススター:** Amazon 帰属注文（JP+US 合算）
- **Week 1:** 復旧と計測基盤確立（Plausible/UTM）— ✅ 完了
- **Week 2:** LP CTA A/B + Instagram 自動投稿開通
- **Week 3:** 英語圏スプリント（EN クラスター + hreflang + FAQ JSON-LD）
- **Week 4:** 勝ち手の倍がけ + 次月仕込み
- **EN LP の Amazon リンク:** `https://amzn.to/4tRV6qk` に差し替え必要（未実施）

---

## 12. AWS 移行メモ

### 移行対象
- `educatepress/my-book-site` (webpage.new)
- `educatepress/reels-factory`

### 移行しないもの
- `hiroo-open/` 全体（美容皮膚科。分離済み、独立 Vercel で運用）

### 移行時に注意
- Vercel Cron 6本を AWS 相当（EventBridge + Lambda 等）に移植
- GitHub Actions の daily-x-post.yml はそのまま動く（GitHub 側で実行）
- `getReelsFactoryEnv()` が `/Users/satoutakuma/Desktop/reels-factory/.env` をハードコード参照 → AWS 環境では環境変数に統一する
- `video-pool/` MP4 ファイルが git 管理外 → S3 等に移行必要
- サービスアカウント鍵（`credentials/drive-service-account.json`）→ AWS Secrets Manager 推奨

---

## 13. このファイルを読んだ Claude Code がまずすべきこと

1. `git log -5` で両リポの最新コミットを確認
2. `.env` / `.env.local` の存在と主要キーの設定を確認
3. `npx tsx -e "import('./src/lib/sheets').then(async m => { const items = await (m.default||m).getQueueItems(); console.log(items.length, 'items'); })"` で Sheets 接続確認
4. 取締役に「次に何をすべきか」を聞く
