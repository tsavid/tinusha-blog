/**
 * Single article page template.
 *
 * @param {Object} post
 * @param {string} post.title
 * @param {string} post.dateFormatted  — e.g. "May 31, 2026"
 * @param {number} post.readingTime    — minutes
 * @param {string} post.contentHtml    — rendered markdown body
 * @param {Array}  post.tags           — string array
 */
export default function article({ title, dateFormatted, readingTime, contentHtml, tags = [] }) {
  function slugify(text) {
    return text.toString().toLowerCase().trim()
      .replace(/\s+/g, '-').replace(/[^\w-]+/g, '')
      .replace(/--+/g, '-').replace(/^-+/, '').replace(/-+$/, '');
  }

  const tagsHTML =
    tags.length > 0
      ? `
      <div class="article-footer">
        <hr class="article-footer-rule">
        <div class="article-tags">
          <span class="article-tags-label">Tags</span>
          ${tags.map((tag) => `<a href="/tags/${slugify(tag)}/" class="tag">${tag}</a>`).join('\n          ')}
        </div>
      </div>`
      : '';

  return `
    <article data-reading-time="${readingTime}">
      <header class="article-header">
        <p class="article-meta">Published ${dateFormatted}  |  ${readingTime} min read</p>
        <h1 class="article-title">${title}</h1>
      </header>

      <div class="article-body">
        ${contentHtml}
        <div class="article-end-ornament" style="text-align: center; margin: 4rem 0; font-size: 1.5rem; color: var(--color-ink-3); opacity: 0.5;">❦</div>
      </div>

      ${tagsHTML}
    </article>`;
}
