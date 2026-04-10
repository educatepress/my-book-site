import { getQueueItems } from './src/lib/sheets';

async function run() {
  const items = await getQueueItems();
  const approved = items.filter(i => i.status === 'approved');
  console.log(`Approved items count: ${approved.length}`);
  for (const a of approved) {
    console.log(`- [${a.type}] ${a.title}`);
  }
}
run();
