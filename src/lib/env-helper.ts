import fs from 'fs';

/**
 * Vercel環境ではprocess.envを使用、ローカル開発ではreels-factory/.envからフォールバック
 */
export function getEnvVar(key: string): string {
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
