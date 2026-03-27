import { google } from 'googleapis';
import fs from 'fs';

// Helper to get Google Auth Client
export async function getGoogleAuthClient() {
  let credentials;

  // Vercel等クラウド環境では環境変数から読み込む
  if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
    credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
  } else {
    // ローカル開発環境ではreels-factoryの鍵ファイルを直接参照
    const keyPath = '/Users/satoutakuma/Desktop/reels-factory/credentials/drive-service-account.json';
    if (!fs.existsSync(keyPath)) {
      throw new Error('Google Service Account key not found.');
    }
    credentials = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
  }

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  return auth.getClient();
}

/**
 * 共有されているキュー管理スプレッドシートのID
 */
export const QUEUE_SPREADSHEET_ID = '1HkBDRsLcCyyx59CdgU-H-LoVIAM6KkC9NPqMjtAfpsY';

/**
 * スプレッドシートのヘッダー行（1行目）を取得して確認するためのテスト関数
 */
export async function fetchSpreadsheetHeaders() {
  const auth = await getGoogleAuthClient();
  const sheets = google.sheets({ version: 'v4', auth: auth as any });

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: QUEUE_SPREADSHEET_ID,
      range: 'シート1!A1:Z1', // 「シート1」または実際のシート名を推測
    });
    
    // 如果シート1でエラーになる場合は、シート情報をメタデータから取得する
    return response.data.values?.[0] || [];
  } catch (error: any) {
    console.error('Failed to fetch headers:', error.message);
    return [];
  }
}

// ============================================================================
// Queue Management Functions
// ============================================================================

export type QueueItem = {
  content_id: string;
  type: string;
  title: string;
  cloudinary_url: string;
  cloudinary_public_id: string;
  gdrive_url: string;
  generation_recipe: string;
  status: string;
  patrol_pre_result: string;
  scheduled_date: string;
  post_url: string;
  posted_at: string;
  patrol_post_result: string;
  cloudinary_deleted: string;
  slack_ts: string;
  error_detail: string;
};

const HEADERS = [
  'content_id', 'type', 'title', 'cloudinary_url', 'cloudinary_public_id', 'gdrive_url', 
  'generation_recipe', 'status', 'patrol_pre_result', 'scheduled_date', 'post_url', 
  'posted_at', 'patrol_post_result', 'cloudinary_deleted', 'slack_ts', 'error_detail'
];

/**
 * キューに新しいコンテンツ（原案）を登録する
 */
export async function addQueueItem(item: Partial<QueueItem>) {
  const auth = await getGoogleAuthClient();
  const sheets = google.sheets({ version: 'v4', auth: auth as any });

  const rowData = HEADERS.map(header => item[header as keyof QueueItem] || '');

  await sheets.spreadsheets.values.append({
    spreadsheetId: QUEUE_SPREADSHEET_ID,
    range: 'A:P', 
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [rowData]
    }
  });
}

/**
 * 条件に合致する全てのキューアイテムを取得する
 */
export async function getQueueItems(): Promise<(QueueItem & { rowNumber: number })[]> {
  const auth = await getGoogleAuthClient();
  const sheets = google.sheets({ version: 'v4', auth: auth as any });

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: QUEUE_SPREADSHEET_ID,
    range: 'A:P',
  });

  const rows = response.data.values;
  if (!rows || rows.length <= 1) return [];

  const items: (QueueItem & { rowNumber: number })[] = [];
  
  // 1行目はヘッダーなのでi=1から開始し、2行目を指す
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const item: any = { rowNumber: i + 1 };
    HEADERS.forEach((header, index) => {
      item[header] = row[index] || '';
    });
    items.push(item as (QueueItem & { rowNumber: number }));
  }

  return items;
}

/**
 * 特定の行(Row)のステータスやデータを更新する
 */
export async function updateQueueItem(rowNumber: number, updates: Partial<QueueItem>) {
  const auth = await getGoogleAuthClient();
  const sheets = google.sheets({ version: 'v4', auth: auth as any });

  // 変更するカラムの特定と書き換え
  for (const [key, value] of Object.entries(updates)) {
    const colIndex = HEADERS.indexOf(key);
    if (colIndex === -1) continue;

    const columnLetter = String.fromCharCode(65 + colIndex); // A, B, C...
    const range = `${columnLetter}${rowNumber}`;

    await sheets.spreadsheets.values.update({
      spreadsheetId: QUEUE_SPREADSHEET_ID,
      range,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[value]]
      }
    });
  }
}

