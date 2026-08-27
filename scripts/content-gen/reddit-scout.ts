/**
 * Theme Auto-Generator (旧 Reddit Scout)
 *
 * Gemini で TTC/不妊ドメインのブログテーマを生成し、ThemeSchedule(Google Sheets)
 * に追加する。
 *
 * かつては Reddit のコミュニティ投稿を収集して需要ドリブンにテーマを抽出していたが、
 * クラウドIP(GitHub Actions)からの Reddit 匿名アクセスが 403 で恒常的にブロックされ、
 * OAuth も新規/低karmaアカウント制限で取得不能。Reddit 収集は実装不能のため廃止した。
 * 現在はテーマを Gemini のドメイン知識＋直近パフォーマンス(feedback)＋既存テーマの
 * 重複回避から生成する（= 通常の Gemini 生成モード）。ファイル名/ワークフロー名は
 * 互換性のため据え置き。
 *
 * Usage:
 *   npx tsx scripts/content-gen/reddit-scout.ts
 */

import * as dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.join(process.cwd(), '.env') });
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

async function main() {
  console.log('🧠 Theme Auto-Generator (Gemini) — ブログテーマ生成\n');
  await generateThemes();
}

// ═════════════════════════════════════════════
// テーマ自動生成 → ThemeSchedule追加
// ═════════════════════════════════════════════

async function generateThemes() {
  console.log('🧠 ペインポイント想定 → テーマ生成...');

  // N4: フィードバックデータ読み込み（あれば）
  let feedbackContext = '';
  try {
    const fbPath = require('path').join(process.cwd(), 'scripts', 'content-gen', 'feedback-latest.json');
    const fb = JSON.parse(require('fs').readFileSync(fbPath, 'utf8'));
    feedbackContext = `\n【先週のパフォーマンスデータ（テーマ優先度の参考にすること）】\n${fb.summary}\n`;
    console.log(`   📈 フィードバックデータ読み込み済 (${fb.week})`);
  } catch {
    console.log('   📈 フィードバックデータなし（初回実行）');
  }

  // Step 1: 既存テーマを取得して重複防止
  let existingThemes: string[] = [];
  try {
    const { google } = await import('googleapis');
    const fs = await import('fs');
    let credentials;
    const saJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
    if (saJson && saJson.length > 10) {
      credentials = JSON.parse(saJson);
    } else {
      const keyPath = '/Users/satoutakuma/Desktop/claude/reels-factory/credentials/drive-service-account.json';
      credentials = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
    }
    const auth = new google.auth.GoogleAuth({ credentials, scopes: ['https://www.googleapis.com/auth/spreadsheets'] });
    const sheets = google.sheets({ version: 'v4', auth });
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: '1HkBDRsLcCyyx59CdgU-H-LoVIAM6KkC9NPqMjtAfpsY',
      range: 'ThemeSchedule!D:D'
    });
    existingThemes = (res.data.values || []).slice(1).map(r => r[0] || '').filter(Boolean);
    console.log(`   📊 既存テーマ ${existingThemes.length}件を重複チェック対象に`);
  } catch (e) {
    console.warn('   ⚠️ 既存テーマ取得失敗（重複チェックなしで続行）');
  }

  // Step 2: Geminiでテーマ生成
  const painPrompt = `あなたは不妊治療（TTC）コンテンツ戦略の専門家です。

あなたのドメイン知識と、英語圏TTC層の最新の関心・需要動向をもとに、ブログ記事のテーマを3〜5件提案してください。

【分析の視点】
1. 読者が実際に困っている「具体的な小さな疑問」を特定する
2. 既存の大テーマ記事ではなく、具体的なQ&A記事として書けるテーマにする
3. 医師の専門知識が価値を発揮する内容を優先する
4. 感情的なニーズからも「裏にある知識ニーズ」を読み取る
   例: 「HCGが上がらなくて不安」→ テーマ「HCG値の正常範囲と倍増速度のばらつき」

${feedbackContext}
【禁止】
- 以下の既存テーマと重複するテーマは絶対に生成しないでください:
${existingThemes.slice(-60).join('\n')}

【カテゴリ（いずれかに分類）】
①流産の恐怖・不安  ②治療プロトコルの混乱  ③身体のサイン解読
④精神的負担・人間関係  ⑤保険・費用・アクセス  ⑥医療者への不信感
⑦治療の副作用  ⑧サプリ・生活改善  ⑨特定診断のピア体験

【出力JSON】
[
  {
    "themeArea": "①流産の恐怖・不安",
    "theme": "具体的なQ&A形式のテーマ（40〜60文字）",
    "searchKeywords": "PubMed検索用の英語キーワード",
    "evidenceTier": "Tier A or Tier B"
  }
]

JSONのみを出力してください。`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: painPrompt,
      config: { temperature: 0.5, responseMimeType: 'application/json' },
    });

    const themes = JSON.parse((response.text || '[]').trim());
    if (!Array.isArray(themes) || themes.length === 0) {
      console.log('   ⚠️ テーマ生成結果が空');
      return;
    }

    console.log(`   ✅ ${themes.length}件のテーマを生成`);
    themes.forEach((t: any) => console.log(`      📝 [${t.themeArea}] ${t.theme}`));

    // Step 3: ThemeScheduleに追加
    try {
      const { google } = await import('googleapis');
      const fs = await import('fs');
      let credentials;
      const saJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
      if (saJson && saJson.length > 10) {
        credentials = JSON.parse(saJson);
      } else {
        const keyPath = '/Users/satoutakuma/Desktop/claude/reels-factory/credentials/drive-service-account.json';
        credentials = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
      }
      const auth = new google.auth.GoogleAuth({ credentials, scopes: ['https://www.googleapis.com/auth/spreadsheets'] });
      const sheets = google.sheets({ version: 'v4', auth });
      const spreadsheetId = '1HkBDRsLcCyyx59CdgU-H-LoVIAM6KkC9NPqMjtAfpsY';

      // 最終日付を取得
      const dateRes = await sheets.spreadsheets.values.get({ spreadsheetId, range: 'ThemeSchedule!A:A' });
      const allDates = (dateRes.data.values || []).slice(1).map(r => r[0]).filter(Boolean);
      let nextDate = new Date();
      if (allDates.length > 0) {
        const maxDate = new Date(Math.max(...allDates.map(d => new Date(d).getTime()).filter(t => !isNaN(t))));
        if (maxDate >= nextDate) {
          nextDate = new Date(maxDate);
          nextDate.setDate(nextDate.getDate() + 1);
        }
      }

      const rows = themes.map((t: any, idx: number) => {
        const d = new Date(nextDate);
        d.setDate(d.getDate() + idx);
        return [
          d.toISOString().split('T')[0],  // Date
          'book',                            // Brand
          t.themeArea,                       // ThemeArea
          t.theme,                           // Theme
          t.searchKeywords,                  // SearchKeywords
          '',                                // ReferenceURL
          'pending',                         // Status
          t.evidenceTier || 'Tier B',        // evidenceTier
          'Gemini auto',                     // 備考(生成元)
        ];
      });

      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: 'ThemeSchedule!A:I',
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: rows },
      });

      console.log(`   ✅ ${themes.length}件をThemeScheduleに追加`);

      // Slack通知
      // Slack報告は停止中（2026-08-27 取締役指示）。結果はActionsログに残る。再開は false を外す
      if (false && process.env.SLACK_BOT_TOKEN && process.env.SLACK_CHANNEL_ID) {
        const themeList = themes.map((t: any) => `• [${t.themeArea}] ${t.theme}`).join('\n');
        await fetch('https://slack.com/api/chat.postMessage', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.SLACK_BOT_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            channel: process.env.SLACK_CHANNEL_ID,
            text: `📊 新テーマ ${themes.length}件を自動追加(Gemini)\n${themeList}`,
          }),
        });
      }
    } catch (sheetsErr: any) {
      console.error('   ❌ ThemeSchedule追加失敗:', sheetsErr.message);
    }
  } catch (e: any) {
    console.error('   ❌ テーマ生成失敗:', e.message);
  }
}

main().catch(e => {
  console.error('❌ Fatal error:', e.message || e);
  process.exit(1);
});
