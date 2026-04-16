/**
 * ブランド識別子と表示ヘルパー。
 *
 * NOTE: 同一内容のファイルが the-skin-atelier リポジトリにも存在する:
 *   - /Users/satoutakuma/Desktop/hiroo-open/the-skin-atelier/src/lib/brand.ts
 *   - /Users/satoutakuma/Desktop/hiroo-open/the-skin-atelier/scripts/lib/brand.ts
 * どちらかを変更する際は両方を同期すること。
 */

export type Brand = 'atelier' | 'book';

/**
 * Slack 通知等に表示するブランドバッジ文字列。
 * - atelier: 美容皮膚科（Skin Atelier / hiroo-open.com）
 * - book:    出版・執筆関連（ttcguide.co）
 */
export function brandBadge(brand: string | undefined | null): string {
  return brand === 'atelier' ? '🟩 Skin Atelier' : '📚 TTC Guide';
}
