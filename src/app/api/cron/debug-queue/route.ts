import { NextResponse } from 'next/server';
import { getQueueItems } from '@/lib/sheets';
export async function GET() {
  const items = await getQueueItems();
  const reels = items.filter(i => i.type === 'reel').map(i=>i.generation_recipe);
  const carousels = items.filter(i => i.type === 'carousel').map(i=>i.generation_recipe);
  return NextResponse.json({ reels: reels.slice(-1), carousels: carousels.slice(-1) });
}
