import fs from 'fs';

// Vercel環境ではprocess.envを使用、ローカル開発では.envファイルから読み込む
function getEnvVar(key: string): string {
  if (process.env[key]) return process.env[key]!;
  // ローカル開発時のフォールバック
  const envPath = '/Users/satoutakuma/Desktop/reels-factory/.env';
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    const match = content.match(new RegExp(`^${key}=(.*)$`, 'm'));
    if (match) return match[1].trim().replace(/^["']|["']$/g, '');
  }
  return '';
}

const CLIENT_ID = getEnvVar('GOOGLE_OAUTH_CLIENT_ID');
const CLIENT_SECRET = getEnvVar('GOOGLE_OAUTH_CLIENT_SECRET');
const SHEET_ID = getEnvVar('GOOGLE_SHEETS_QUEUE_ID');

// トークンを取得する（新しいアクセストークンをリフレッシュする）
async function getAccessToken(): Promise<string> {
  // 1. 環境変数からリフレッシュトークンを取得（Vercel用）
  let refresh_token = process.env.GOOGLE_REFRESH_TOKEN || '';

  // 2. ローカル開発時はtoken.jsonから取得
  if (!refresh_token) {
    const tokenPath = '/Users/satoutakuma/Desktop/reels-factory/scripts/data/token.json';
    if (fs.existsSync(tokenPath)) {
      const tokenData = JSON.parse(fs.readFileSync(tokenPath, 'utf8'));
      refresh_token = tokenData.refresh_token || '';
      if (!refresh_token) return tokenData.access_token;
    }
  }

  if (!refresh_token) throw new Error('No refresh token available (set GOOGLE_REFRESH_TOKEN env var)');

  // Refresh Token を使って Access Token を再取得
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      refresh_token: refresh_token,
      grant_type: 'refresh_token'
    })
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Failed to refresh token: ${error}`);
  }

  const data = await res.json();
  return data.access_token;
}

export const HEADERS = [
  'content_id', 'type', 'title', 'cloudinary_url', 'cloudinary_public_id', 'gdrive_url',
  'generation_recipe', 'status', 'patrol_pre_result', 'scheduled_date', 'post_url',
  'posted_at', 'patrol_post_result', 'cloudinary_deleted', 'slack_ts', 'error_detail'
];

export async function getSheetsRows() {
  const accessToken = await getAccessToken();
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/A2:P`;
  
  const res = await fetch(url, {
    headers: { 'Authorization': `Bearer ${accessToken}` }
  });
  
  if (!res.ok) throw new Error(`Google Sheets API Error: ${await res.text()}`);
  
  const data = await res.json();
  const rows = data.values || [];
  
  return rows.map((row: any[]) => {
    const obj: Record<string, string> = {};
    HEADERS.forEach((header, index) => {
      obj[header] = row[index] || '';
    });
    return obj;
  });
}

export async function updateSheetRow(contentId: string, updates: Record<string, string>) {
  const accessToken = await getAccessToken();
  
  // IDから行番号を特定するためにもう一度最新を取得
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/A2:A`;
  const res = await fetch(url, {
    headers: { 'Authorization': `Bearer ${accessToken}` }
  });
  
  if (!res.ok) throw new Error(`Failed to fetch sheet IDs: ${await res.text()}`);
  const data = await res.json();
  const ids = data.values || [];
  const rowIndex = ids.findIndex((row: string[]) => row[0] === contentId);
  
  if (rowIndex === -1) return false;
  
  const actualRowNumber = rowIndex + 2;
  const dataToUpdate = [];
  
  for (const key of Object.keys(updates)) {
    const colIndex = HEADERS.indexOf(key);
    if (colIndex !== -1) {
      const letter = String.fromCharCode(65 + colIndex);
      dataToUpdate.push({
        range: `${letter}${actualRowNumber}`,
        values: [[updates[key]]]
      });
    }
  }

  if (dataToUpdate.length > 0) {
    const updateUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values:batchUpdate`;
    const updateRes = await fetch(updateUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        valueInputOption: 'USER_ENTERED',
        data: dataToUpdate
      })
    });
    
    if (!updateRes.ok) throw new Error(`Failed to update sheet: ${await updateRes.text()}`);
    return true;
  }
  return false;
}
