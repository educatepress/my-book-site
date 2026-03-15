# LP ゼロから構築プロンプト
## Educate Press 書籍ランディングページ

---

# あなたへの指示

あなたはシニアフロントエンドエンジニア兼UX/UIデザイナーです。以下の仕様に基づき、医療書籍のランディングページを **Next.js (App Router) + Tailwind CSS** でゼロから構築してください。

---

# 1. プロジェクト概要

## 何を作るか
生殖医療専門医が執筆した書籍『20代で考える 将来妊娠で困らないための選択』のランディングページ。日本の20〜30代女性がターゲット。Amazonでの書籍購入がコンバージョンゴール。

## 技術スタック
- Next.js 14+ (App Router, `"use client"` でクライアントコンポーネント)
- Tailwind CSS (utility-first)
- TypeScript
- next/image (画像最適化)
- next/script (外部スクリプト)
- Framer Motion (アニメーション) — なければ CSS アニメーションで代替可
- デプロイ先: Vercel（GitHub連携で自動デプロイ）

## ファイル構成
```
app/
  layout.tsx              ← ルートレイアウト（フォント、メタデータ、ヘッダー/フッター）
  page.tsx                ← LP トップページ
  globals.css             ← CSS変数、ベーススタイル

  blog/
    page.tsx              ← ブログ記事一覧（カテゴリフィルタ付き）
    [slug]/
      page.tsx            ← 個別記事ページ（MDXレンダリング）

  faq/
    page.tsx              ← FAQ 一覧ページ（構造化データ付き）

  videos/
    page.tsx              ← リール動画一覧ページ

  en/
    page.tsx              ← 英語版 LP
    blog/
      page.tsx            ← 英語版ブログ一覧
      [slug]/
        page.tsx          ← 英語版個別記事

  sitemap.ts              ← 動的サイトマップ生成
  robots.ts               ← robots.txt 生成

components/
  layout/
    header.tsx            ← サイト共通ヘッダー（LP以外のページ用）
    footer.tsx            ← サイト共通フッター
  lp/
    hero.tsx
    empathy.tsx
    before-after.tsx
    book-detail.tsx
    author-profile.tsx
    reviews.tsx
    faq-section.tsx
    final-cta.tsx
    footer-links.tsx
    sticky-cta.tsx
  blog/
    article-card.tsx      ← ブログ記事カード
    category-filter.tsx   ← カテゴリフィルタUI
    table-of-contents.tsx ← 記事内目次（自動生成）
    share-buttons.tsx     ← SNSシェアボタン
  common/
    fade-in.tsx
    accordion.tsx
    video-embed.tsx       ← Instagram リール埋め込みコンポーネント
    seo-head.tsx          ← ページ別 SEO メタデータ

content/
  blog/
    ja/
      irregular-mens-cycle.mdx
      pregnancy-loss-info.mdx
      when-to-start-treatment.mdx
      age-and-fertility.mdx
      amh.mdx
      timing-aih-ivf.mdx
      ivf-duration-probability.mdx
      male-age-and-pregnancy.mdx
      identity-complexity.mdx
    en/
      (英語版記事を順次追加)
  faq/
    ja.json               ← FAQ データ（日本語）
    en.json               ← FAQ データ（英語）
  videos/
    videos.json           ← リール動画メタデータ

lib/
  constants.ts            ← リンク・価格などの定数
  mdx.ts                  ← MDX読み込み・パース処理
  types.ts                ← 共通型定義

public/
  mockup-jp.png
  mockup-en.png
  author.jpg
  og-image.jpg
  og-image-en.jpg
  assets/
    hero-bg.webm          ← ヒーロー背景動画（WebM, 2〜3MB）
    hero-bg.mp4           ← フォールバック（MP4）
    hero-poster.jpg       ← 動画ロード前の静止画 / モバイル用
    blog/                 ← ブログ記事のサムネイル・画像
```

---

# 2. デザインシステム

## カラーパレット「Sage & Blush」（CSS変数として定義）

コンセプト: セージグリーン（信頼・安心・成長）を主軸に、ダスティピンク（やさしさ・温かみ）を差し色に使う。海外ウェルネスブランド（Hims/Hers、Clue等）に近い、知的で洗練されたトーン。「ピンク＝女性向け」という安直な印象を避け、20〜30代女性が好む大人っぽさを出す。

```css
:root {
  /* Primary — セージグリーン */
  --sage: #6B8F71;
  --sage-dark: #4A6B50;
  --sage-light: #A3BFA7;
  --sage-pale: #EFF5F0;

  /* Accent — ブラッシュ（ダスティピンク） */
  --blush: #D4899F;
  --blush-light: #EDCBD5;
  --blush-pale: #FBF2F5;

  /* Neutral */
  --cream: #FAFAF7;          /* ページ背景 */
  --surface: #F2EFE9;        /* セクション背景（薄） */
  --surface-mid: #E8E4DC;    /* セクション背景（濃） */

  /* Text */
  --text-dark: #2C2C2C;
  --text-mid: #5A5A5A;
  --text-muted: #9A9A9A;

  /* Accent — ゴールド（レビュー・評価用） */
  --gold: #C49A2E;
  --gold-pale: #FDF5E6;

  /* White */
  --white: #FFFFFF;

  /* Shadows（ニュートラルなグレーベース、旧パレットの赤みシャドウを廃止） */
  --shadow-sm: 0 2px 12px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 24px rgba(0, 0, 0, 0.07);
  --shadow-lg: 0 8px 40px rgba(0, 0, 0, 0.10);
  --shadow-float: 0 8px 40px rgba(0, 0, 0, 0.18);
}
```

### カラーの使い分けルール
```
背景のローテーション:
  cream → white → sage-pale → cream → ... と交互に使い、隣接セクションが同色にならないようにする

Sage（グリーン）の使い所:
  - eyebrow ラベルの文字色・ボーダー
  - テキスト中の強調色（「将来妊娠で困らない」など）
  - アコーディオンの開いた状態の背景
  - フッターのリンク色
  - 全体の「信頼感」を担う色

Blush（ピンク）の使い所:
  - FAQ の Q バッジ
  - CTA 周辺のアクセント背景（中間CTA: blush-pale）
  - Before/After の After 側のチェックマーク横のハイライト
  - 「差し色」として控えめに使う — 画面の10%以下

Amazon黄色ボタン:
  - CTA は全て Amazon 黄色（#FFD814→#F7B731）で統一
  - sage でも blush でもなく、行動喚起には「購入」を想起させる黄色を使う

Gold:
  - レビュー・評価セクションのみ
```

## フォント
```
見出し: "Zen Kaku Gothic New" (weight: 700, 900)
本文: "Noto Sans JP" (weight: 400, 500, 700)
英語ラベル・数字: "DM Sans" (weight: 400, 500, 700) — 幾何学的でモダンな印象
Google Fonts から読み込み（next/font/google 使用）

タイポグラフィの詳細:
  - 日本語見出しの letter-spacing: -0.03em（詰め気味で美しく）
  - 英語ラベル（"BEFORE" "FAQ" 等）は "DM Sans" で差別化
  - 数字は font-variant-numeric: tabular-nums で等幅揃え
  - レビュー引用文は font-size を 0.05rem 大きく + line-height: 2.0 で読みやすく
```

## デザイントーン
- ウェルネス・ナチュラル・知的な信頼感
- セージグリーンが主軸、ピンクは差し色（画面の10%以下）
- 角丸は 16〜24px（カード）、999px（ボタン＝ピル型）
- 過度な装飾は避け、余白とタイポグラフィで品格を出す
- feminine だが甘すぎない、大人の女性が「洗練されている」と感じるトーン
- 参考ブランド: Hims/Hers、Clue、BELTA

## レスポンシブブレークポイント
```
モバイル: 〜639px（1カラム）
タブレット: 640〜1023px（2カラム）
デスクトップ: 1024px〜（2カラム、max-width: 1120px）
```

## 黄金比ベースのスペーシングシステム

フィボナッチ数列（黄金比の近似）を基本単位としたスペーシングを全UIに適用する。「なぜかバランスが良い」と感じさせる数学的な美しさを実現する。

### スペーシングスケール（px）
```
基本単位: 8px
スケール: 8 → 13 → 21 → 34 → 55 → 89 → 144

用途:
  8px:  アイコンとテキストの間、バッジ内padding
  13px: ボタン内 padding-block、カード内の要素間
  21px: カード内 padding、セクション内要素間
  34px: セクション内のブロック間（見出し〜コンテンツ）
  55px: セクション間余白（モバイル）
  89px: セクション間余白（デスクトップ標準）
  144px: 重要セクション間余白（HERO前後、FINAL CTA前後）

CSS変数:
  --space-xs: 8px;
  --space-sm: 13px;
  --space-md: 21px;
  --space-lg: 34px;
  --space-xl: 55px;
  --space-2xl: 89px;
  --space-3xl: 144px;
```

### ボタンの黄金比
```
CTAボタン（大）:
  padding: 13px 34px（縦:横 ≒ 1:2.6 — 黄金比の応用）
  font-size: 15px
  border-radius: 999px
  min-height: 48px

CTAボタン（小・Sticky用）:
  padding: 8px 21px
  font-size: 13px
  min-height: 40px

全ボタン共通:
  font-weight: 900
  letter-spacing: 0.02em
```

### カードの黄金比
```
サムネイル: aspect-ratio: 8/5（1:1.6 = 黄金比近似）
カード padding: 21px（モバイル）/ 34px（デスクトップ）
カード border-radius: 21px
カード内の要素間 gap: 13px
```

## スクロール連動アニメーション

Framer Motion を使用。CSS-only で実装できるものは CSS で。パフォーマンスを考慮し、transform と opacity のみアニメーションする（layout shift を起こさない）。

### 必要パッケージ
```bash
npm install framer-motion
```

### アニメーション仕様

**A. ページ読み込み時（HERO内）— staggered reveal**
```
HERO内の要素が上から順に 0.08s 間隔でフェードイン。
  eyebrow:    delay 0s,    translateY(20px→0), opacity(0→1), duration 0.6s
  h1:         delay 0.08s
  サブコピー:  delay 0.16s
  CTAボタン:   delay 0.24s
  評価バッジ:  delay 0.32s
  書影:       delay 0.2s,  translateX(30px→0)（右からスライド）
  著者バー:    delay 0.4s

easing: [0.25, 0.1, 0.25, 1.0]（cubic-bezier）
```

**B. スクロールフェードイン（全セクション共通）— FadeIn コンポーネント**
```
IntersectionObserver ベース（threshold: 0.15）
一度表示されたら再度非表示にはならない（once: true）
translateY(30px→0) + opacity(0→1)
duration: 0.7s
stagger: 子要素に 0.06s ずつ delay を加算

Framer Motion の motion.div + useInView:
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
  >
```

**C. 書影パララックス（HEROとFINAL CTA）**
```
スクロールに連動して書影が Y方向に微妙にずれる（-30px 程度）。
Framer Motion の useScroll + useTransform:

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });
  const bookY = useTransform(scrollYProgress, [0, 1], [0, -30]);

  <motion.div style={{ y: bookY }}>
    <Image src="/mockup-jp.png" ... />
  </motion.div>
```

**D. 数字カウンター（EMPATHY セクション）**
```
「24の医学的事実」の「24」がスクロールで画面に入った時に 0→24 にカウントアップ。
duration: 1.2s、easing: ease-out
Framer Motion の useInView + useSpring で実装。
```

**E. プログレスバー（ページ上部）**
```
ページ最上部に高さ 3px のバーを固定表示。
スクロール量に応じて左から右に伸びる。
色: var(--sage)
opacity: 0.7

  const { scrollYProgress } = useScroll();
  <motion.div
    style={{
      scaleX: scrollYProgress,
      transformOrigin: "left",
      position: "fixed", top: 0, left: 0, right: 0,
      height: 3, background: "var(--sage)", zIndex: 200
    }}
  />
```

**F. Before/After カードの stagger**
```
4枚のカードが順番にフェードイン。
delay: i * 0.1s（0s, 0.1s, 0.2s, 0.3s）
各カードの After 部分がわずかに遅れて表示（+0.15s）。
```

## グラスモーフィズム

フローティング要素（浮いている要素）にのみ適用。背景が透けて見えることで奥行きと高級感を出す。

### 適用箇所と仕様

```
1. 著者バー（HERO下部）:
   background: rgba(255, 255, 255, 0.65);
   backdrop-filter: blur(16px) saturate(180%);
   -webkit-backdrop-filter: blur(16px) saturate(180%);
   border: 1px solid rgba(255, 255, 255, 0.3);
   box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);

2. Sticky CTA（デスクトップ）:
   background: rgba(255, 255, 255, 0.75);
   backdrop-filter: blur(20px) saturate(180%);
   border: 1px solid rgba(255, 255, 255, 0.4);
   box-shadow: var(--shadow-float);

3. Sticky CTA（モバイル・下部バー）:
   background: rgba(255, 255, 255, 0.9);
   backdrop-filter: blur(20px);
   border-top: 1px solid rgba(107, 143, 113, 0.08);

4. サイト共通ヘッダー（ブログ等サブページ）:
   background: rgba(250, 250, 247, 0.85);
   backdrop-filter: blur(12px);

フォールバック（backdrop-filter 非対応ブラウザ）:
  @supports not (backdrop-filter: blur(1px)) {
    background: rgba(255, 255, 255, 0.95);
  }
```

### 適用しない箇所
```
カード本体、セクション背景、ボタン — これらは背景が透けると可読性が下がるため、
solid な背景色を維持する。グラスモーフィズムは「浮いている小要素」に限定。
```

## マイクロインタラクション

### CTAボタン
```css
.cta-button {
  position: relative;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.cta-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 28px rgba(247, 183, 49, 0.55);
}
/* 矢印アイコンの移動 */
.cta-button .arrow {
  display: inline-block;
  transition: transform 0.2s ease;
}
.cta-button:hover .arrow {
  transform: translateX(4px);
}
/* クリック時の押し込み */
.cta-button:active {
  transform: translateY(0px) scale(0.98);
}
```

### カードホバー
```css
.article-card {
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1),
              box-shadow 0.3s ease;
}
.article-card:hover {
  transform: translateY(-6px);
  box-shadow: var(--shadow-lg);
}
.article-card:hover .thumbnail img {
  transform: scale(1.04);
  transition: transform 0.6s ease;
}
```

### アコーディオン
```
開閉アイコン（▸）: rotate(0deg→90deg), transition 0.3s ease
コンテンツ展開: grid-template-rows: 0fr → 1fr（CSS Grid trick）
  transition: grid-template-rows 0.35s ease-out
  これにより max-height hack が不要で、スムーズな高さアニメーションが実現する
```

### コピーボタン（パートナー共有用）
```
クリック前: 「URLをコピー 📋」
クリック後: 「✓ コピーしました」（0.3s フェード切り替え）
2秒後に元に戻る
色: クリック後に一瞬 var(--sage) に変化
```

### 星レーティング初回表示
```
Framer Motion stagger:
  各星が左から順に 0.1s 間隔で scale(0→1) + opacity(0→1)
  easing: [0.34, 1.56, 0.64, 1]（bounce）
  一度だけ再生（useInView once: true）
```

### リンクホバー（テキストリンク全般）
```
下線がアニメーションで左から右に伸びる:
  background-image: linear-gradient(var(--sage), var(--sage));
  background-size: 0% 2px;
  background-position: 0 100%;
  background-repeat: no-repeat;
  transition: background-size 0.3s ease;

:hover {
  background-size: 100% 2px;
}
```

---

# 3. ページ構成とセクション仕様

## 全体のストーリーライン
```
第1幕「共感」 → 第2幕「解決策」 → 第3幕「信頼」 → 第4幕「行動」
```

ページは以下の7セクションで構成する。各セクションの仕様を順に記述する。

---

## セクション① HERO

### 目的
ファーストビューで「何の本か」「誰が書いたか」「今すぐ買える」を3秒で伝える。

### レイアウト
```
デスクトップ: 2カラム（左テキスト : 右書影 = 55:45）
モバイル: 1カラム（テキスト → 書影の順）
min-height: 100svh（ファーストビューを画面いっぱいに）
```

### 背景（動画）
```
デスクトップ: ループ動画を背景に使用
モバイル: 静止画にフォールバック（通信量節約）

動画仕様:
  - 内容: 柔らかい光のボケ（bokeh）がゆっくり動く抽象映像、
    または水彩絵の具が水中でゆっくり広がる映像
  - 長さ: 10〜15秒ループ
  - ファイルサイズ: 2〜3MB以内（WebM形式推奨、MP4フォールバック）
  - 解像度: 1920×1080（デスクトップ）/ 別途 720p版をモバイル用に
  - 無音（audio トラックなし）
  - 素材入手先: Pexels (pexels.com/videos) or Coverr (coverr.co)

実装:
  <div className="hero-bg">
    {/* デスクトップ: 動画 */}
    <video
      autoPlay muted loop playsInline
      poster="/assets/hero-poster.jpg"
      className="hidden md:block absolute inset-0 w-full h-full object-cover"
      style={{ opacity: 0.18 }}
    >
      <source src="/assets/hero-bg.webm" type="video/webm" />
      <source src="/assets/hero-bg.mp4" type="video/mp4" />
    </video>
    {/* モバイル: 静止画 */}
    <div className="md:hidden absolute inset-0"
      style={{
        backgroundImage: "url(/assets/hero-poster.jpg)",
        backgroundSize: "cover",
        opacity: 0.12
      }}
    />
    {/* グラデーションオーバーレイ（動画/画像の上に重ねる） */}
    <div className="absolute inset-0"
      style={{
        background: "linear-gradient(160deg, rgba(250,250,247,0.85) 0%, rgba(239,245,240,0.7) 50%, rgba(251,242,245,0.75) 100%)"
      }}
    />
    {/* ドットパターン（最前面） */}
    <div className="absolute inset-0"
      style={{
        backgroundImage: "radial-gradient(circle, rgba(107,143,113,0.04) 1px, transparent 1px)",
        backgroundSize: "24px 24px"
      }}
    />
  </div>

注意点:
  - opacity は 0.15〜0.20 に抑え、テキストの可読性を最優先
  - prefers-reduced-motion: reduce の場合は動画を自動停止し静止画にする
  - video タグに loading="lazy" は不要（autoPlay で即座にロードされる）
  - poster 画像は必ず設定（動画ロード前の一瞬の白画面を防ぐ）
```

### 左カラム（テキスト）

1. **ラベル（eyebrow）**
   - テキスト: 「生殖医療専門医がやさしく解説」
   - スタイル: pill型バッジ、sage-pale背景、sage文字、font-size: 0.7rem、letter-spacing: 0.15em

2. **メインタイトル（h1）**
   ```
   『20代で考える
   将来妊娠で困らない
   ための選択』
   ```
   - 「将来妊娠で困らない」の部分を var(--sage) で色付け
   - font-family: "Zen Kaku Gothic New"
   - font-size: clamp(1.85rem, 5vw, 3.2rem)
   - font-weight: 900
   - line-height: 1.3

3. **サブコピー**
   ```
   今の自分を大切にすることが、未来の「選択肢」を増やす。
   20代・30代の女性に、今から知っておくべき24の医学的事実を一冊に。
   ```
   - font-size: 1.05rem
   - color: var(--text-mid)
   - line-height: 1.9

4. **CTAボタン（1つだけ）**
   - テキスト: 「📖 Amazonで購入する →」
   - スタイル: Amazon風（黄色グラデーション）
     ```
     background: linear-gradient(135deg, #FFD814 0%, #F7B731 100%);
     color: #111;
     font-weight: 900;
     border-radius: 999px;
     padding: 0.9rem 2rem;
     box-shadow: 0 4px 16px rgba(247, 183, 49, 0.45);
     ```
   - ホバー時: translateY(-2px) + shadow強化 + 矢印が右に3px移動
   - リンク先: https://amzn.to/3X0yF3v（target="_blank"）

5. **サブリンク（CTAの下、1行）**
   ```
   English Edition → ｜Kindle版 ¥○○○
   ```
   - font-size: 0.8rem
   - English Edition は /book-landing-en.html へのテキストリンク
   - 価格は著者が後で入れる想定でプレースホルダーにしておく

6. **評価バッジ（1行）**
   ```
   ★ 5.0（Amazon）
   ```
   - 星はテキスト文字（SVGの繰り返しは使わない）
   - font-size: 0.85rem
   - 背景: var(--gold-pale)、border: 1px solid rgba(201,146,46,0.25)
   - inline-flex、padding: 0.4rem 1rem、border-radius: 999px

### 右カラム（書影）
```
書影画像のみ（著者バブルは置かない）
width: 240px, height: auto（アスペクト比を維持）
モバイル: width: 180px
filter: drop-shadow(0 24px 48px rgba(100, 20, 40, 0.28))
中央揃え
```

### ヒーロー下部（著者バー）
```
ヒーローセクションの最下部に横並びバーを配置。
左: 著者写真（48×48px、丸、border: 2px solid white）
中: 「佐藤 琢磨｜生殖医療専門医」（font-weight: 700, font-size: 0.85rem）
右: noteアイコン、Instagramアイコン（各20px、テキストリンク）
背景: rgba(255,255,255,0.8)、backdrop-filter: blur(12px)
padding: 0.6rem 1.5rem
border-radius: 999px
box-shadow: var(--shadow-sm)
max-width: fit-content
margin: 0 auto（中央揃え）
```

---

## セクション② EMPATHY（共感）

### 目的
読者が「これは自分のことだ」と感じる共感セクション。現状のWhyセクションを感情訴求に書き換える。

### 背景
```
background: var(--white)
padding-block: 6rem（デスクトップ: 8rem）— 他セクションより余白を広くし呼吸させる
```

### 構成

1. **見出し**
   ```
   こんなこと、感じていませんか？
   ```
   - h2、font-size: clamp(1.5rem, 3.5vw, 2rem)
   - eyebrow ラベルは「WHY」
   - テキスト中央揃え

2. **共感カード（4枚、2×2グリッド、モバイル1列）**
   各カード:
   ```
   💭 「妊娠は、いつかなんとかなる」と思っている
   📱 ネットの情報が多すぎて、何を信じていいかわからない
   ⏳ 将来のことを考えると、漠然とした不安がある
   🤝 パートナーとどう話していいかわからない
   ```
   - レイアウト: 左にアイコン（32px）、右にテキスト
   - 背景: var(--sage-pale)
   - border-radius: 16px
   - padding: 1.5rem
   - ホバーなし（pointer-events: none）
   - font-size: 0.95rem
   - color: var(--text-mid)

3. **締めのコピー（カードの下）**
   ```
   知っているか、知らないかで変わる「一年分の時間」がある。
   本書は、産婦人科医が「先に知っていると差がつく」
   24の医学的事実を、やさしく、読みやすく整理した一冊です。
   ```
   - text-center
   - font-size: 1.05rem
   - max-width: 600px、margin: 0 auto
   - 「一年分の時間」を font-weight: 700 + var(--sage) で強調

---

## セクション③ BEFORE / AFTER

### 目的
「読む前」と「読んだ後」の変化を見せ、購買意欲を高める。直後に中間CTAを配置。

### 背景
```
上部（Before/After カード部分）: var(--cream)
下部（中間CTA部分）: var(--blush-pale)
```

### Before/After カード（4枚、1カラム、縦積み）
各カード:
```
上段（Before）:
  背景: var(--surface)
  左: 「BEFORE」ラベル（font-size: 0.7rem、font-weight: 700、var(--text-muted)）
  右: テキスト（打ち消し線、var(--text-muted)、font-size: 0.9rem）
  aria-label="改善前: [テキスト]"

下段（After）:
  背景: var(--white)
  左: ✅ アイコン
  右: テキスト（font-weight: 700、var(--text-dark)、font-size: 0.9rem）
  aria-label="改善後: [テキスト]"
```

4組の内容:
```
1. Before: 妊娠は「いつか、なんとかなる」と思っていた
   After:  妊娠の適した時期には個人差があることを知り、ベストタイミングを考えられるようになった。

2. Before: 将来のことをなんとなく不安に感じていた
   After:  自分の体の状態と事実を知ることで、ライフプランを具体的に描けるようになった。

3. Before: ネットの情報が多すぎて何から信じていいかわからなかった
   After:  産婦人科医が厳選した24のポイントに沿って、効率よく学べるようになった。

4. Before: 「とりあえず様子を見る」時間が長くなりがちだった
   After:  いつ受診するか、パートナーと何を話すかなど、今できる行動に落とし込めるようになった。
```

### 中間CTA（Before/After の直後）
```
背景: var(--blush-pale)
padding: 3rem 2rem
border-radius: 24px（デスクトップ）/ 0（モバイルは全幅）
text-center

コピー: 「あなたの「知らなかった」を、今日ここで変えませんか？」
  font-weight: 700, font-size: 1.1rem, color: var(--text-dark)

CTAボタン: 「📖 Amazonで購入する →」（Hero と同じスタイル）

価格表示: 「Kindle版 ¥○○○｜ペーパーバック版 ¥○○○」
  font-size: 0.8rem, color: var(--text-muted)
```

---

## セクション④ BOOK DETAIL（本の中身）

### 目的
購入を迷っている読者に、具体的な内容をチラ見せして安心させる。

### 背景
```
background: var(--surface)
```

### レイアウト
```
デスクトップ: 2カラム（左: 目次アコーディオン、右: 試し読みプレビュー）
モバイル: 1カラム（目次 → プレビュー）
```

### 見出し
```
「この本の中身」
h2, text-center, eyebrow なし
```

### 左カラム: 目次アコーディオン

クリックで開閉する章ごとのアコーディオン。初期状態は全て閉じている。

```
第1章 ▸ 将来を選ぶための基本知識
  展開時:
    ・なぜ「20代で考える」のか
    ・卵子の数と年齢の関係
    ・AMHの基礎知識
    ・妊娠率と年齢のリアル
    ・男性側の年齢要因
    （※実際のトピックは著者が調整）

第2章 ▸ 自分の体を守るための知識
第3章 ▸ 妊娠するための知識
第4章 ▸ 不妊治療の基礎と選択肢
付録  ▸ 早発卵巣不全・PCOS・ブライダルチェック
```

アコーディオンUI仕様:
```
各行:
  閉じた状態: 章番号バッジ（sage背景、白文字）+ 章タイトル + ▸アイコン
  開いた状態: 背景が sage-pale に変化、▸ が ▾ に回転（transition: 0.3s）
  展開コンテンツ: surface背景、padding: 1rem、font-size: 0.85rem
border-radius: 16px per item
gap: 0.75rem between items
```

### 右カラム: 試し読みプレビュー
```
本文の1〜2ページのスクリーンショット画像を配置。
画像がまだない場合のフォールバック:
  カード（white背景、shadow-md）内に:
  「📖 中身を少しだけ見てみる」
  「Amazonの試し読み機能でご覧いただけます →」
  リンク先: Amazonの商品ページ
```

### 書誌情報（右カラムの下部）
```
小さなテーブル or dl/dt/dd:
  タイトル: 『20代で考える 将来妊娠で困らないための選択』
  著者: 佐藤 琢磨（生殖医療専門医）
  出版: 2025年4月
  出版社: Kindle Direct Publishing
  形式: ペーパーバック・Kindle版
font-size: 0.8rem
color: var(--text-muted)
```

---

## セクション⑤ TRUST（信頼性）

3つのサブセクションで構成。セクション間の余白を詰め、一つのまとまりとして見せる。

### ⑤-A 著者プロフィール

背景: var(--surface-mid) — 他セクションより少し濃く

```
レイアウト:
  デスクトップ: 左に写真＋名前＋バッジ、右に経歴テキスト
  モバイル: 縦積み（写真中央 → 名前 → バッジ → テキスト）

著者写真:
  120×120px、border-radius: 50%
  border: 4px solid white
  box-shadow: 0 8px 32px rgba(107,143,113,0.22)
  object-fit: cover
  object-position: center 20%  ← 顔位置に合わせて調整

名前: 佐藤 琢磨
  font-family: "Zen Kaku Gothic New"
  font-size: 1.25rem, font-weight: 900

サブ: Takuma Sato, MD, PhD
  font-size: 0.85rem, color: var(--text-muted)

バッジ（3つ横並び）:
  生殖医療専門医 ｜ 産婦人科専門医 ｜ 医学博士
  pill型、sage-pale背景、sage文字、font-size: 0.7rem

経歴テキスト（2〜3行で簡潔に）:
  日本生殖医学会認定・生殖医療専門医。東京慈恵会医科大学卒。
  不妊治療の臨床と研究に従事し、2025年4月より表参道ARTクリニック勤務。
  「note」「Instagram」で正確な医療知識をやさしく発信している。

SNSリンク（テキストリンク、1行）:
  📝 note → https://note.com/famous_cosmos408
  📸 Instagram → https://www.instagram.com/takuma_sato_md/
```

### ⑤-B レビュー

背景: var(--gold-pale)

```
見出し: 「読者の声」（小さめ h3、eyebrow なし）

評価サマリー（見出しの下）:
  「★ 5.0（○件のレビュー）→ Amazonで全てのレビューを見る」
  星はテキスト文字、font-size: 0.9rem
  リンク先: Amazon商品ページの#reviewsセクション

レビューカード（2枚、縦積み）:

  カード1:
    名前: ひよこまめ
    テキスト: 信頼できる女医さんがSNSで紹介されていて購入してみました。
    働き盛りの女性が、妊娠出産といった将来を見据えて知っておくべき情報が
    分かりやすく書かれています。具体的にいつまでにどうなっておくと良いのか
    ということが書かれており、将来設計を立てるのに役立つと思います。
    パートナーに読んでもらうのにも良い本だなと思いました。

  カード2:
    名前: さくら
    テキスト: 専門医の立場から、妊娠に関する医学的エビデンスをイラストを交えて
    わかりやすく解説した良書です。単なる医学知識の羅列にとどまらず、著者自身も
    子を持つ父親であり、共働き夫婦としての経験を踏まえながら、読者の幸せな
    ライフプラン形成を心から願う思いが随所に感じられます。

  各カード:
    背景: white
    border-radius: 16px
    padding: 2rem
    shadow: var(--shadow-sm)
    右上に「✓ Amazonで購入」バッジ（gold-pale背景、gold文字）
    星表示: テキスト「★★★★★ 5.0」（1行、font-size: 0.85rem）
    名前: 「— [名前]（Amazon）」font-size: 0.8rem、var(--text-muted)
    星の div に role="img" aria-label="5つ星中5つ星の評価" を付与
```

### ⑤-C FAQ

背景: var(--white)

```
見出し: 「よくある質問」（h3）
注記: 「※生殖医療専門医 佐藤琢磨 監修」font-size: 0.75rem, var(--text-muted)

アコーディオン形式（初期状態: 全て閉じている）

3問:

  Q: 20代でも不妊になることはありますか？
  A: あります。生理が規則的でも卵管のトラブルやパートナー側の要因などで
     妊娠しにくい場合があります。早めに基礎検査を受けておくと、
     将来の選択肢を広く保つことができます。

  Q: 妊娠の「ベストな年齢」は何歳ですか？
  A: 一般的には20代後半〜30歳前後が妊娠率のピークとされますが、
     個人差が大きいため、年齢だけでなくAMH値・月経周期・
     不妊リスクとなる疾患の有無なども総合的に見ることが大切です。

  Q: いつ病院を受診したらいいか、目安はありますか？
  A: 35歳未満で1年、35歳以上で半年妊娠しなければ一度相談をおすすめします。
     生殖医療専門医に早めに相談することで、遠回りの時間を減らせます。

UI仕様:
  閉じた状態: Q バッジ（blush-pale丸、blush文字）+ 質問テキスト + ▸アイコン
  開いた状態: Q + 質問 + A バッジ（surface-mid丸）+ 回答テキスト
  transition: max-height 0.3s ease-out
  border-radius: 16px per item
  背景: white（閉じ）→ 開いた時も white（border で区切り）
  border: 1px solid rgba(107,143,113,0.1)
```

---

## セクション⑥ FINAL CTA

### 目的
最終的な購買行動を促す。シミュレーターとパートナー訴求も統合。

### 背景
```
background: linear-gradient(150deg, var(--sage-dark) 0%, var(--sage) 45%, var(--blush) 100%);
ドットパターンオーバーレイ:
  radial-gradient(circle, white 1px, transparent 1px)
  background-size: 28px 28px
  opacity: 0.06
```

### 構成
```
1. 書影画像（中央、width: 132px、drop-shadow 強め）

2. ラベル
   「Kindle版・ペーパーバック版 好評発売中」
   font-size: 0.8rem, color: rgba(255,255,255,0.7), letter-spacing: 0.15em

3. 見出し
   「"将来の自分"のために、今日の数ページから。」
   font-family: "Zen Kaku Gothic New"
   font-size: clamp(1.6rem, 4vw, 2.4rem), font-weight: 900, color: white

4. サブコピー
   「スマホで3分から読めるKindle版。医師が書いた"安心できる医療知識"。」
   font-size: 1.05rem, color: rgba(255,255,255,0.8)

5. CTAボタン
   「📖 Amazonで購入する →」（Hero と同じ Amazon 黄色スタイル）

6. サブリンク
   English Edition →（白テキストリンク）
   リンク先: https://amzn.to/4ofHlPS

7. 区切り線
   width: 60px, height: 1px, background: rgba(255,255,255,0.3), margin: 2.5rem auto

8. シミュレーター誘導
   「🔬 体外受精の期間を「確率」で考えるシミュレーター」
   テキストリンク:「IVFシミュレーターを開く →」
   リンク先: https://chatgpt.com/canvas/shared/68b783ad34648191bf0ef3ba12ce8a96
   注記: 「※統計モデルからの理論値です。個々の妊娠を保証するものではありません。」
   全て rgba(255,255,255,0.6) 系の控えめな白テキスト

9. パートナー訴求（区切り線の下）
   「パートナーにも読んでほしいと思ったら」
   LINEシェアボタン（緑）+ URLコピーボタン（白枠）
   font-size: 0.85rem

10. フッター表記
    「このページは生殖医療専門医 佐藤琢磨が監修しています。© Educate Press」
    font-size: 0.75rem, color: rgba(255,255,255,0.4)
```

---

## セクション⑦ FOOTER（関連コンテンツ＋フッター）

### 背景
```
background: var(--text-dark)（ダーク背景で明確にフッターと分かる）
color: rgba(255,255,255,0.7)
padding-block: 4rem
```

### 構成

```
上段: 関連記事リンク（3〜4本に厳選）

  見出し: 「もっと詳しく知りたい方へ」（font-size: 1rem, white, font-weight: 700）

  リスト形式（カードではない）:
    各行: タイトル（リンク）+ 1行説明 + [note] バッジ（外部記事の場合）
    font-size: 0.85rem
    リンク色: var(--sage-light)

  厳選する記事（以下から3〜4本）:
    ・月経不順と妊娠しやすさ：基礎知識と受診のタイミング → /note/irregularmenscycle.html
    ・不妊治療はいつから始めるべき？ → /note/when-to-start-treatment.html
    ・妊娠率と年齢の関係：20代・30代・40代で何が違う？ → /note/age-and-fertility.html
    ・タイミング法・人工授精・体外受精の違い → /note/timing-aih-ivf.html

  「全ての記事を見る →」リンク（将来的に /articles ページを作る想定）

中段: SNSリンク
  📝 note ｜ 📸 Instagram
  アイコン + テキストリンク、横並び

下段: コピーライト
  © 2025 Educate Press. All rights reserved.
```

---

## Sticky CTA

### モバイル（〜767px）
```
position: fixed
bottom: 0; left: 0; right: 0
z-index: 100
background: white
border-top: 1px solid rgba(107,143,113,0.1)
box-shadow: 0 -4px 20px rgba(0,0,0,0.08)
padding: 0.75rem 1rem
display: flex
align-items: center
gap: 0.75rem

左: 書影サムネ（36×52px、border-radius: 6px）
中央: 「Amazonで購入する」ボタン（flex-grow、Amazon黄色スタイル、小さめ）
右: 価格「¥○○○」（font-size: 0.75rem, var(--text-muted)）
```

### デスクトップ（768px〜）
```
position: fixed
bottom: 1.5rem; right: 1.5rem
z-index: 100
background: white
padding: 0.5rem 1.25rem 0.5rem 0.5rem
border-radius: 999px
box-shadow: var(--shadow-float)
border: 1px solid rgba(247,183,49,0.3)
display: flex; align-items: center; gap: 0.6rem

左: 書影サムネ（38×54px）
右: 「Amazonで購入する」テキスト（font-weight: 900, font-size: 0.85rem, var(--sage)）
```

### 表示制御
```
ヒーローセクションが画面内にある間は非表示。
ヒーローを過ぎたら opacity 0→1 で fade-in（transition: 0.3s）。
IntersectionObserver で制御。
ページ最下部（FOOTER）に到達したら非表示にする（Sticky CTA が FOOTER に被らないように）。
モバイルでは body に padding-bottom: 80px を追加し、Sticky CTA の下にコンテンツが隠れないようにする。
```

---

# 4. 共通コンポーネント仕様

## FadeIn コンポーネント
```
スクロールで画面内に入った時に fade-in + translateY(20px→0) アニメーション。
IntersectionObserver ベース。
props:
  delay: number (秒)
  direction: "up" | "left" (デフォルト: "up")
  children: ReactNode
一度表示されたら再度非表示にはならない（once: true）。
```

## Accordion コンポーネント
```
汎用的なアコーディオン。BOOK DETAIL の目次と FAQ の両方で使う。
props:
  items: Array<{ trigger: ReactNode; content: ReactNode }>
  allowMultiple: boolean (デフォルト: false)
開閉アニメーション: max-height + overflow: hidden + transition 0.3s ease-out
```

---

# 5. SEO・メタデータ・OGP

```typescript
// app/layout.tsx の metadata
export const metadata: Metadata = {
  title: "『20代で考える 将来妊娠で困らないための選択』｜生殖医療専門医 佐藤琢磨",
  description: "生殖医療専門医が、20代・30代の女性に今から知っておくべき24の医学的事実をやさしく解説。Amazon Kindle・ペーパーバック版 好評発売中。",
  openGraph: {
    title: "20代で考える 将来妊娠で困らないための選択",
    description: "産婦人科医が書いた、将来の妊娠で困らないための一冊。",
    images: ["/og-image.jpg"],
    type: "website",
    locale: "ja_JP",
  },
  twitter: {
    card: "summary_large_image",
  },
};
```

---

# 6. パフォーマンス要件

- Lighthouse Performance スコア: 80以上
- 画像は全て next/image で最適化
- 外部画像（note.com）は next.config.js の remotePatterns に登録
  ```js
  images: { remotePatterns: [{ protocol: 'https', hostname: 'assets.st-note.com' }] }
  ```
- Instagram 埋め込みは使わない（削除済み）。著者セクションにリンクのみ。
- フォント: next/font/google で読み込み、display: swap
- Sticky CTA の IntersectionObserver は passive で実装

### 動画パフォーマンス
```
- hero-bg.webm: 2〜3MB以内（WebM VP9 推奨）
- hero-bg.mp4: 3〜4MB以内（H.264 フォールバック）
- モバイルでは動画を読み込まない（<video> に hidden md:block を適用）
- poster 画像は WebP で 50KB 以内
- video タグに preload="metadata" を設定（全データを即座にDLしない）
```

### アニメーションパフォーマンス
```
- 全アニメーションは transform と opacity のみ（layout shift を起こさない）
- will-change は必要な要素にのみ適用（乱用しない）
- prefers-reduced-motion: reduce を検出し、動画停止 + アニメーション無効化:

  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      transition-duration: 0.01ms !important;
    }
    video { display: none; }
  }

- Framer Motion の Lazy loading: 初期ビューポート外のアニメーションは
  whileInView で遅延実行し、初回ロードのJS実行量を抑える
```

---

# 7. アクセシビリティ要件

- 星評価の要素に role="img" aria-label="5つ星中5つ星の評価" を付与
- Before/After のテキストに適切な aria-label を付与
- 全てのリンクに target="_blank" がある場合は rel="noopener noreferrer" を付与
- CTAボタンは十分なコントラスト比（WCAG AA準拠）
- アコーディオンは aria-expanded, aria-controls を使用
- 画像の alt テキストは全て日本語で意味のある説明を記述
- フォーカス可能な要素にフォーカスリングを表示（:focus-visible）
- prefers-reduced-motion: reduce でアニメーション無効化 + 動画非表示
- 動画背景には aria-hidden="true" を付与（装飾目的のため）
- グラスモーフィズム要素の背景コントラストが十分か確認（blur の上のテキスト）

---

# 8. 実装時の注意事項

1. CTA文言は全箇所「Amazonで購入する」で統一すること。「日本語版を読む」「Get it now」などの表記ゆれは絶対に作らない。

2. 価格（¥○○○）はプレースホルダーとして `{KINDLE_PRICE}` `{PAPERBACK_PRICE}` の定数で管理し、1箇所で変更すれば全箇所に反映される設計にすること。

3. Amazon アフィリエイトリンクも定数管理:
   ```typescript
   const LINKS = {
     AMAZON_JP: "https://amzn.to/3X0yF3v",
     AMAZON_EN: "https://amzn.to/4ofHlPS",
     ENGLISH_LP: "/book-landing-en.html",
     NOTE: "https://note.com/famous_cosmos408",
     INSTAGRAM: "https://www.instagram.com/takuma_sato_md/",
     SIMULATOR: "https://chatgpt.com/canvas/shared/68b783ad34648191bf0ef3ba12ce8a96",
   } as const;
   ```

4. セクション間の背景色の切り替えが曖昧にならないよう、隣接するセクションが同系色にならないように注意。

5. モバイルファーストで実装し、デスクトップはメディアクエリで拡張する方針。

6. 全てのテキストコンテンツは日本語。英語が混在する箇所は最小限（English Edition リンク、著者の英語名のみ）。

---

# 9. サイト全体の拡張設計

## 設計思想

このサイトは「1枚のLP」ではなく、**医療情報メディア**として育てていく前提で設計する。LPはトップページとして書籍の購入導線に特化し、その下にブログ・FAQ・動画・英語版が層として広がる構成にする。

コンテンツの追加・更新は GitHub への push（AI自動更新含む）→ Vercel が自動ビルド・デプロイ、のフローで運用する。

```
educatepress.com/              ← LP（書籍購入）
educatepress.com/blog/         ← ブログ記事一覧
educatepress.com/blog/[slug]   ← 個別記事
educatepress.com/faq/          ← FAQ 一覧
educatepress.com/videos/       ← リール動画一覧
educatepress.com/en/           ← 英語版 LP
educatepress.com/en/blog/      ← 英語版ブログ
```

## コンテンツ管理: MDX 方式

記事は MDX（Markdown + JSX コンポーネント）で管理する。CMSは使わず、MDXファイルを `content/blog/ja/` に追加して GitHub に push するだけで記事が公開される。

### 選定理由
- AI（Claude Code・Antigravity等）との相性が最も良い（MDXファイルを直接生成・編集できる）
- 外部サービスへの依存がゼロ（CMS の障害やAPI変更の影響を受けない）
- GitHub で記事の履歴管理・レビューができる
- 医療情報なので、公開前に GitHub の Pull Request で内容確認するフローが自然に組める
- Vercel がビルド時に静的HTML に変換するので表示が高速

### 自動更新フロー
```
1. AI（Antigravity等）が MDX ファイルを生成 or 編集
2. GitHub に push（直接 or PR 経由）
3. Vercel が自動検知してビルド・デプロイ（通常1〜2分）
4. 本番サイトに反映
```

### MDX ファイルのフォーマット

```mdx
---
title: "月経不順と妊娠しやすさ：基礎知識と受診のタイミング"
description: "月経周期の乱れの背景にあるホルモンバランス・PCOS・生活習慣と、妊娠しやすさへの影響を医師が整理します。"
date: "2025-04-15"
updated: "2025-05-01"
category: "基礎知識"
tags: ["月経", "PCOS", "ホルモン"]
thumbnail: "/assets/blog/irregular-mens-cycle-thumb.jpg"
author: "佐藤琢磨"
lang: "ja"
---

月経周期が安定しないと、将来の妊娠に影響があるのでしょうか？
この記事では、月経不順の背景にある要因と、受診のタイミングについて解説します。

## 月経不順とは

（本文が続く...）
```

### MDX 読み込み処理（lib/mdx.ts）

```typescript
import fs from "fs";
import path from "path";
import matter from "gray-matter";

const CONTENT_DIR = path.join(process.cwd(), "content/blog");

export type ArticleMeta = {
  slug: string;
  title: string;
  description: string;
  date: string;
  updated?: string;
  category: string;
  tags: string[];
  thumbnail: string;
  author: string;
  lang: "ja" | "en";
};

export function getAllArticles(lang: "ja" | "en" = "ja"): ArticleMeta[] {
  const dir = path.join(CONTENT_DIR, lang);
  if (!fs.existsSync(dir)) return [];
  const files = fs.readdirSync(dir).filter(f => f.endsWith(".mdx"));
  return files
    .map(file => {
      const raw = fs.readFileSync(path.join(dir, file), "utf-8");
      const { data } = matter(raw);
      return { slug: file.replace(".mdx", ""), ...data } as ArticleMeta;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getArticleBySlug(slug: string, lang: "ja" | "en" = "ja") {
  const filePath = path.join(CONTENT_DIR, lang, `${slug}.mdx`);
  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);
  return { meta: { slug, ...data } as ArticleMeta, content };
}
```

### 必要パッケージ
```bash
npm install gray-matter next-mdx-remote rehype-slug rehype-autolink-headings remark-gfm framer-motion
```

---

# 10. ブログ記事ページの設計

## 記事一覧ページ（/blog/）

### レイアウト
```
ヘッダー（サイト共通）
  ↓
ページタイトル: 「医師解説コラム」
  ↓
カテゴリフィルタ（横スクロールのpillボタン）:
  すべて | 基礎知識 | 治療 | メンタル | 男性側
  ↓
記事カードグリッド:
  デスクトップ: 3カラム
  タブレット: 2カラム
  モバイル: 1カラム
  ↓
ページネーション（1ページ9記事）
  ↓
フッター（サイト共通）
```

### 記事カード仕様
```
サムネイル: aspect-[3/2]（16:9 ではなく 3:2 で縦を短く）
カテゴリバッジ: サムネイル左上にオーバーレイ
  背景: rgba(107,143,113,0.9)（sage系）、白文字、font-size: 0.7rem
タイトル: font-size: 0.925rem, font-weight: 700, 2行clamp
説明文: font-size: 0.82rem, color: var(--text-mid), 3行clamp
日付: font-size: 0.75rem, color: var(--text-muted)
ホバー: translateY(-4px) + shadow 強化
```

## 個別記事ページ（/blog/[slug]）

### レイアウト
```
ヘッダー
  ↓
パンくずリスト: トップ > ブログ > [カテゴリ] > [記事タイトル]
  ↓
記事ヘッダー:
  カテゴリバッジ + 公開日 + 更新日
  h1 タイトル（font-size: clamp(1.5rem, 4vw, 2.2rem)）
  著者バー（写真48px + 名前 + 肩書き）
  ↓
2カラム（デスクトップ）:
  メインカラム（70%）: 記事本文（MDXレンダリング）
  サイドバー（30%）:
    - 記事内目次（自動生成、スクロール追従 sticky）
    - 書籍CTAカード（書影 + 「Amazonで購入する」ボタン）
    - 関連記事リンク（同カテゴリから3本）
  ↓
記事フッター:
  SNSシェアボタン（LINE, X, はてブ）
  「パートナーにも共有する」ボタン
  ↓
関連記事カード（3本、横並び）
  ↓
フッター
```

### 記事本文のタイポグラフィ
```css
.article-body {
  font-size: 1rem;
  line-height: 2;
  color: var(--text-dark);
}
.article-body h2 {
  font-size: 1.4rem;
  font-weight: 900;
  margin-top: 3rem;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid var(--sage-pale);
}
.article-body h3 {
  font-size: 1.15rem;
  font-weight: 700;
  margin-top: 2rem;
  margin-bottom: 0.75rem;
  color: var(--sage);
}
.article-body blockquote {
  border-left: 4px solid var(--sage-light);
  background: var(--sage-pale);
  padding: 1rem 1.5rem;
  border-radius: 0 12px 12px 0;
  margin: 1.5rem 0;
  font-style: italic;
}
.article-body img {
  border-radius: 12px;
  margin: 1.5rem 0;
}
```

### 記事内目次（自動生成）
```
rehype-slug で各 h2, h3 に自動でIDを付与。
クライアントコンポーネントで目次を生成し、サイドバーに sticky 表示。
スクロールに追従して現在読んでいるセクションをハイライト。
```

---

# 11. FAQ ページの設計

## FAQ データ管理（content/faq/ja.json）

```json
{
  "categories": [
    {
      "name": "妊娠・妊活の基本",
      "items": [
        {
          "id": "faq-001",
          "question": "20代でも不妊になることはありますか？",
          "answer": "あります。生理が規則的でも卵管のトラブルやパートナー側の要因などで妊娠しにくい場合があります。早めに基礎検査を受けておくと、将来の選択肢を広く保つことができます。"
        },
        {
          "id": "faq-002",
          "question": "妊娠の「ベストな年齢」は何歳ですか？",
          "answer": "一般的には20代後半〜30歳前後が妊娠率のピークとされますが、個人差が大きいため、年齢だけでなくAMH値・月経周期・不妊リスクとなる疾患の有無なども総合的に見ることが大切です。"
        }
      ]
    },
    {
      "name": "受診・治療",
      "items": []
    },
    {
      "name": "本書について",
      "items": []
    }
  ]
}
```

### FAQ ページ（/faq/）
```
全カテゴリをアコーディオンで表示。
LP の FAQ セクション（3問）はこのデータの中から厳選して表示。
FAQ ページは全件を表示し、カテゴリごとにセクション分け。
```

### FAQ の追加フロー
```
1. content/faq/ja.json にオブジェクトを追加
2. GitHub に push → Vercel が自動デプロイ
3. LP の FAQ セクション（3問）とは別に、/faq/ ページに全件表示される
```

---

# 12. リール動画ページの設計

## 動画データ管理（content/videos/videos.json）

```json
[
  {
    "id": "reel-001",
    "title": "妊娠率と年齢の関係｜3分でわかる",
    "instagramUrl": "https://www.instagram.com/reel/DVIHLS9k6B3/",
    "date": "2025-04-10",
    "category": "基礎知識",
    "description": "卵子の数と質がどのように変化するかを3分で解説。"
  }
]
```

### 動画一覧ページ（/videos/）
```
レイアウト:
  ページタイトル: 「医師解説リール動画」
  説明: 「最新のメッセージをリール動画でもお届けしています。」
  ↓
  動画カードグリッド（2カラム デスクトップ、1カラム モバイル）

動画カード:
  Instagram埋め込みは使わない（パフォーマンス上の理由）。
  代わりにサムネイル画像 + 再生ボタンオーバーレイ。
  クリックすると Instagram の該当リールに遷移（target="_blank"）。
  または、モーダルで Instagram oEmbed を遅延読み込み。
```

### Instagram 埋め込みの方針
```
LP 本体: Instagram 埋め込みは使わない（著者セクションにリンクのみ）
/videos/ ページ: サムネ + リンクを基本とし、ユーザーがクリックした時だけ読み込む
理由: Instagram embed.js は重く、LCP を大幅に悪化させるため
```

---

# 13. 英語版（i18n）の設計

## ルーティング方式

Next.js の App Router でパスベースの i18n を実装する。`/en/` 配下に英語版を配置。

```
app/
  page.tsx         ← 日本語 LP（デフォルト）
  en/
    page.tsx       ← 英語版 LP
    blog/
      page.tsx     ← 英語版ブログ一覧
      [slug]/
        page.tsx   ← 英語版個別記事
```

## 翻訳の管理

```
lib/i18n/
  ja.json          ← UIテキスト（ボタン、ラベル、ナビゲーション等）
  en.json          ← 英語版UIテキスト
```

```json
// lib/i18n/ja.json
{
  "cta": "Amazonで購入する →",
  "nav_blog": "コラム",
  "nav_faq": "よくある質問",
  "nav_videos": "動画",
  "author_title": "生殖医療専門医",
  "read_more": "記事を読む →",
  "share_partner": "パートナーに共有する"
}
```

```json
// lib/i18n/en.json
{
  "cta": "Buy on Amazon →",
  "nav_blog": "Articles",
  "nav_faq": "FAQ",
  "nav_videos": "Videos",
  "author_title": "Reproductive Medicine Specialist",
  "read_more": "Read more →",
  "share_partner": "Share with your partner"
}
```

## 言語切り替え
```
ヘッダー右上に言語切り替えリンク:
  🇯🇵 日本語 ｜ 🇺🇸 English
href="/en/" で英語版トップに遷移。
hreflang タグを <head> に出力（SEO用）。
```

---

# 14. SEO 実装仕様

## サイトマップ（app/sitemap.ts）

```typescript
import { getAllArticles } from "@/lib/mdx";
import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://educatepress.com";
  const jaArticles = getAllArticles("ja");
  const enArticles = getAllArticles("en");

  return [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "monthly", priority: 1.0 },
    { url: `${baseUrl}/en`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    { url: `${baseUrl}/blog`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    ...jaArticles.map(a => ({
      url: `${baseUrl}/blog/${a.slug}`,
      lastModified: new Date(a.updated || a.date),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...enArticles.map(a => ({
      url: `${baseUrl}/en/blog/${a.slug}`,
      lastModified: new Date(a.updated || a.date),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    { url: `${baseUrl}/faq`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/videos`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.5 },
  ];
}
```

## robots.txt（app/robots.ts）

```typescript
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: "https://educatepress.com/sitemap.xml",
  };
}
```

## ページ別メタデータ

```
LP（トップ）:
  title: 『20代で考える 将来妊娠で困らないための選択』｜生殖医療専門医 佐藤琢磨
  description: 生殖医療専門医が、20代・30代の女性に今から知っておくべき24の医学的事実をやさしく解説。
  og:type: website
  og:locale: ja_JP

ブログ記事:
  title: [記事タイトル]｜Educate Press
  description: [記事のdescription]
  og:type: article
  article:published_time: [date]
  article:modified_time: [updated]
  article:author: 佐藤琢磨

英語版:
  og:locale: en_US
  hreflang タグで ja/en を相互参照
```

## 構造化データ（JSON-LD）

### LP（トップ）— Book + Person

```typescript
const bookJsonLd = {
  "@context": "https://schema.org",
  "@type": "Book",
  name: "20代で考える 将来妊娠で困らないための選択",
  author: {
    "@type": "Person",
    name: "佐藤琢磨",
    jobTitle: "生殖医療専門医",
    affiliation: { "@type": "Organization", name: "表参道ARTクリニック" },
    url: "https://educatepress.com",
  },
  datePublished: "2025-04",
  publisher: { "@type": "Organization", name: "Educate Press" },
  isbn: "（ISBN があれば記載）",
  inLanguage: "ja",
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "5.0",
    reviewCount: "2",
    bestRating: "5",
  },
};
```

### ブログ記事 — Article + MedicalWebPage

```typescript
const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": ["Article", "MedicalWebPage"],
  headline: meta.title,
  description: meta.description,
  datePublished: meta.date,
  dateModified: meta.updated || meta.date,
  author: {
    "@type": "Person",
    name: "佐藤琢磨",
    jobTitle: "生殖医療専門医",
    credential: [
      { "@type": "EducationalOccupationalCredential", credentialCategory: "生殖医療専門医" },
      { "@type": "EducationalOccupationalCredential", credentialCategory: "産婦人科専門医" },
      { "@type": "EducationalOccupationalCredential", credentialCategory: "医学博士" },
    ],
  },
  publisher: { "@type": "Organization", name: "Educate Press" },
  image: meta.thumbnail,
  mainEntityOfPage: { "@type": "WebPage", "@id": `https://educatepress.com/blog/${meta.slug}` },
};
```

### FAQ — FAQPage

```typescript
const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqItems.map(item => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.answer,
    },
  })),
};
```

### JSON-LD の埋め込み方法
```tsx
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
/>
```

---

# 15. AEO（AI Engine Optimization）対策

AEO とは、ChatGPT・Claude・Perplexity・Google AI Overview などのAIが情報源として参照しやすいサイトを作ること。医療情報サイトでは特に重要。

## 基本原則

```
1. E-E-A-T の明示
   - 全記事に著者情報（名前・資格・所属）を構造化データで明示
   - MedicalWebPage スキーマを使い、医療コンテンツであることを明示

2. 質問-回答の構造化
   - FAQ ページに FAQPage スキーマを実装
   - ブログ記事内でも「Q: 〜 A: 〜」形式のセクションを積極的に使う
   - AIは構造化された Q&A を優先的に参照する傾向がある

3. 明確な見出し階層
   - h1 → h2 → h3 の階層を厳密に守る
   - 見出しに「答え」を含める（例: "AMHとは？卵巣の予備能を測る検査"）
   - AIは見出しを情報の要約として読む

4. 冒頭での結論提示
   - 各記事の冒頭に「この記事のまとめ」ボックスを設置
   - 3〜5行で記事の結論を先に述べる
   - AIは冒頭のテキストを回答に引用する確率が高い

5. 引用可能な一文の設計
   - 各セクションに「ワンライナー」（1文で完結する重要な事実）を意識的に配置
   - 例: 「35歳未満で1年、35歳以上で半年妊娠しなければ受診を推奨する。」
   - AIはこのような簡潔な事実文を優先的に参照する
```

## ブログ記事テンプレートへの反映

```mdx
---
title: "AMHとは？卵巣年齢の基礎知識と検査のタイミング"
description: "AMH（抗ミュラー管ホルモン）検査の意味と、受ける最適なタイミングを生殖医療専門医が解説します。"
...
---

{/* まとめボックス — AEO対策: AIが最初に読む部分 */}
<SummaryBox>
- AMHは卵巣に残っている卵子の「目安」を数値で示す検査。
- 値が低いからといって妊娠できないわけではない。
- 妊娠を考え始めた段階で一度検査を受けておくと、ライフプランの判断材料になる。
</SummaryBox>

## AMHとは

AMH（抗ミュラー管ホルモン）とは、...

## いつ検査を受けるべきか

結論として、妊娠を考え始めた段階で一度AMH検査を受けておくことが推奨される。
...
```

---

# 16. サイト共通ヘッダー / フッターの設計

LP のトップページではヘッダーは不要（ファーストビューの妨げになるため）。
ブログ・FAQ・動画ページではサイト共通のヘッダーとフッターを表示する。

## ヘッダー（ブログ等のサブページ用）

```
position: sticky, top: 0
background: rgba(250,250,247,0.95)（cream + blur）
backdrop-filter: blur(12px)
border-bottom: 1px solid rgba(107,143,113,0.08)
height: 56px

左: サイト名「Educate Press」（テキスト、sage色、font-weight: 900）
中央: ナビゲーション（デスクトップのみ）
  コラム | FAQ | 動画 | 書籍を購入
右: 言語切り替え「🇯🇵 / 🇺🇸」

モバイル: ハンバーガーメニュー
```

## フッター（サイト共通）

```
LP の FOOTER セクション（セクション⑦）と同じデザインを再利用。
ダーク背景（var(--text-dark)）。
ブログ等のページでは「関連記事リンク」部分を省略し、
ナビリンク + SNS + コピーライトのみにする。
```

---

# 17. 実装の段階的ロードマップ

一度に全てを作る必要はない。以下の順で段階的に構築する。

## Phase 1: LP（最優先・1〜2週間）
```
- トップページ（7セクション）をゼロから構築
- Sage & Blush パレット適用
- Sticky CTA
- モバイル最適化
- OGP / 基本メタデータ
- 構造化データ（Book + Person）
- Vercel デプロイ
```

## Phase 2: ブログ基盤（2〜3週間目）
```
- MDX 読み込み基盤（lib/mdx.ts）
- 記事一覧ページ（/blog/）
- 個別記事ページ（/blog/[slug]）
- 既存の9記事を MDX に移行
- サイト共通ヘッダー / フッター
- サイトマップ / robots.txt
- 記事の構造化データ（Article + MedicalWebPage）
- Google Search Console 登録
```

## Phase 3: FAQ + 動画（3〜4週間目）
```
- FAQ データ管理（json）
- FAQ 一覧ページ（/faq/）+ FAQPage スキーマ
- 動画一覧ページ（/videos/）
- LP の FAQ セクションを json データから動的に表示
```

## Phase 4: 英語版（4〜6週間目）
```
- i18n 基盤（lib/i18n/）
- 英語版 LP（/en/）
- 英語版ブログ基盤（/en/blog/）
- hreflang 設定
- 英語版 OGP
```

## Phase 5: 継続運用
```
- 新しいブログ記事を定期的に追加（月2〜4本が理想）
- FAQ を随時追加
- リール動画を追加
- Google Search Console でインデックス状況を監視
- AIでの引用状況を確認（Perplexity等で自サイトの記事が参照されるか）
```

---

# 18. Google Search Console / Analytics の設定

## Vercel での設定

```typescript
// app/layout.tsx に追加
<head>
  <meta name="google-site-verification" content="{GSC_VERIFICATION_CODE}" />
</head>

// Google Analytics 4（GA4）— next/script で読み込み
import Script from "next/script";
<Script src="https://www.googletagmanager.com/gtag/js?id={GA4_ID}" strategy="afterInteractive" />
<Script id="ga4" strategy="afterInteractive">
  {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','{GA4_ID}');`}
</Script>
```

## 初期設定チェックリスト
```
- [ ] Google Search Console にサイトを登録
- [ ] サイトマップ（/sitemap.xml）を Search Console に送信
- [ ] GA4 プロパティを作成し、計測コードを設置
- [ ] Vercel Analytics を有効化（無料枠で十分）
- [ ] 構造化データのテスト（Google Rich Results Test）
- [ ] PageSpeed Insights でパフォーマンス確認
```
