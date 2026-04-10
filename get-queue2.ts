import { google } from 'googleapis';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

async function getAuthClient() {
  const accountStr = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!accountStr) {
     // fallback to local credentials file
     return new google.auth.GoogleAuth({
       keyFile: path.join(process.cwd(), '.credentials', 'drive-service-account.json'),
       scopes: ['https://www.googleapis.com/auth/spreadsheets'],
     });
  }
  const account = JSON.parse(accountStr);
  return new google.auth.GoogleAuth({
    credentials: {
      client_email: account.client_email,
      private_key: account.private_key,
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
}

async function run() {
  try {
    const auth = await getAuthClient();
    const sheets = google.sheets({ version: 'v4', auth });
    
    console.log("Fetching Queue...");
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEETS_QUEUE_ID || '1HkBDRsLcCyyx59CdgU-H-LoVIAM6KkC9NPqMjtAfpsY',
      range: 'Queue!A:N',
    });

    const rows = res.data.values || [];
    const headers = rows[0];
    
    // Print last 5 rows
    const last10 = rows.slice(-5);
    for (const r of last10) {
       console.log(`[${r[0]}] Type: ${r[2]}, Slug: ${r[3]}, Status: ${r[5]}, Scheduled: ${r[7]}, Posted: ${r[8]}, Error: ${r[12]}`);
    }
  } catch (error) {
    console.error(error);
  }
}
run();
