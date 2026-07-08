import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import matter from 'gray-matter';
import { marked } from 'marked';

import layout from './src/templates/layout.js';
import articleTemplate from './src/templates/article.js';
import indexTemplate from './src/templates/index.js';
import aboutTemplate from './src/templates/about.js';
import tagTemplate from './src/templates/tag.js';
import rssTemplate from './src/templates/rss.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DIST = path.join(__dirname, 'dist');
const POSTS_DIR = path.join(__dirname, 'posts');
const PAGES_DIR = path.join(__dirname, 'pages');
const PUBLIC_DIR = path.join(__dirname, 'public');
const CSS_SRC = path.join(__dirname, 'src', 'css', 'main.css');
const JS_SRC = path.join(__dirname, 'src', 'js', 'main.js');

// --- Utilities ---

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

function formatDate(dateStr) {
  const date = new Date(dateStr + 'T12:00:00Z');
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

function calculateReadingTime(text) {
  const words = text.trim().split(/\s+/).length;
  return Math.ceil(words / 200);
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function copyDirSync(src, dest) {
  if (!fs.existsSync(src)) return;
  ensureDir(dest);
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

const parseWikilinks = (content) => content.replace(/!\[\[([^\]|]+)(?:\|([^\]]*))?\]\]/g, (_, f, a) => `![${a ? a.trim() : f}](${encodeURIComponent(f)})`);

const copyAssets = (src, dest) => {
  if (!fs.existsSync(src)) return;
  fs.readdirSync(src, { withFileTypes: true }).forEach((entry) => {
    if (entry.isFile() && !entry.name.endsWith('.md')) {
      fs.copyFileSync(path.join(src, entry.name), path.join(dest, entry.name));
    }
  });
};

/**
 * Process rendered HTML: assign IDs to h2/h3 headings, extract TOC.
 */
function processHeadings(html) {
  const toc = [];
  const processed = html.replace(
    /<(h[23])>(.*?)<\/h[23]>/gi,
    (match, tag, text) => {
      // Strip any inline HTML from heading text for the ID and TOC
      const plainText = text.replace(/<[^>]+>/g, '');
      const id = slugify(plainText);
      const level = parseInt(tag.charAt(1), 10);
      toc.push({ text: plainText, id, level });
      return `<${tag} id="${id}">${text}</${tag}>`;
    }
  );
  return { html: processed, toc };
}

// --- Build ---

export async function build() {
  const startTime = Date.now();
  const includeDrafts = process.env.INCLUDE_DRAFTS === 'true';

  // 1. Clean dist/
  fs.rmSync(DIST, { recursive: true, force: true });
  ensureDir(DIST);

  // 2. Copy public/ into dist/
  copyDirSync(PUBLIC_DIR, DIST);

  // 3. Copy CSS and JS
  ensureDir(path.join(DIST, 'css'));
  fs.copyFileSync(CSS_SRC, path.join(DIST, 'css', 'main.css'));

  ensureDir(path.join(DIST, 'js'));
  fs.copyFileSync(JS_SRC, path.join(DIST, 'js', 'main.js'));

  // 4. Read and parse all posts
  copyAssets(POSTS_DIR, DIST);
  const postFiles = fs.existsSync(POSTS_DIR)
    ? fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith('.md'))
    : [];

  const posts = [];

  for (const file of postFiles) {
    const raw = fs.readFileSync(path.join(POSTS_DIR, file), 'utf-8');
    const { data, content } = matter(raw);

    // Skip drafts in production
    if (data.draft && !includeDrafts) continue;

    const slug = path.basename(file, '.md');
    const rawHtml = marked(parseWikilinks(content));
    const { html: contentHtml, toc } = processHeadings(rawHtml);
    const readingTime = calculateReadingTime(content);

    let dateStr = '1970-01-01';
    if (data.date) {
      if (data.date instanceof Date) {
        dateStr = data.date.toISOString().split('T')[0];
      } else {
        dateStr = String(data.date).trim();
      }
    }

    const dateFormatted = formatDate(dateStr);

    posts.push({
      title: data.title || slug,
      date: dateStr,
      excerpt: data.excerpt || '',
      tags: data.tags || [],
      draft: data.draft || false,
      slug,
      contentHtml,
      toc,
      readingTime,
      dateFormatted,
    });
  }

  // 5. Sort posts by date descending
  posts.sort((a, b) => (a.date > b.date ? -1 : a.date < b.date ? 1 : 0));

  // 6. Generate each article page
  for (const post of posts) {
    const articleBody = articleTemplate({
      title: post.title,
      dateFormatted: post.dateFormatted,
      readingTime: post.readingTime,
      contentHtml: post.contentHtml,
      tags: post.tags,
    });

    const html = layout({
      title: `${post.title} — The Journal`,
      description: post.excerpt,
      url: `/articles/${post.slug}/`,
      body: articleBody,
      toc: post.toc,
      activePage: 'articles',
      isArticle: true,
      og: {
        type: 'article',
        title: post.title,
        description: post.excerpt,
        url: `${process.env.CF_PAGES_URL || process.env.SITE_URL || ''}/articles/${post.slug}/`,
      },
    });

    const dir = path.join(DIST, 'articles', post.slug);
    ensureDir(dir);
    fs.writeFileSync(path.join(dir, 'index.html'), html);
    copyAssets(POSTS_DIR, dir);
  }

  // 7. Generate tag pages
  const tagMap = {};
  for (const post of posts) {
    for (const t of post.tags) {
      const ts = slugify(t);
      if (!tagMap[ts]) tagMap[ts] = { name: t, posts: [] };
      tagMap[ts].posts.push(post);
    }
  }

  for (const [tagSlug, { name, posts: tagPosts }] of Object.entries(tagMap)) {
    const tagBody = tagTemplate({ tag: name, tagSlug, posts: tagPosts });
    const tagHtml = layout({
      title: `${name} — The Journal`,
      description: `Articles tagged "${name}".`,
      url: `/tags/${tagSlug}/`,
      body: tagBody,
      activePage: 'articles',
      isArticle: false,
    });

    const dir = path.join(DIST, 'tags', tagSlug);
    ensureDir(dir);
    fs.writeFileSync(path.join(dir, 'index.html'), tagHtml);
  }

  // 8. Generate index page
  const indexBody = indexTemplate(posts);
  const indexHtml = layout({
    title: 'The Journal',
    description: 'A record of thinking.',
    url: '/',
    body: indexBody,
    activePage: 'articles',
    isArticle: false,
  });
  fs.writeFileSync(path.join(DIST, 'index.html'), indexHtml);

  // 9. Generate RSS feed
  const publishedPosts = posts.filter((p) => !p.draft);
  const rssFeed = rssTemplate(publishedPosts);
  fs.writeFileSync(path.join(DIST, 'feed.xml'), rssFeed);

  // 10. Log build stats
  const duration = Date.now() - startTime;
  console.log(`✓ Built ${posts.length} posts in ${duration}ms`);
}

// Run directly if called as main script
const isMain = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(__filename);
if (isMain) {
  build().catch((err) => {
    console.error('Build failed:', err);
    process.exit(1);
  });
}
