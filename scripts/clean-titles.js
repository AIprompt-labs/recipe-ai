// scripts/clean-titles.js

const fs = require("fs");
const path = require("path");

const RECIPES_DIR = path.join(__dirname, "..", "recipes");

const recipeFiles = fs
  .readdirSync(RECIPES_DIR)
  .filter((file) => file.endsWith(".html"));

for (const file of recipeFiles) {
  const filePath = path.join(RECIPES_DIR, file);
  let html = fs.readFileSync(filePath, "utf8");

  // SEO_AUTO_START で入れた title を守るため、まずその場所を抜き出す
  const seoTitleMatch = html.match(/<!-- SEO_AUTO_START -->([\s\S]*?)<!-- SEO_AUTO_END -->/);

  // 古い<title> を削除（SEOブロック外のみ）
  html = html.replace(
    /<title>[\s\S]*?<\/title>/gi,
    ""
  );

  // headタグの中をキレイに整形（空行があれば詰める）
  html = html.replace(/<head([^>]*)>\s+/i, "<head$1>\n");

  // 同じSEOブロックを再挿入（念のため）
  if (seoTitleMatch) {
    const seoBlock = seoTitleMatch[0];
    html = html.replace(/<!-- SEO_AUTO_START -->([\s\S]*?)<!-- SEO_AUTO_END -->/, seoBlock);
  }

  fs.writeFileSync(filePath, html, "utf8");
  console.log(`✨ Cleaned old title in: ${file}`);
}

console.log("🎉 全レシピの古い<title>を削除しました！");
