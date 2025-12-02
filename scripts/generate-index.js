// scripts/generate-index.js

const fs = require("fs");
const path = require("path");

// レシピフォルダ
const RECIPES_DIR = path.join(__dirname, "..", "recipes");

// 出力先 index.html テンプレート
const TEMPLATE_PATH = path.join(__dirname, "template_index.html");

// 実際の index.html 出力先
const OUTPUT_PATH = path.join(__dirname, "..", "index.html");

// レシピを取得
const recipeFiles = fs
  .readdirSync(RECIPES_DIR)
  .filter((file) => file.endsWith(".html"))
  .sort();

// テンプレート読み込み
let template = fs.readFileSync(TEMPLATE_PATH, "utf8");

// ▼ レシピ一覧HTMLを生成
let recipeListHTML = "";

for (const file of recipeFiles) {
  const number = file.replace(".html", "");
  const title = getTitle(path.join(RECIPES_DIR, file));

  recipeListHTML += `
<a href="recipes/${file}" class="recipe-card">
  <p class="text-blue-600 text-sm">レシピ</p>
  <h3 class="text-lg font-bold">${number}：${title}</h3>
</a>
  `;
}

// ▼ テンプレートの {{RECIPES}} に置換
template = template.replace("{{RECIPES}}", recipeListHTML);

// ▼ index.html を書き換え
fs.writeFileSync(OUTPUT_PATH, template, "utf8");

// ▼ レ
