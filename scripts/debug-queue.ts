import { getQueueItems } from './src/lib/sheets';
async function main() {
  const items = await getQueueItems();
  const reels = items.filter(i => i.type === 'reel');
  const carousels = items.filter(i => i.type === 'carousel');
  console.log(`Found ${reels.length} reels and ${carousels.length} carousels`);
  if (reels.length) console.log('Reel sample:', reels[reels.length - 1].generation_recipe.substring(0, 100));
  if (carousels.length) console.log('Carousel sample:', carousels[carousels.length - 1].generation_recipe.substring(0, 100));
}
main().catch(console.error);
