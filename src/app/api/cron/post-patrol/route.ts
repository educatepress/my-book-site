import { NextResponse } from 'next/server';
import { getSheetsRows, updateSheetRow } from '@/lib/sheets-rest';
import crypto from 'crypto';
import { getEnvVar } from '@/lib/env-helper';

const CLOUD_NAME = getEnvVar('CLOUDINARY_CLOUD_NAME');
const API_KEY = getEnvVar('CLOUDINARY_API_KEY');
const API_SECRET = getEnvVar('CLOUDINARY_API_SECRET');

// Cloudinary の削除 API を SDKゼロ(Fetchのみ)で叩くためのヘルパー
async function deleteFromCloudinary(publicId: string, resourceType: string = 'video') {
  if (!CLOUD_NAME || !API_KEY || !API_SECRET) {
    throw new Error('Cloudinary credentials missing in .env');
  }

  const timestamp = Math.floor(Date.now() / 1000).toString();
  // Cloudinary signature generation: SHA-1 of `public_id=<id>&timestamp=<ts><api_secret>`
  const strToSign = `public_id=${publicId}&timestamp=${timestamp}${API_SECRET}`;
  const signature = crypto.createHash('sha1').update(strToSign).digest('hex');

  const formData = new URLSearchParams();
  formData.append('public_id', publicId);
  formData.append('api_key', API_KEY);
  formData.append('timestamp', timestamp);
  formData.append('signature', signature);

  // endpoint: /image/destroy or /video/destroy
  const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/destroy`;

  const res = await fetch(url, {
    method: 'POST',
    body: formData
  });

  if (!res.ok) {
    const err = await res.text();
    console.error(`[Cloudinary Destroy] Cloudinary API Delete Failed for ${publicId}:`, err);
    return false;
  }
  
  const data = await res.json();
  return data.result === 'ok';
}

export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    if (process.env.NODE_ENV !== 'development') {
      return new Response('Unauthorized', { status: 401 });
    }
  }

  try {
    console.log('[Post Patrol] Starting Cloudinary Cleanup Patrol...');
    const rows = await getSheetsRows();

    // "posted" 状態で、まだパトロールが完了していない（=まだ削除していない）ものを取得
    const targets = rows.filter((row: any) => 
      row.status === 'posted' &&
      (row.patrol_post_result === 'pending' || row.patrol_post_result === '') &&
      row.cloudinary_deleted !== 'true'
    );

    if (targets.length === 0) {
      console.log('[Post Patrol] 削除対象の保留コンテンツはありませんでした');
      return NextResponse.json({ message: 'No targets to patrol today.' });
    }

    const report = [];

    for (const target of targets) {
      console.log(`[Post Patrol] Treating content: ${target.content_id}`);
      
      // Instagram側が処理を終えている前提で、ただちに Cloudinary からファイルを爆破する
      const publicId = target.cloudinary_public_id;
      if (publicId) {
        try {
          // reel の場合は video 型、carousel は画像なので image 型のコンテナに保存してあるか確認が必要
          // 今回のシステムはリールは MP4、カルーセルは画像なので分岐する
          const resourceType = target.type === 'reel' ? 'video' : 'image';
          const success = await deleteFromCloudinary(publicId, resourceType);

          if (success) {
            console.log(`[Post Patrol] 💣 Cloudinaryからファイル削除成功: ${publicId}`);
            await updateSheetRow(target.content_id, {
              patrol_post_result: 'ok',
              cloudinary_deleted: 'true'
            });
            report.push(`✅ ${target.content_id}: Deleted ${publicId}`);
          } else {
            // 見つからなかった場合等
            await updateSheetRow(target.content_id, { patrol_post_result: 'ng' });
            report.push(`❌ ${target.content_id}: Delete API returned non-ok result`);
          }
        } catch (e: any) {
          console.error(`[Post Patrol] Cloudinary delete function threw error:`, e);
          await updateSheetRow(target.content_id, { patrol_post_result: 'error' });
          report.push(`❌ ${target.content_id}: System Error`);
        }
      } else {
        // public_id がない場合は消すものがないのでOKとする
        console.log(`[Post Patrol] cloudinary_public_id なし。スキップします`);
        await updateSheetRow(target.content_id, { patrol_post_result: 'ok', cloudinary_deleted: 'true' });
        report.push(`⏭️ ${target.content_id}: No Public ID`);
      }
    }

    return NextResponse.json({ 
      success: true, 
      report 
    });

  } catch (error: any) {
    console.error('[Post Patrol] 致命的なエラー:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
