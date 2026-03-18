const matter = require('gray-matter');
const fs = require('fs');
const content = fs.readFileSync('./src/content/blog/jp/preconception-care-today.mdx', 'utf8');
const result = matter(content);
console.log("Data keys:", Object.keys(result.data));
if (Object.keys(result.data).length === 0) {
    console.log("Empty data!");
} else {
    console.log("Parsed title:", result.data.title);
    console.log("Parsed date:", result.data.date);
}
console.log("\nContent start:", result.content.substring(0, 50));
