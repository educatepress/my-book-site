import fs from 'fs';
import path from 'path';
import { google, drive_v3, sheets_v4 } from 'googleapis';
import dotenv from 'dotenv';

// Attempt to load local env if exists, else it runs on Vercel
const envPath = path.join(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

// webpage.new doesn't have the credentials natively, but we can access reels-factory's
const SERVICE_ACCOUNT_PATH = path.join(process.cwd(), '..', 'reels-factory', 'credentials', 'drive-service-account.json');

const SCOPES = [
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/spreadsheets'
];

export async function getGoogleClient() {
  // If we're on Vercel, we can't use local service account file. We must use ENV vars.
  // We'll support standard Google Auth if the file is missing (for future Vercel deployment)
  if (!fs.existsSync(SERVICE_ACCOUNT_PATH)) {
    // Check if we have ENV vars for service account
    if (process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_PRIVATE_KEY) {
      const auth = new google.auth.GoogleAuth({
        credentials: {
          client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
          private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        },
        scopes: SCOPES,
      });
      return auth.getClient();
    } else {
      console.warn(`⚠️ Service Account key not found and no EnvVars set!`);
      throw new Error("Cannot authenticate with Google APIs");
    }
  } else {
    // Local File loading
    const credentials = JSON.parse(fs.readFileSync(SERVICE_ACCOUNT_PATH, 'utf8'));
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: SCOPES,
    });
    return auth.getClient();
  }
}

export async function getDriveClient(): Promise<drive_v3.Drive> {
  const auth = await getGoogleClient();
  // @ts-ignore
  return google.drive({ version: 'v3', auth });
}

export async function getSheetsClient(): Promise<sheets_v4.Sheets> {
  const auth = await getGoogleClient();
  // @ts-ignore
  return google.sheets({ version: 'v4', auth });
}

export async function findOrCreateFolder(
  drive: drive_v3.Drive,
  name: string,
  parentId: string,
): Promise<string> {
  const res = await drive.files.list({
    q: `'${parentId}' in parents and name='${name}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
    fields: 'files(id, name)',
    spaces: 'drive',
  });

  if (res.data.files && res.data.files.length > 0) {
    return res.data.files[0].id!;
  }

  const folder = await drive.files.create({
    requestBody: { name, mimeType: 'application/vnd.google-apps.folder', parents: [parentId] },
    fields: 'id',
  });
  return folder.data.id!;
}

export async function uploadFile(
  drive: drive_v3.Drive,
  localPath: string,
  parentId: string,
  fileName?: string,
): Promise<{ id: string; webViewLink: string }> {
  const name = fileName || path.basename(localPath);
  const mimeTypes: Record<string, string> = {
    '.md': 'text/markdown',
    '.mdx': 'text/markdown',
    '.txt': 'text/plain',
    '.json': 'application/json',
  };
  const ext = path.extname(localPath).toLowerCase();
  const mimeType = mimeTypes[ext] || 'application/octet-stream';

  const res = await drive.files.create({
    requestBody: { name, parents: [parentId] },
    media: { mimeType, body: fs.createReadStream(localPath) },
    fields: 'id, webViewLink',
  });

  await drive.permissions.create({
    fileId: res.data.id!,
    requestBody: { role: 'reader', type: 'anyone' },
  });

  return { id: res.data.id!, webViewLink: res.data.webViewLink || '' };
}

export async function downloadFileJSON(
  drive: drive_v3.Drive,
  fileId: string
): Promise<any> {
  const res = await drive.files.get({
    fileId,
    alt: 'media',
  });
  return res.data;
}
