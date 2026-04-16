/**
 * sheets-rest.ts — スプレッドシート更新ユーティリティ（サービスアカウント方式）
 *
 * 以前は OAuth + Refresh Token で動作していたが、`invalid_grant: Bad Request`
 * エラーで Slack 承認フローが止まる事故があったため、サービスアカウント方式に
 * 統一した。認証ロジックと SPREADSHEET_ID は src/lib/sheets.ts を共有する。
 *
 * NOTE: 呼び出し側は updateSheetRow(contentId, updates) / getSheetsRows() の
 * 既存シグネチャをそのまま使えるよう互換維持。
 */

import { google } from 'googleapis';
import { getGoogleAuthClient, QUEUE_SPREADSHEET_ID } from './sheets';

// 🔴 列順は実スプレッドシートのヘッダー行と厳密に一致させること。
// この配列は updateSheetRow() で「カラム名 → 列レター」の変換に使われる。
// 'brand' が抜けていたり 'ymyl_evidence' が漏れていたりすると status などが
// 1列ズレた位置に書き込まれ、Slack 承認が反映されない事故が起きる。
// 詳細: src/lib/sheets.ts の HEADERS と同期させること。
export const HEADERS = [
  'content_id', 'brand', 'type', 'title', 'cloudinary_url', 'cloudinary_public_id', 'gdrive_url',
  'generation_recipe', 'status', 'patrol_pre_result', 'scheduled_date', 'post_url',
  'posted_at', 'patrol_post_result', 'cloudinary_deleted', 'slack_ts', 'error_detail',
  'ymyl_evidence'
];

async function getSheetsClient() {
  const auth = await getGoogleAuthClient();
  // googleapis の型が AuthClient と GoogleAuth で微妙に異なるので any で吸収
  return google.sheets({ version: 'v4', auth: auth as any });
}

export async function getSheetsRows() {
  const sheets = await getSheetsClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: QUEUE_SPREADSHEET_ID,
    range: 'シート1!A2:R'
  });

  const rows = res.data.values || [];
  return rows.map((row: any[]) => {
    const obj: Record<string, string> = {};
    HEADERS.forEach((header, index) => {
      obj[header] = row[index] || '';
    });
    return obj;
  });
}

export async function updateSheetRow(contentId: string, updates: Record<string, string>) {
  const sheets = await getSheetsClient();

  // ID から行番号を特定するため A 列を取得
  const idsResponse = await sheets.spreadsheets.values.get({
    spreadsheetId: QUEUE_SPREADSHEET_ID,
    range: 'シート1!A2:A'
  });
  const ids = idsResponse.data.values || [];
  const rowIndex = ids.findIndex((row: any[]) => row[0] === contentId);

  if (rowIndex === -1) return false;

  const actualRowNumber = rowIndex + 2; // 1行目ヘッダー + 0-indexed → +2

  // 更新する列のみ batchUpdate 用データを組む
  const data: { range: string; values: string[][] }[] = [];
  for (const key of Object.keys(updates)) {
    const colIndex = HEADERS.indexOf(key);
    if (colIndex !== -1) {
      const letter = String.fromCharCode(65 + colIndex);
      data.push({
        range: `シート1!${letter}${actualRowNumber}`,
        values: [[updates[key]]]
      });
    }
  }

  if (data.length === 0) return false;

  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId: QUEUE_SPREADSHEET_ID,
    requestBody: {
      valueInputOption: 'USER_ENTERED',
      data
    }
  });
  return true;
}
