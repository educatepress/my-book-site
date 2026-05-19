/**
 * N3: GA4 週次パフォーマンス集計
 *
 * GA4 Data API で過去7日間の記事別PV・エンゲージメントを取得し、
 * Google Sheets の PostMetrics シートに書き込む。
 * N4 (Feedback→Plan反映) のデータソースとなる。
 *
 * Usage: npx tsx scripts/analytics-weekly.ts
 */

import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });
dotenv.config({ path: '.env.local' });
import { google } from 'googleapis';
import fs from 'fs';

const GA4_PROPERTY_ID = '529547528';
const SPREADSHEET_ID = '1HkBDRsLcCyyx59CdgU-H-LoVIAM6KkC9NPqMjtAfpsY';

async function getAuthClient() {
  let credentials;
  const saJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (saJson && saJson.length > 10) {
    credentials = JSON.parse(saJson);
  } else {
    const keyPath = '/Users/satoutakuma/Desktop/reels-factory/credentials/drive-service-account.json';
    credentials = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
  }
  return new google.auth.GoogleAuth({
    credentials,
    scopes: [
      'https://www.googleapis.com/auth/analytics.readonly',
      'https://www.googleapis.com/auth/spreadsheets',
    ],
  });
}

interface ArticleMetrics {
  path: string;
  title: string;
  pageviews: number;
  engagedSessions: number;
  avgEngagementTime: number;
  bounceRate: number;
}

async function fetchGA4Data(auth: any): Promise<ArticleMetrics[]> {
  const analyticsData = google.analyticsdata({ version: 'v1beta', auth });

  const response = await analyticsData.properties.runReport({
    property: `properties/${GA4_PROPERTY_ID}`,
    requestBody: {
      dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
      dimensions: [
        { name: 'pagePath' },
        { name: 'pageTitle' },
      ],
      metrics: [
        { name: 'screenPageViews' },
        { name: 'engagedSessions' },
        { name: 'averageSessionDuration' },
        { name: 'bounceRate' },
      ],
      dimensionFilter: {
        orGroup: {
          expressions: [
            {
              filter: {
                fieldName: 'pagePath',
                stringFilter: { matchType: 'BEGINS_WITH', value: '/blog/' },
              },
            },
            {
              filter: {
                fieldName: 'pagePath',
                stringFilter: { matchType: 'BEGINS_WITH', value: '/en/blog/' },
              },
            },
          ],
        },
      },
      orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
      limit: 100,
    },
  });

  const rows = response.data.rows || [];
  return rows.map(row => ({
    path: row.dimensionValues?.[0]?.value || '',
    title: row.dimensionValues?.[1]?.value || '',
    pageviews: parseInt(row.metricValues?.[0]?.value || '0', 10),
    engagedSessions: parseInt(row.metricValues?.[1]?.value || '0', 10),
    avgEngagementTime: parseFloat(row.metricValues?.[2]?.value || '0'),
    bounceRate: parseFloat(row.metricValues?.[3]?.value || '0'),
  }));
}

function categorizeArticle(path: string, title: string): string {
  const text = (path + ' ' + title).toLowerCase();
  if (/miscarriage|hcg|流産|心拍|化学流産/.test(text)) return '①流産の恐怖・不安';
  if (/pgt|ivf|iui|fet|protocol|転院|採卵|移植/.test(text)) return '②治療プロトコルの混乱';
  if (/opk|bbt|amh|afc|排卵|周期|基礎体温/.test(text)) return '③身体のサイン解読';
  if (/mental|stress|partner|リラックス|メンタル|パートナー/.test(text)) return '④精神的負担・人間関係';
  if (/cost|insurance|subsidy|助成|費用|保険/.test(text)) return '⑤保険・費用・アクセス';
  if (/doctor|clinic|second.opinion|セカンド|転院|不信/.test(text)) return '⑥医療者への不信感';
  if (/side.effect|letrozole|progesterone|ohss|副作用|レトロゾール/.test(text)) return '⑦治療の副作用';
  if (/supplement|vitamin|coq10|folic|diet|サプリ|葉酸|食事|運動/.test(text)) return '⑧サプリ・生活改善';
  if (/pcos|endometri|septate|varicocele|子宮内膜/.test(text)) return '⑨特定診断のピア体験';
  return '分類外';
}

async function writeToSheets(auth: any, metrics: ArticleMetrics[]) {
  const sheets = google.sheets({ version: 'v4', auth });
  const weekLabel = new Date().toISOString().split('T')[0];

  // PostMetrics シートの存在確認 → なければ作成
  const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });
  const sheetExists = spreadsheet.data.sheets?.some(s => s.properties?.title === 'PostMetrics');

  if (!sheetExists) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        requests: [{ addSheet: { properties: { title: 'PostMetrics' } } }],
      },
    });
    // ヘッダー追加
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: 'PostMetrics!A1:H1',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [['week', 'path', 'title', 'category', 'pageviews', 'engagedSessions', 'avgEngagementTime', 'bounceRate']],
      },
    });
  }

  // データ行を追加
  const rows = metrics.map(m => [
    weekLabel,
    m.path,
    m.title.substring(0, 80),
    categorizeArticle(m.path, m.title),
    m.pageviews,
    m.engagedSessions,
    Math.round(m.avgEngagementTime),
    Math.round(m.bounceRate * 100) / 100,
  ]);

  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: 'PostMetrics!A:H',
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: rows },
  });

  return rows.length;
}

async function generateFeedbackSummary(auth: any, metrics: ArticleMetrics[]): Promise<string> {
  // カテゴリ別集計
  const catStats: Record<string, { pv: number; count: number }> = {};
  for (const m of metrics) {
    const cat = categorizeArticle(m.path, m.title);
    if (!catStats[cat]) catStats[cat] = { pv: 0, count: 0 };
    catStats[cat].pv += m.pageviews;
    catStats[cat].count += 1;
  }

  const sorted = Object.entries(catStats).sort((a, b) => b[1].pv - a[1].pv);
  const lines = sorted.map(([cat, stats]) =>
    `${cat}: ${stats.pv} PV (${stats.count}記事, 平均${Math.round(stats.pv / stats.count)} PV/記事)`
  );

  const top5 = metrics.slice(0, 5).map(m =>
    `  ${m.pageviews} PV — ${m.title.substring(0, 50)}`
  );

  return `【週次パフォーマンスサマリー】
カテゴリ別PV:
${lines.join('\n')}

TOP5記事:
${top5.join('\n')}

示唆: PVが多いカテゴリのテーマを優先的に生成すべき。PVゼロのカテゴリは需要がない可能性あり。`;
}

async function main() {
  console.log('📊 GA4 週次パフォーマンス集計...');

  const auth = await getAuthClient();
  const metrics = await fetchGA4Data(auth);

  console.log(`   📈 ${metrics.length}件のブログ記事データを取得`);

  if (metrics.length === 0) {
    console.log('   ⚠️ ブログ記事のアクセスデータなし');
    return;
  }

  // TOP5表示
  console.log('\n   🏆 TOP5:');
  metrics.slice(0, 5).forEach(m =>
    console.log(`      ${m.pageviews} PV — ${m.path}`)
  );

  // Sheetsに書き込み
  const written = await writeToSheets(auth, metrics);
  console.log(`\n   ✅ PostMetricsシートに${written}行を追加`);

  // フィードバックサマリー生成（N4で使う）
  const summary = await generateFeedbackSummary(auth, metrics);
  console.log('\n' + summary);

  // Slack通知
  if (process.env.SLACK_BOT_TOKEN && process.env.SLACK_CHANNEL_ID) {
    await fetch('https://slack.com/api/chat.postMessage', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.SLACK_BOT_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        channel: process.env.SLACK_CHANNEL_ID,
        text: `📊 週次GA4レポート\n\`\`\`\n${summary}\n\`\`\``,
      }),
    });
    console.log('   📨 Slackに送信');
  }

  // フィードバックサマリーをファイルに保存（reddit-scoutが参照する）
  const feedbackPath = require('path').join(process.cwd(), 'scripts', 'content-gen', 'feedback-latest.json');
  const feedbackData = {
    week: new Date().toISOString().split('T')[0],
    categoryPV: Object.fromEntries(
      Object.entries(
        metrics.reduce((acc, m) => {
          const cat = categorizeArticle(m.path, m.title);
          acc[cat] = (acc[cat] || 0) + m.pageviews;
          return acc;
        }, {} as Record<string, number>)
      ).sort((a, b) => (b[1] as number) - (a[1] as number))
    ),
    top10: metrics.slice(0, 10).map(m => ({ path: m.path, pv: m.pageviews })),
    summary,
  };
  require('fs').writeFileSync(feedbackPath, JSON.stringify(feedbackData, null, 2));
  console.log(`   💾 feedback-latest.json を保存`);
}

main().catch(e => {
  console.error('❌ Error:', e.message || e);
  process.exit(1);
});
