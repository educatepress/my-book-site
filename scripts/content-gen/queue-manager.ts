import fs from 'fs/promises';
import path from 'path';

export interface QueueItem {
    id: string;
    theme: string;
    themeEn: string;
    sourceUrls: string[];
    direction: string;
    directionEn: string;
    type: "x" | "blog";
    status: "pending" | "generated" | "posted";
}

export interface ContentQueue {
    lastUpdated: string;
    sourceReport: string;
    queue: QueueItem[];
}

const QUEUE_FILE_PATH = path.join(process.cwd(), 'scripts', 'content-gen', 'content-queue.json');

export async function getQueue(): Promise<ContentQueue> {
    try {
        const data = await fs.readFile(QUEUE_FILE_PATH, 'utf8');
        return JSON.parse(data) as ContentQueue;
    } catch (e: any) {
        if (e.code === 'ENOENT') {
            console.error(`❌ Queue file not found at ${QUEUE_FILE_PATH}`);
        } else {
            console.error("❌ Failed to parse content-queue.json");
        }
        throw e;
    }
}

export async function saveQueue(queueData: ContentQueue): Promise<void> {
    const jsonStr = JSON.stringify(queueData, null, 2);
    await fs.writeFile(QUEUE_FILE_PATH, jsonStr, 'utf8');
}

/**
 * Gets the oldest pending item of a specific type.
 */
export async function getNextPendingItem(type: "x" | "blog"): Promise<QueueItem | null> {
    const data = await getQueue();
    const item = data.queue.find(q => q.status === 'pending' && q.type === type);
    return item || null;
}

/**
 * Updates the status of an item and saves the queue.
 */
export async function markItemStatus(itemId: string, newStatus: "generated" | "posted"): Promise<void> {
    const data = await getQueue();
    const itemIndex = data.queue.findIndex(q => q.id === itemId);
    
    if (itemIndex > -1) {
        data.queue[itemIndex].status = newStatus;
        await saveQueue(data);
        console.log(`✅ Queue item [${itemId}] marked as ${newStatus}.`);
    } else {
        console.error(`⚠️ Warning: Item [${itemId}] not found in queue.`);
    }
}
