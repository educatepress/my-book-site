import { getQueueItems, updateQueueItem } from './src/lib/sheets';

async function run() {
  const items = await getQueueItems();
  
  for (const item of items) {
    if (item.status === 'approved' && item.error_detail) {
      console.log(`Setting [${item.type}] ${item.title} to failed...`);
      await updateQueueItem(item.rowNumber, { status: 'failed' });
    }
  }
}
run();
