import { Octokit } from '@octokit/rest';
import 'dotenv/config';
import { getQueueItems, updateQueueItem, QueueItem } from '../src/lib/sheets';

async function main() {
  const contentId = process.argv[2];
  if (!contentId) {
    console.error('❌ Please provide a contentId as an argument.');
    process.exit(1);
  }

  console.log(`🚀 Starting GitHub Publish for content form queue: ${contentId}`);

  // Fetch from Google Sheets queue
  const items = await getQueueItems();
  const targetItem = items.find((item: any) => item.content_id === contentId);

  if (!targetItem) {
    console.error(`❌ Queue item not found: ${contentId}`);
    process.exit(1);
  }

  if (targetItem.status === 'posted') {
    console.log(`ℹ️ Item is already posted. Aborting.`);
    process.exit(0);
  }

  if (!targetItem.generation_recipe) {
    console.error(`❌ Generation recipe is missing from row. Cannot publish.`);
    process.exit(1);
  }

  let recipe = JSON.parse(targetItem.generation_recipe);

  // If the recipe is just a lightweight reference to a Drive file, fetch the full JSON from Drive.
  if (recipe.driveFileId) {
    console.log(`☁️ Fetching full recipe JSON from Google Drive (ID: ${recipe.driveFileId})...`);
    const { getDriveClient, downloadFileJSON } = await import('../src/lib/google-client');
    const drive = await getDriveClient();
    try {
      recipe = await downloadFileJSON(drive, recipe.driveFileId);
    } catch (e: any) {
      console.error(`❌ Failed to fetch recipe JSON from Google Drive: ${e.message}`);
      process.exit(1);
    }
  }

  const jpBlogContent = recipe.jpBlog;
  const enBlogContent = recipe.enBlog;

  if (!jpBlogContent || !enBlogContent) {
    console.error(`❌ JP or EN blog content is missing from generation recipe!`);
    process.exit(1);
  }

  // Determine slug from content_id: blog-some-slug
  const slug = contentId.replace('blog-', '');

  const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
  const owner = process.env.GITHUB_OWNER || 'educatepress';
  const repo = 'my-book-site'; // hardcoded for webpage.new

  const commitMessage = `Auto-publish blog: ${slug} via AG Agent Dispatcher`;

  try {
    // Helper to upload a single file via Octokit
    async function uploadFileToGitHub(filePath: string, content: string) {
      const contentEncoded = Buffer.from(content).toString('base64');
      let fileSha = undefined;
      
      try {
        const { data } = await octokit.repos.getContent({ owner, repo, path: filePath });
        if (!Array.isArray(data) && 'sha' in data) {
          fileSha = data.sha;
        }
      } catch (err: any) {
        if (err.status !== 404) throw err;
        // 404 means file doesn't exist, which is fine
      }

      await octokit.repos.createOrUpdateFileContents({
        owner,
        repo,
        path: filePath,
        message: commitMessage,
        content: contentEncoded,
        sha: fileSha,
      });
      console.log(`✅ Successfully pushed: ${filePath}`);
    }

    // Push JP Blog
    const jpPath = `src/content/blog/jp/${slug}.mdx`;
    await uploadFileToGitHub(jpPath, jpBlogContent);

    // Push EN Blog
    const enPath = `src/content/blog/en/${slug}-en.mdx`;
    await uploadFileToGitHub(enPath, enBlogContent);

    // Update status to 'posted' in Google Sheets
    await updateQueueItem((targetItem as any).rowNumber, {
       status: 'posted',
       posted_at: new Date().toISOString()
    });

    console.log(`🎉 Successfully published both JP and EN blogs to GitHub: ${repo}`);
    
  } catch (error: any) {
    console.error(`❌ Failed to publish via Octokit: ${error.message}`);
    process.exit(1);
  }
}

main();
