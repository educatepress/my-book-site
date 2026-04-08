import fs from 'fs';
import path from 'path';

const categoryMap: Record<string, string> = {
    'acog-2026-endometriosis-guidelines-no-wait-for-surgery': '不妊治療・生殖医療',
    'amh-egg-freezing-reality': '女性の健康',
    'coq10-egg-quality-fertilization-rate': 'プレコンセプションケア',
    'folic-acid-preconception-care': 'プレコンセプションケア',
    'folic-acid-the-critical-timing-for-pregnancy-preparation': 'プレコンセプションケア',
    'hello-world': 'ニュース・制度・助成金',
    'manage-chronic-conditions-preconception': 'プレコンセプションケア',
    'mental-health-maternity-journey': '女性の健康',
    'preconception-care-today': 'プレコンセプションケア',
    'preconception-checkup-guide': 'プレコンセプションケア',
    'safe-effective-exercise-pregnancy': '女性の健康',
    'tokyo-fertility-subsidy-2026-updates': 'ニュース・制度・助成金'
};

const baseDirJp = path.join(process.cwd(), 'src/content/blog/jp');
const baseDirEn = path.join(process.cwd(), 'src/content/blog/en');

function updateFile(filePath: string, category: string) {
    if (!fs.existsSync(filePath)) return;
    
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Skip if already has category
    if (content.match(/^category:/m)) {
        console.log(`Skipped (already has category): ${filePath}`);
        return;
    }

    // Insert category into frontmatter (e.g. after author)
    const newContent = content.replace(/^author:.*$/m, (match) => {
        return `${match}\ncategory: "${category}"`;
    });

    if (newContent !== content) {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`Updated: ${filePath} -> ${category}`);
    } else {
        // Fallback: try to insert after excerpt
        const newContent2 = content.replace(/^excerpt:.*$/m, (match) => {
            return `${match}\ncategory: "${category}"`;
        });
        if (newContent2 !== content) {
            fs.writeFileSync(filePath, newContent2, 'utf8');
            console.log(`Updated (fallback location): ${filePath} -> ${category}`);
        } else {
             console.log(`Failed to update frontmatter for: ${filePath}`);
        }
    }
}

for (const [slug, category] of Object.entries(categoryMap)) {
    const jpPath = path.join(baseDirJp, `${slug}.mdx`);
    const enPath = path.join(baseDirEn, `${slug}-en.mdx`);
    updateFile(jpPath, category);
    updateFile(enPath, category);
}

console.log("Done backfilling categories!");
