import { Octokit } from '@octokit/rest';
import 'dotenv/config';
import { getQueueItems, updateQueueItem } from '../src/lib/sheets';

async function main() {
  const contentId = process.argv[2];
  if (!contentId) {
    console.error('❌ Please provide a contentId as an argument.');
    process.exit(1);
  }

  console.log(`🚀 Starting GitHub Rollback (Delete) for content: ${contentId}`);

  const items = await getQueueItems();
  const targetItem = items.find((item: any) => item.content_id === contentId);

  if (!targetItem) {
    console.error(`❌ Queue item not found: ${contentId}`);
    process.exit(1);
  }

  if (targetItem.status !== 'posted') {
    console.log(`ℹ️ Item is not posted yet. Cannot rollback.`);
    process.exit(0);
  }

  const slug = contentId.replace('blog-', '');

  const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
  const owner = process.env.GITHUB_OWNER || 'educatepress';
  const repo = 'my-book-site'; // hardcoded for webpage.new

  const commitMessage = `Rollback (Delete) blog: ${slug} via AG Agent Dispatcher`;

  try {
    async function deleteFileFromGitHub(filePath: string) {
      let fileSha = undefined;
      try {
        const { data } = await octokit.repos.getContent({ owner, repo, path: filePath });
        if (!Array.isArray(data) && 'sha' in data) {
          fileSha = data.sha;
        }
      } catch (err: any) {
        if (err.status === 404) {
          console.log(`ℹ️ File already missing or deleted: ${filePath}`);
          return;
        }
        throw err;
      }

      if (fileSha) {
        await octokit.repos.deleteFile({
          owner,
          repo,
          path: filePath,
          message: commitMessage,
          sha: fileSha,
        });
        console.log(`✅ Successfully deleted: ${filePath}`);
      }
    }

    // Rollback JP Blog
    const jpPath = `src/content/blog/jp/${slug}.mdx`;
    await deleteFileFromGitHub(jpPath);

    // Rollback EN Blog
    const enPath = `src/content/blog/en/${slug}-en.mdx`;
    await deleteFileFromGitHub(enPath);

    // Update status to 'rolled_back' in Google Sheets
    await updateQueueItem((targetItem as any).rowNumber, {
       status: 'rolled_back'
    });

    console.log(`🎉 Successfully rolled back (deleted) both JP and EN blogs on GitHub: ${repo}`);
    
  } catch (error: any) {
    console.error(`❌ Failed to rollback via Octokit: ${error.message}`);
    process.exit(1);
  }
}

main();
