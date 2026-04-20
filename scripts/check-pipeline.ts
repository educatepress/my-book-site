/**
 * Pipeline health check — run anytime to see system status
 * Usage: cd reels-factory && npx tsx ../my-book-site-fix/scripts/check-pipeline.ts
 */
import { getSheetsClient } from './scripts/lib/google-client';
import * as dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.join(process.cwd(), '.env') });

async function main() {
  const sheets = await getSheetsClient();
  const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_QUEUE_ID!;

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: 'シート1!A1:R50',
  });
  const rows = res.data.values || [];
  const h = rows[0];
  const idx = (name: string) => h.indexOf(name);

  console.log('═'.repeat(60));
  console.log('📊 PIPELINE HEALTH CHECK');
  console.log('═'.repeat(60));

  // Status counts
  const counts: Record<string, Record<string, number>> = {};
  for (let i = 1; i < rows.length; i++) {
    const brand = rows[i][idx('brand')] || 'unknown';
    const status = rows[i][idx('status')] || 'empty';
    if (!counts[brand]) counts[brand] = {};
    counts[brand][status] = (counts[brand][status] || 0) + 1;
  }
  console.log('\n📦 Queue by brand:');
  for (const [brand, statuses] of Object.entries(counts)) {
    console.log(`  ${brand}: ${JSON.stringify(statuses)}`);
  }

  // Book items detail
  console.log('\n📖 Book items:');
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][idx('brand')] === 'book') {
      const cloud = rows[i][idx('cloudinary_url')] || '';
      const status = rows[i][idx('status')];
      const type = rows[i][idx('type')];
      const err = rows[i][idx('error_detail')] || '';
      const icon = status === 'posted' ? '✅' : status === 'approved' ? '🟡' : status === 'waiting_for_render' ? '🔧' : '⬜';
      console.log(`  ${icon} ${type} | ${status} | cloud: ${cloud ? 'YES' : 'NO'} | err: ${err || 'none'}`);
    }
  }

  // ThemeSchedule upcoming
  const tsRes = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: 'ThemeSchedule!A1:I50',
  });
  const tsRows = tsRes.data.values || [];
  const today = new Date().toISOString().split('T')[0];
  const upcoming = tsRows.filter((r, i) => i > 0 && r[1] === 'book' && r[0] >= today);
  console.log(`\n📅 ThemeSchedule: ${upcoming.length} upcoming book themes`);
  upcoming.slice(0, 3).forEach(r => console.log(`  ${r[0]} | ${r[6] || 'pending'} | ${(r[3] || '').substring(0, 50)}`));

  console.log('\n' + '═'.repeat(60));
}

main().catch(e => console.error(e.message));
