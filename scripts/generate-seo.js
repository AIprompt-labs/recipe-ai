// scripts/generate-seo.js

const fs = require("fs");
const path = require("path");

// ===== 設定エリア =====

// レシピが入っているフォルダ
const RECIPES_DIR = path.join(__dirname, "..", "recipes");

// 公開URL（あなたのGitHub PagesのURL）
const BASE_URL = "https://aiprompt-labs.github.io/recipe-ai";

// 共通OGP画像（あとで差し替えOK）
const OGP_IMAGE_URL = `${BASE_URL}/assets/ogp-default.jpg`; // 画像を置いたらここを書き換え

// ===== ここから処理本体 =====

const recipeFiles = fs
  .readdirSync(RECIPES_DIR)
  .filter((file) => file.endsWith(".html"))
  .sort();

for (const file of recipeFiles) {
  const filePath = path.join(RECIPES_DIR, file);
  let html = fs.readFileSync(filePath, "utf8");

  const title = extractTitle(html);
  const description = extractDescription(html, title);
  const url = `${BASE_URL}/recipes/${file}`;

  const metaBlock = buildMetaBlock({ title, description, url });
  const jsonLdBlock = buildJsonLd({ title, description, url });

  // 既存のSEOブロックを一旦削除（マーカーで囲む前提）
  html = removeOldSeo(html);

  // <title> を差し替え
  html = replaceTitle(html, `${title} | AIプロンプトレシピ`);

  // <head> 内に SEO ブロックを追加
  html = injectSeoIntoHead(html, `${metaBlock}\n${jsonLdBlock}`);

  fs.writeFileSync(filePath, html, "utf8");
  console.log(`✅ SEO更新: ${file} (${title})`);
}

console.log("🎉 全レシピのSEOタグを更新しました！");

// ===== 関数群 =====

function extractTitle(html) {
  const m = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  if (!m) return "AIプロンプトレシピ";
  return stripTags(m[1]).trim();
}

function extractDescription(html, fallbackTitle) {
  // h1 のあとに出てくる最初の <p> を「目的」として使う
  const m = html.match(/<h1[^>]*>[\s\S]*?<\/h1>[\s\S]*?<p[^>]*>([\s\S]*?)<\/p>/i);
  if (m) {
    return stripTags(m[1]).replace(/\s+/g, " ").trim().slice(0, 120);
  }
  // 取れなかったらテンプレ文
  return `${fallbackTitle} の使い方をまとめたAIプロンプトレシピです。目的・前提条件・手順・よくある質問まで解説します。`;
}

function stripTags(s) {
  return s.replace(/<[^>]+>/g, "");
}

function buildMetaBlock({ title, description, url }) {
  return [
    "<!-- SEO_AUTO_START -->",
    `<title>${escapeHtml(title)} | AIプロンプトレシピ</title>`,
    `<meta name="description" content="${escapeHtml(description)}">`,
    "",
    `<!-- OGP -->`,
    `<meta property="og:title" content="${escapeHtml(title)} | AIプロンプトレシピ">`,
    `<meta property="og:description" content="${escapeHtml(description)}">`,
    `<meta property="og:type" content="article">`,
    `<meta property="og:url" content="${url}">`,
    `<meta property="og:image" content="${OGP_IMAGE_URL}">`,
    "",
    `<!-- Twitter Card -->`,
    `<meta name="twitter:card" content="summary_large_image">`,
    `<meta name="twitter:title" content="${escapeHtml(title)} | AIプロンプトレシピ">`,
    `<meta name="twitter:description" content="${escapeHtml(description)}">`,
    `<meta name="twitter:image" content="${OGP_IMAGE_URL}">`,
    "<!-- SEO_AUTO_END -->",
  ].join("\n");
}

function buildJsonLd({ title, description, url }) {
  const json = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": title,
    "description": description,
    "image": OGP_IMAGE_URL,
    "url": url,
    "publisher": {
      "@type": "Organization",
      "name": "AIプロンプトレシピ",
      "url": BASE_URL
    }
  };
  const jsonStr = JSON.stringify(json, null, 2);
  return `<script type="application/ld+json">\n${jsonStr}\n</script>`;
}

function removeOldSeo(html) {
  return html.replace(
    /<!-- SEO_AUTO_START -->[\s\S]*?<!-- SEO_AUTO_END -->/i,
    ""
  );
}

function replaceTitle(html, newTitle) {
  if (html.match(/<title>[\s\S]*?<\/title>/i)) {
    return html.replace(
      /<title>[\s\S]*?<\/title>/i,
      `<title>${escapeHtml(newTitle)}</title>`
    );
  }
  // <head> 内の先頭に追加
  return html.replace(
    /<head([^>]*)>/i,
    `<head$1>\n<title>${escapeHtml(newTitle)}</title>`
  );
}

function injectSeoIntoHead(html, seoBlock) {
  return html.replace(/<head([^>]*)>/i, `<head$1>\n${seoBlock}\n`);
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
