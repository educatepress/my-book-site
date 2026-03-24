// =============================================================
// generate-infographic.ts
// 役割: 記事ごとのエビデンスデータからインフォグラフィックPNGを生成する
// 使い方:
//   npx ts-node scripts/generate-infographic.ts --data '{"title":"CoQ10の卵子質への影響","group1Label":"CoQ10群","group1Value":68,"group2Label":"コントロール群","group2Value":48,"unit":"%","metric":"受精率","source":"Smith et al., 2023","slug":"coq10-egg-quality"}'
//   または generate-infographic(data) をプログラムから呼び出す
//
// 出力:
//   public/infographics/<slug>-jp.png  (ブログ日本語版用 1200×630)
//   public/infographics/<slug>-en.png  (ブログ英語版用  1200×630)
//   public/infographics/<slug>-carousel.png (カルーセル用 1080×1080)
// =============================================================

import { createCanvas, registerFont, CanvasRenderingContext2D } from 'canvas';
import fs from 'fs';
import path from 'path';

// ── 型定義 ──────────────────────────────────────────────────
export interface InfographicData {
  title: string;       // 日本語タイトル（例: "CoQ10の卵子質への影響"）
  titleEn: string;     // 英語タイトル（例: "Impact of CoQ10 on Egg Quality"）
  group1Label: string; // グループ1のラベル（例: "CoQ10群"）
  group1LabelEn: string;
  group1Value: number; // グループ1の数値（例: 68）
  group2Label: string; // グループ2のラベル（例: "コントロール群"）
  group2LabelEn: string;
  group2Value: number; // グループ2の数値（例: 48）
  unit: string;        // 単位（例: "%"）
  metric: string;      // 指標名（例: "受精率"）
  metricEn: string;    // 指標名英語（例: "Fertilization Rate"）
  source: string;      // 引用元（例: "Smith et al., Reproductive Biomedicine Online, 2023"）
  slug: string;        // ファイル名用スラッグ
}

// ── カラーパレット ──────────────────────────────────────────
const BLOG_COLORS = {
  bg: '#FAF8F5',
  text: '#2C3E50',
  textMid: '#4A5568',
  textMuted: '#9A9A9A',
  barPrimary: '#8A9A86',   // セージグリーン
  barSecondary: '#C8D8C6', // ライトセージ
  accent: '#CEAC66',       // ゴールド
  border: '#E8E4DC',
};

const CAROUSEL_COLORS = {
  bg: '#0D0D0D',
  text: '#F5F5F7',
  textMuted: '#8E8E93',
  barPrimary: '#D4AF37',   // Noble Gold
  barSecondary: '#4A4030', // ダークゴールド
  accent: '#D4AF37',
  progressBar: '#D4AF37',
};

// ── ヘルパー ────────────────────────────────────────────────
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

// ── ブログ用 PNG （1200 × 630） ───────────────────────────────
function generateBlogPng(data: InfographicData, lang: 'jp' | 'en'): Buffer {
  const W = 1200, H = 630;
  const C = BLOG_COLORS;
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext('2d');

  const title = lang === 'jp' ? data.title : data.titleEn;
  const label1 = lang === 'jp' ? data.group1Label : data.group1LabelEn;
  const label2 = lang === 'jp' ? data.group2Label : data.group2LabelEn;
  const metric = lang === 'jp' ? data.metric : data.metricEn;
  const fontSans = lang === 'jp' ? 'sans-serif' : 'sans-serif';

  // 背景
  ctx.fillStyle = C.bg;
  ctx.fillRect(0, 0, W, H);

  // アクセントライン（左）
  ctx.fillStyle = C.accent;
  ctx.fillRect(48, 56, 6, 72);

  // タイトル
  ctx.fillStyle = C.text;
  ctx.font = `bold 34px ${fontSans}`;
  ctx.fillText(title, 68, 104);

  // 指標ラベル
  ctx.fillStyle = C.textMuted;
  ctx.font = `16px ${fontSans}`;
  ctx.fillText(metric, 68, 138);

  // ── バーチャート ──────────────────────────────────────────
  const BAR_Y_START = 200;
  const BAR_HEIGHT = 64;
  const BAR_GAP = 48;
  const BAR_MAX_WIDTH = 800;
  const BAR_X = 200;
  const maxVal = Math.max(data.group1Value, data.group2Value);

  const bars = [
    { label: label1, value: data.group1Value, color: C.barPrimary },
    { label: label2, value: data.group2Value, color: C.barSecondary },
  ];

  bars.forEach((bar, i) => {
    const y = BAR_Y_START + i * (BAR_HEIGHT + BAR_GAP);
    const barW = (bar.value / maxVal) * BAR_MAX_WIDTH;

    // ラベル
    ctx.fillStyle = C.text;
    ctx.font = `600 20px ${fontSans}`;
    ctx.textAlign = 'right';
    ctx.fillText(bar.label, BAR_X - 16, y + BAR_HEIGHT / 2 + 7);
    ctx.textAlign = 'left';

    // バー（角丸）
    ctx.fillStyle = bar.color;
    roundRect(ctx, BAR_X, y, barW, BAR_HEIGHT, 8);
    ctx.fill();

    // 数値ラベル（バー右横）
    ctx.fillStyle = i === 0 ? C.accent : C.textMid;
    ctx.font = `bold 32px ${fontSans}`;
    ctx.fillText(`${bar.value}${data.unit}`, BAR_X + barW + 16, y + BAR_HEIGHT / 2 + 11);
  });

  // 差分ハイライト（矢印）
  const diff = data.group1Value - data.group2Value;
  if (diff > 0) {
    const arrowX = BAR_X + BAR_MAX_WIDTH + 80;
    const arrowY = BAR_Y_START + BAR_HEIGHT + BAR_GAP / 2;
    ctx.fillStyle = C.accent;
    ctx.font = `bold 28px ${fontSans}`;
    ctx.fillText(`+${diff}${data.unit}`, arrowX, arrowY + 10);
    ctx.font = `14px ${fontSans}`;
    ctx.fillStyle = C.textMuted;
    ctx.fillText(lang === 'jp' ? '差' : 'difference', arrowX, arrowY + 32);
  }

  // 区切り線
  ctx.strokeStyle = C.border;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(48, H - 80);
  ctx.lineTo(W - 48, H - 80);
  ctx.stroke();

  // 引用元
  ctx.fillStyle = C.textMuted;
  ctx.font = `14px ${fontSans}`;
  ctx.textAlign = 'left';
  ctx.fillText(`Source: ${data.source}`, 48, H - 48);

  // ロゴ/ブランド
  ctx.fillStyle = C.accent;
  ctx.font = `bold 16px ${fontSans}`;
  ctx.textAlign = 'right';
  ctx.fillText('ttcguide.co', W - 48, H - 48);
  ctx.textAlign = 'left';

  return canvas.toBuffer('image/png');
}

// ── カルーセル用 PNG （1080 × 1080） ─────────────────────────
function generateCarouselPng(data: InfographicData): Buffer {
  const W = 1080, H = 1080;
  const C = CAROUSEL_COLORS;
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext('2d');

  // 背景
  ctx.fillStyle = C.bg;
  ctx.fillRect(0, 0, W, H);

  // プログレスバー（ゴールド）
  ctx.fillStyle = C.progressBar;
  ctx.fillRect(0, 0, W * 0.55, 5);

  // RESEARCH DATA バッジ
  ctx.strokeStyle = C.accent;
  ctx.lineWidth = 2;
  roundRect(ctx, 48, 40, 220, 42, 21);
  ctx.stroke();
  ctx.fillStyle = C.accent;
  ctx.font = 'bold 16px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('RESEARCH DATA', 158, 66);
  ctx.textAlign = 'left';

  // タイトル
  ctx.fillStyle = C.text;
  ctx.font = 'bold 58px sans-serif';
  const titleLines = data.titleEn.length > 24
    ? [data.titleEn.slice(0, data.titleEn.lastIndexOf(' ', 24)), data.titleEn.slice(data.titleEn.lastIndexOf(' ', 24) + 1)]
    : [data.titleEn];
  titleLines.forEach((line, i) => ctx.fillText(line, 48, 150 + i * 68));

  // ── メイン数字 ──────────────────────────────────────────
  const bigNumY = titleLines.length > 1 ? 380 : 340;
  ctx.fillStyle = C.accent;
  ctx.font = 'bold 160px sans-serif';
  ctx.fillText(`${data.group1Value}${data.unit}`, 48, bigNumY);

  // Group1 ラベル
  ctx.fillStyle = C.textMuted;
  ctx.font = '22px sans-serif';
  ctx.fillText(data.group1LabelEn, 48, bigNumY + 36);

  // vs
  ctx.fillStyle = C.textMuted;
  ctx.font = 'bold 40px sans-serif';
  ctx.fillText(`vs ${data.group2Value}${data.unit}`, 48, bigNumY + 100);

  ctx.fillStyle = C.textMuted;
  ctx.font = '18px sans-serif';
  ctx.fillText(data.group2LabelEn, 48, bigNumY + 132);

  // ── バーチャート ────────────────────────────────────────
  const BAR_Y = bigNumY + 190;
  const BAR_H = 40;
  const BAR_MAX = W - 96;
  const maxVal = Math.max(data.group1Value, data.group2Value);

  [
    { value: data.group1Value, color: C.barPrimary },
    { value: data.group2Value, color: C.barSecondary },
  ].forEach((bar, i) => {
    const w = (bar.value / maxVal) * BAR_MAX;
    ctx.fillStyle = bar.color;
    roundRect(ctx, 48, BAR_Y + i * (BAR_H + 14), w, BAR_H, 6);
    ctx.fill();
  });

  // 区切り線
  ctx.strokeStyle = 'rgba(255,255,255,0.08)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(48, H - 100);
  ctx.lineTo(W - 48, H - 100);
  ctx.stroke();

  // 引用元
  ctx.fillStyle = C.textMuted;
  ctx.font = '15px sans-serif';
  ctx.fillText(data.source, 48, H - 70);

  // ハンドル
  ctx.fillStyle = C.textMuted;
  ctx.font = '18px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('@dr.sato.fertility.specialist', W / 2, H - 36);
  ctx.textAlign = 'left';

  return canvas.toBuffer('image/png');
}

// ── メイン ──────────────────────────────────────────────────
export async function generateInfographic(data: InfographicData, outDir?: string): Promise<{
  blogJp: string;
  blogEn: string;
  carousel: string;
}> {
  const dir = outDir || path.join(process.cwd(), 'public', 'infographics');
  fs.mkdirSync(dir, { recursive: true });

  const jpPath = path.join(dir, `${data.slug}-jp.png`);
  const enPath = path.join(dir, `${data.slug}-en.png`);
  const carouselPath = path.join(dir, `${data.slug}-carousel.png`);

  fs.writeFileSync(jpPath, generateBlogPng(data, 'jp'));
  fs.writeFileSync(enPath, generateBlogPng(data, 'en'));
  fs.writeFileSync(carouselPath, generateCarouselPng(data));

  console.log(`✅ 生成完了:`);
  console.log(`   ブログ(JP): ${jpPath}`);
  console.log(`   ブログ(EN): ${enPath}`);
  console.log(`   カルーセル: ${carouselPath}`);

  return { blogJp: jpPath, blogEn: enPath, carousel: carouselPath };
}

// ── CLI実行 ──────────────────────────────────────────────────
const isMain = process.argv[1]?.includes('generate-infographic');

if (isMain) {
  const dataFlagIndex = process.argv.indexOf('--data');
  const dataFlagInline = process.argv.find(a => a.startsWith('--data='));
  const arg = dataFlagInline
    ? dataFlagInline.replace('--data=', '')
    : dataFlagIndex !== -1
      ? process.argv[dataFlagIndex + 1]
      : null;

  if (!arg) {
    // デモ用サンプルデータ
    const sampleData: InfographicData = {
      title: 'CoQ10の卵子質への影響',
      titleEn: 'CoQ10 Impact on Fertilization Rate',
      group1Label: 'CoQ10群',
      group1LabelEn: 'CoQ10 Group',
      group1Value: 68,
      group2Label: 'コントロール群',
      group2LabelEn: 'Control Group',
      group2Value: 48,
      unit: '%',
      metric: '受精率',
      metricEn: 'Fertilization Rate',
      source: 'Xu Y. et al., Reproductive Biomedicine Online, 2018. PMID: 30416089',
      slug: 'coq10-egg-quality-demo',
    };
    generateInfographic(sampleData).catch(console.error);
  } else {
    generateInfographic(JSON.parse(arg)).catch(console.error);
  }
}
