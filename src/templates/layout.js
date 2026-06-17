/**
 * Base HTML shell — wraps every page.
 *
 * @param {Object} options
 * @param {string} options.title       — Page <title>
 * @param {string} options.description — Meta description
 * @param {string} options.url         — Canonical URL path (e.g. /articles/my-post/)
 * @param {string} options.body        — Inner HTML for .main
 * @param {Array}  options.toc         — TOC entries [{text, id, level}] (article pages only)
 * @param {string} options.activePage  — 'articles' | 'about' for nav highlighting
 * @param {boolean} options.isArticle  — Whether to show reading progress bar
 * @param {Object} options.og          — OpenGraph overrides {type, title, description, url}
 */
export default function layout({
  title = 'The Journal',
  description = 'A record of thinking.',
  url = '/',
  body = '',
  toc = [],
  activePage = '',
  isArticle = false,
  og = {},
}) {
  const siteTitle = 'Tinusha Savidya';
  const baseUrl = process.env.CF_PAGES_URL || process.env.SITE_URL || '';
  const canonicalUrl = baseUrl + url;

  const ogType = og.type || 'website';
  const ogTitle = og.title || title;
  const ogDescription = og.description || description;
  const ogUrl = og.url || canonicalUrl;

  const tocHTML =
    toc.length > 0
      ? `
    <nav class="sidebar-toc" aria-label="Table of contents">
      <p class="sidebar-toc-label">On this page</p>
      <ul class="sidebar-toc-list">
        ${toc
          .map(
            (item) =>
              `<li><a href="#${item.id}" class="${item.level === 3 ? 'toc-h3' : ''}">${item.text}</a></li>`
          )
          .join('\n        ')}
      </ul>
    </nav>`
      : '<div class="sidebar-toc"></div>';

  const highlightCSS = isArticle
    ? `<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github.min.css" id="hljs-light">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark-dimmed.min.css" id="hljs-dark" disabled>`
    : '';

  const highlightJS = isArticle
    ? `<script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js"><\/script>`
    : '';

  const progressBar = isArticle
    ? `<div class="progress-vertical"><div class="progress-vertical-fill"></div></div>`
    : '';

  const floatingReadTime = isArticle
    ? `<div class="floating-read-time" id="floating-read-time" aria-hidden="true"></div>`
    : '';

  const currentYear = new Date().getFullYear();

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title}</title>
  <meta name="description" content="${escapeAttr(description)}">
  <link rel="canonical" href="${canonicalUrl}">

  <!-- Real-time SVG Favicon with dynamic color scheme support -->
  <link rel="icon" type="image/svg+xml"
      href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cstyle%3Epath%7Bfill:%230b0b0b;%7D@media(prefers-color-scheme:dark)%7Bpath%7Bfill:%23f3f4f6;%7D%7D%3C/style%3E%3Cpath d='M10.5 4v6.5H4v3h6.5V20h3v-6.5H20v-3h-6.5V4h-3z'/%3E%3C/svg%3E">

  <!-- OpenGraph -->
  <meta property="og:type" content="${ogType}">
  <meta property="og:title" content="${escapeAttr(ogTitle)}">
  <meta property="og:description" content="${escapeAttr(ogDescription)}">
  <meta property="og:url" content="${ogUrl}">

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary">
  <meta name="twitter:title" content="${escapeAttr(ogTitle)}">
  <meta name="twitter:description" content="${escapeAttr(ogDescription)}">

  <!-- RSS Autodiscovery -->
  <link rel="alternate" type="application/rss+xml" title="Tinusha Savidya RSS Feed" href="/feed.xml">

  <!-- Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500&family=EB+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Inter:wght@300;400;500&display=swap" rel="stylesheet">

  <!-- Highlight.js (article pages only) -->
  ${highlightCSS}

  <!-- Styles -->
  <link rel="stylesheet" href="/css/main.css">

  <!-- Theme: prevent flash of wrong theme -->
  <script>
    (function() {
      var saved = localStorage.getItem('journal-theme');
      var theme = saved || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
      document.documentElement.setAttribute('data-theme', theme);
      // Sidebar state
      var sb = localStorage.getItem('journal-sidebar');
      if (sb === 'collapsed') document.documentElement.setAttribute('data-sidebar', 'collapsed');
    })();
  </script>
</head>
<body>
  ${floatingReadTime}

  <button class="sidebar-toggle" id="sidebar-toggle" aria-label="Toggle sidebar">
    <svg class="sidebar-toggle-icon sidebar-toggle-open" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
      <line x1="3" y1="6" x2="21" y2="6"/>
      <line x1="3" y1="6" x2="21" y2="6"/>
      <line x1="3" y1="12" x2="21" y2="12"/>
      <line x1="3" y1="18" x2="21" y2="18"/>
    </svg>
    <svg class="sidebar-toggle-icon sidebar-toggle-close" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
      <line x1="18" y1="6" x2="6" y2="18"/>
      <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  </button>

  <div class="site">
    <aside class="sidebar" id="sidebar">
      <div>
        <div class="sidebar-identity">
          <a href="/" class="sidebar-title">
            <svg class="logo-node-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style="width: 14px; height: 14px; fill: currentColor; display: inline-block; vertical-align: middle; margin-right: 6px; margin-top: -2px;">
              <path d="M10.5 4v6.5H4v3h6.5V20h3v-6.5H20v-3h-6.5V4h-3z" />
            </svg>Tinusha Savidya</a>
        </div>
        <hr class="sidebar-rule">
        <ul class="sidebar-nav">
          <li><a href="/"${activePage === 'articles' ? ' data-active="true"' : ''}>Writings</a></li>
          <li><a href="/about/"${activePage === 'about' ? ' data-active="true"' : ''}>About</a></li>
        </ul>
      </div>

      ${tocHTML}

      <ul class="sidebar-social">
        <li><button class="theme-toggle-text" id="theme-toggle" aria-label="Toggle dark mode">Dark Mode</button></li>
        <li><a href="mailto:hello@tinusha.com">Contact</a></li>
        <li><a href="https://github.com/tsavid" target="_blank" rel="noopener noreferrer">Github</a></li>
        <li><a href="https://www.linkedin.com/in/tinusha/" target="_blank" rel="noopener noreferrer">LinkedIn</a></li>
      </ul>
    </aside>

    <main class="main">
      ${progressBar}
      ${body}

      <footer class="site-footer">
        <hr class="footer-rule">
        <p class="footer-text">&copy; 2026 Tinusha Savidya. All rights reserved.</p>
      </footer>
    </main>
  </div>

  ${highlightJS}
  <script src="/js/main.js"><\/script>
</body>
</html>`;
}

function escapeAttr(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
