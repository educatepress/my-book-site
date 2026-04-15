# 30日 KDP売上爆増 戦略書 / AI CEO 経営計画

**発効日:** 2026-04-15
**期間:** 2026-04-15 〜 2026-05-14（30日間）
**起案:** AI CEO
**承認者:** 取締役（=オーナー）
**対象事業:** 生殖医療書籍 Amazon KDP 販売（JP版 + EN版、計2タイトル、ASIN B0F7XTWJ3X 基軸）

---

## 0. エグゼクティブ・サマリー

### 現状診断（2026-04-15 時点、実地監査結果）
| 領域 | 状態 | 備考 |
|---|---|---|
| LP（JP/EN） | 稼働 | ただし **EN LP が amazon.co.jp に誘導**（致命的ミス）、UTMなし、計測なし |
| ブログ | **停止中（6日間）** | `daily-blog-publish.sh` が `write-blog-from-queue.ts` を呼ぶが実体は拡張子無し。6日連続失敗 |
| X自動投稿 | 稼働見込み | GitHub Actions `daily-x-post.yml` 存在、要検証 |
| Instagram | **未自動化** | reels-factory でカルーセル生成はできるが自動投稿経路が未実装 |
| リール/カルーセル生成 | 稼働 | Remotion + Gemini + PubMed、2026-04-15 成功 |
| 研究エンジン | 稼働 | PubMed→Gemini で日次2トピック、医学的妥当性あり |
| 計測基盤 | **不在** | GA4/Plausible/UTM 全て未実装、意思決定がブラインド |
| コンテンツキュー | 劣化 | 106件中 約15%が重複テーマ |

### 戦略の核
**30日を「計測基盤 → 収益修復 → 英語圏拡張 → 最適化」の4波で駆動する。**
初週の主眼は売上ではなく **観測可能性の確立**。計測なき最適化は迷信であり、これを放置したまま広告やSNSを回しても学習が蓄積しない。

### 30日ノーススター
**Amazon JP + US 合計の帰属注文件数**（UTM + 遷移ログから推計）。
副KPIはすべてこれに従属する。

---

## 1. 経営体制（ガバナンス）

### 1.1 役割定義
| レイヤー | 担当 | 責任範囲 | 裁量 |
|---|---|---|---|
| **取締役（オーナー）** | あなた | 方針承認、医学的ファクトチェック赤入れ、ブランド可否判断 | 拒否権／最終承認 |
| **AI CEO** | 本書起案者 | 戦略策定、日次経営判断、KPIレビュー、部門横断調整 | P0対応・軽微な仕様変更は即決 |
| **Content Studio** | reels-factory リポジトリ | 動画・カルーセル・音声・リサーチ | トピック選定、原稿生成 |
| **Growth / Storefront** | webpage.new リポジトリ | LP・ブログ・SEO・X投稿・Amazon導線 | CTA文言A/B、内部リンク設計 |
| **QA / 医療監修** | 取締役 | 医学的誤りの最終チェック | 投稿差し止め権 |

### 1.2 承認ゲート（取締役判断が必要なもの）
- 医学的主張を含むブログ記事の初出
- 新規LP構造変更、ブランド名義の対外発言
- 価格・キャンペーン施策
- 予算支出を伴う外部サービス追加（Ads等）

**上記以外は AI CEO が自律判断・実行し、週次レポートで事後共有。**

### 1.3 日次・週次リズム
- 毎朝 09:00 JST: 日次ダッシュボード（AI CEO 自動生成 JSON）
- 毎週月曜: 週次レビュー（KPI・失敗・次週3優先課題）
- 毎日 Slack: パイプライン失敗 → 即通知 → AI CEO が一次対応

---

## 2. 北極星指標（KPIツリー）

### 2.1 ノーススター
**Amazon 帰属注文（JP + US 合算、UTM経由）**
- Baseline: 現在ゼロ測定（= 0として扱う）
- 30日目標: 週次20件 → 週次60件（3倍成長カーブ）

### 2.2 一次KPI（週次で追跡）
| 指標 | 現状 | 30日目標 | 改善ロジック |
|---|---|---|---|
| LP→Amazon CTR | 不明 | 8% 以上 | 証拠ブロック追加、CTA文言A/B、言語別ストア振り分け |
| X プロフィール→LP クリック率 | 不明 | +60% | スレッド末尾のみリンク、医師権威訴求で固定ツイート刷新 |
| ブログ→Amazon CTR | 不明 | 5% 以上 | FAQ構造化、「続きは書籍で」カード設置 |
| 日次投稿成功率 | 推定 50% 以下 | 95% 以上 | P0バグ修正、idempotency key、先行バリデーション |
| EN トラフィック比率 | <15% 推定 | 25% | EN LP の amazon.com 差し替え、EN固有記事5本 |

### 2.3 二次KPI
- メール/LINE 登録（LP リード獲得、現状ゼロ → Week3 から計測）
- 投稿→LP 到達の bounce rate
- 重複コンテンツ比率（目標 <5%）
- 制作リードタイム（トピック着想 → 投稿完了までの時間）

---

## 3. 戦略の柱

### 柱1: 医師の権威を使った変換ファネル
**X/IG（気づき） → Blog（信頼） → LP（確信） → Amazon（購入）**
各段で「現役生殖専門医」「PubMed ベース」を必ず1要素含める。

### 柱2: 日英二軸の需要獲得
- JP: 変換重視。補助金・PCOS・AMH など検索意図の強いテーマ。
- EN: 新規市場開拓。日本在住 expat + 世界の evidence-based 層。
- **EN は直訳ではなく EN ネイティブ角度で書き直す**（文化・制度の前提が違う）。

### 柱3: トピッククラスター戦略
ハブ記事（各書籍の核テーマ） + スポーク記事（周辺FAQ）で内部リンク構造化。
対象ハブ: 「妊活を始める日」「AMH と卵子凍結の現実」「男性因子とライフスタイル」の3本を30日内に完成。

### 柱4: 常時自動化・例外時のみ手動介入
AI CEO が 95% を自律で回す。取締役は医療ファクトチェックの赤入れのみ。

---

## 4. 30日実行カレンダー

### Week 1（04/15 - 04/21）: 復旧と計測
**テーマ: 観測可能性の確立。売上はここでは見ない。**

**P0（48時間以内、遅延許容なし）**
1. ブログパイプライン復旧
   - `scripts/content-gen/write-blog-from-queue` → `.ts` リネーム
   - または `scripts/daily-blog-publish.sh:39` の呼び出し修正
   - 両環境（launchd / Vercel cron）でドライラン → 本番再開
2. **EN LP のAmazonリンクを amazon.com の EN ASIN に差し替え**
   - `src/components/lp-en/hero-en.tsx:109`, `final-cta-en.tsx`, `before-after-en.tsx`
   - EN ASIN が未発行なら取締役に24h以内に確認要請
3. 全 Amazon CTA に UTM 付与
   - `utm_source` = `lp` | `blog` | `x` | `ig`
   - `utm_medium` = `cta` | `inline` | `sticky`
   - `utm_campaign` = `202604-launch`
   - `utm_content` = バリアント識別子
4. 計測導入: **Plausible** または **GA4**（軽量理由で Plausible 推奨）を `layout.tsx` に埋め込み、LP・ブログ・EN版の全ページ配信

**P1（7日以内）**
5. コンテンツキューのハッシュ重複排除（`theme + sourceUrls` ベース）
6. 投稿 idempotency key 導入（同一記事二重投稿防止）
7. スケジューラ一元化: Vercel cron を primary、launchd を fallback のみに格下げ
8. 「no-post-in-24h」アラート（Slack通知）
9. reels-factory の `video-pool/` を Git LFS or 別ストレージに移行して CI 再現性確保
10. LP ヒーロー直下に「証拠ブロック」追加（医師資格 + PubMed根拠2件 + 読了10分で得るもの3つ）

**Week 1 完了基準（Gate）**
- [ ] ブログが3日連続で自動投稿成功
- [ ] Amazonリンクの全 UTM 化完了
- [ ] Plausible 稼働、LP/Blog/EN版のクリック計測できている
- [ ] EN LP が amazon.com に正しく遷移

### Week 2（04/22 - 04/28）: 変換ブースト
**テーマ: 計測基盤が動き始めた。CTR と滞在を上げる。**

- LP CTA の A/B: ベネフィット訴求 vs 緊急性訴求（恐怖煽りNG）、JP/EN 各2バリアント
- 「evidence digest」シリーズ開始
  - JP: 補助金最新動向 / PCOS & AMH の読み方 / 子宮内膜症ガイドライン
  - EN: AMH myths / Male fertility environmental factors / CoQ10 nuance
- ブログ内に「次に読む」「書籍の該当章CTA」ブロック追加
- X 固定ツイート刷新（医師肩書 + 書籍リンク + 社会的証明）
- Instagram 自動投稿経路を確立: reels-factory のカルーセル PNG → Make.com webhook → IG Business API
  - 現状 Instagram 自動化が **最大のリーチ死角**。Week 2 の最優先構築

**Week 2 完了基準**
- [ ] LP CTA A/B が各言語で稼働、1バリアントあたり最低200セッション
- [ ] IG 自動投稿 3日連続成功
- [ ] ブログCTAクリック率が Week1 比 +20%

### Week 3（04/29 - 05/05）: 英語圏スプリント
**テーマ: EN を実需に変える。**

- EN クラスター拡張（検索ボリューム上位3テーマ）
  - AMH interpretation
  - Egg freezing realism（米国の現実とコスト）
  - Male-factor fertility and lifestyle
- JP 上位5投稿を EN ネイティブ角度で書き直し（直訳禁止）
- IG カルーセル 10本バッチ（JP6 + EN4）
- X で EN ツイート頻度を週3 → 週7 に引き上げ
- EN SEO: hreflang タグ、FAQ 構造化データ（JSON-LD）を blog テンプレに実装

**Week 3 完了基準**
- [ ] EN 流入が全体の 20% 超
- [ ] EN Amazon CTR が JP CTR の 50% 以上に接近
- [ ] FAQ 構造化データが Google Rich Result Test で緑

### Week 4（05/06 - 05/14）: 最適化と次月仕込み
**テーマ: 勝ち手を倍がけし、負け手を切る。**

- CTR 上位 20% のトピック・CTA文言のみ残し、それ以外停止
- 投稿時間帯を CTR 実績で絞り込み
- JP/EN 各1本の「月次 evidence digest」柱記事を発行
- 次30日分のコンテンツキューを **CTR × 売上相関** で並び替え再構築
- 30日総括: ノーススター達成度、KPI別パフォーマンス、次期戦略草案

**Week 4 完了基準**
- [ ] Amazon 帰属注文が週次 60件を超える
- [ ] 次30日戦略ドラフトが取締役承認済み

---

## 5. コンテンツ設計

### 5.1 週次ミックス（JP/EN 共通比率）
| 種別 | 本数 | 目的 |
|---|---|---|
| Myth-busting（TTC誤解を解く） | 3 | 気づき・エンゲージ |
| 政策・補助金（JP重点） | 2 | 検索流入 |
| 治療解釈（ガイドライン/RCT） | 2 | 信頼獲得 |
| 男性因子 | 2 | 未開拓層の取り込み |
| 妊娠前行動変容 | 2 | 購入動機喚起 |

### 5.2 コンテンツ編集規則
すべての記事は以下を満たす:
- ファネル上の位置（Awareness / Trust / Purchase）を明示
- エビデンス要約1行（引用元明示）
- FAQ ブロック（answer engine 最適化）
- 該当言語の Amazon への明確な1CTA（UTM 付き）

### 5.3 禁則事項
- 恐怖煽り（不安ビジネス化）NG
- 医学的根拠のない断定NG
- 診療契約・個別相談の誘引NG（書籍販売に限定）
- 競合批判NG

---

## 6. セールスエンジン強化（即時）

### 6.1 Amazon リンク仕様（統一規格）
```
JP: https://amazon.co.jp/dp/B0F7XTWJ3X?tag=...&utm_source={ch}&utm_medium={type}&utm_campaign=202604-launch&utm_content={variant}
EN: https://amazon.com/dp/{EN_ASIN}?tag=...&utm_source={ch}&utm_medium={type}&utm_campaign=202604-launch&utm_content={variant}
```
言語判定は `Accept-Language` ヘッダ or `/en` パスで分岐。

### 6.2 LP 改善（P0）
- ヒーロー直下に証拠ブロック: 「現役生殖専門医・PubMed根拠・10分で得るもの」
- スティッキーCTA（モバイル下部固定）
- メール/LINE キャプチャ（Week 2 以降、書籍章立てPDFと引き換え）

### 6.3 既存ブログ30本の即時改修
- 全記事末尾に統一CTA ブロック挿入
- 内部リンク: 各記事から関連2本以上
- 上位5本にのみ FAQ 構造化データ先行実装

---

## 7. 自動化修復・信頼性計画

### 7.1 P0（48h）
| ID | 項目 | 根拠 |
|---|---|---|
| P0-1 | `write-blog-from-queue` リネーム または `.sh` 呼び出し修正 | 6日間失敗中 |
| P0-2 | 先行バリデーション（必須ファイル・env・キュー）追加、失敗は actionable ログ | 同上 |
| P0-3 | EN LP の Amazon 差し替え | 致命的誘導ミス |
| P0-4 | 全 CTA に UTM | 計測不能の根本原因 |
| P0-5 | Plausible 導入 | 意思決定の土台 |

### 7.2 P1（7日）
- キュー ハッシュ重複排除
- 投稿 idempotency key
- 状態機械: `pending → generated → approved → posted → audited`
- オーケストレータ一元化（Vercel cron primary）
- `video-pool/` の CI 再現性確保

### 7.3 P2（30日）
- 日次「CEO ダッシュボード」JSON スナップショット生成
  - 投稿成功率 / 言語×チャネル別クリック / CTR上位トピック / 推定注文トレンド
- 異常検知アラート: 24h 無投稿、CTR40%超下落、キュー3日停滞
- 日英両 Amazon API 連携（売上実数取得の検討）

---

## 8. リスク登録簿

| リスク | 発生確率 | 影響 | 対応 |
|---|---|---|---|
| EN ASIN 未発行 | 中 | 致命 | 取締役確認24h以内、未発行なら発行フロー最優先 |
| ElevenLabs クレジット枯渇再発 | 低（Google TTS 切替済） | 中 | 監視のみ |
| Gemini / PubMed API 制限 | 中 | 中 | バックオフ + 代替キー |
| Twitter API 規約変更 | 中 | 大 | 投稿ログを外部保存、手動fallback手順 |
| IG Business API 審査落ち | 中 | 中 | 代替: Buffer / Later 経由も検討 |
| 医学的誤り発信 | 低（監修ゲートあり） | ブランド致命 | 監修ゲートを絶対ブロックフラグに |
| 重複投稿によるBAN | 低 | 中 | idempotency key で根絶 |

---

## 9. Day-1 〜 Day-3 アクションチェックリスト

### Day 1（04/15）
- [x] 両リポ監査完了
- [ ] `write-blog-from-queue` ファイル名整合 → コミット
- [ ] ブログパイプライン手動再走行 → 成功確認
- [ ] キュー重複ゲート実装（Deduper スクリプト）
- [ ] UTM 付与ポリシー定義 → ユーティリティ関数化

### Day 2（04/16）
- [ ] EN LP Amazonリンク差し替え（または取締役へ EN ASIN 確認依頼）
- [ ] Plausible スクリプトを `layout.tsx` に埋め込み → デプロイ
- [ ] JP + EN の高意図スレッド各1本配信
- [ ] サポートブログ記事（FAQ + CTA 付）1本発行
- [ ] 初期クリック・ベースライン取得

### Day 3（04/17）
- [ ] LP CTA A/B 開始（ベネフィット vs 緊急性、4バリアント）
- [ ] 投稿時間帯を初期48h データで暫定最適化
- [ ] Day1-3 の結果を元に Week1 残タスクを再プライオリタイズ

---

## 10. 週次レポート様式（AI CEO → 取締役）

```
## Week N Report (YYYY-MM-DD)

### 成果
- 推定 Amazon 注文: 週次 X 件（前週比 +Y%）
- LP→Amazon CTR: X%（目標 Y%）
- 上位3トピック: 1) ..., 2) ..., 3) ...

### 運用
- 投稿成功率: X%
- 失敗ジョブ: N件（内訳）
- 平均復旧時間: X 分

### 経営判断
- 今週スケールするもの: ...
- 今週停止するもの: ...
- 来週の最優先3課題: 1) ..., 2) ..., 3) ...

### 取締役への要請（承認待ち）
- [ ] ...
```

---

## 11. 意思決定原則

**7日以内に以下のいずれかを改善しないタスクは、即座に後回しにする。**
1. Amazon クリック率
2. 投稿信頼性
3. 読者信頼シグナル

**技術的美しさ、完全性、網羅性は北極星ではない。**
30日で売上を動かさないものは、どれほど正しくても優先度を下げる。

---

## 12. 付録: 現状の技術債務マップ（参考）

### webpage.new
- `scripts/daily-blog-publish.sh:39` エントリポイント不整合 **← P0**
- `src/components/lp-en/*.tsx` Amazon リンクがすべて amazon.co.jp **← P0**
- `vercel.json:2-6` と `scripts/com.ttcguide.daily-blog-publish.plist` の二重スケジュール
- `scripts/content-gen/content-queue` 拡張子無し・106件・重複15%
- `src/app/layout.tsx` 計測スクリプト未実装
- GitHub Actions `daily-x-post.yml` 稼働状況未検証

### reels-factory
- `video-pool/` が Git 管理外 → CI 再現性リスク
- カルーセル英語対応（themeEn あるが rendering 実装未確認）
- Slack 承認 → Make.com → IG 投稿の最後のピースが切れている

---

**本戦略書は 2026-04-15 時点の実地監査に基づく。以後、週次で差分更新する。**
**次回更新予定: 2026-04-22（Week 1 ゲート判定と併せて）**
