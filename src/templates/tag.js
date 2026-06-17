/**
 * Tag listing page template.
 *
 * @param {Object} options
 * @param {string} options.tag        — Tag name (display form)
 * @param {string} options.tagSlug    — URL-safe slug
 * @param {Array}  options.posts      — Posts with this tag, sorted newest first
 */
export default function tag({ tag: tagName, tagSlug, posts }) {
  const listHTML = posts
    .map(
      (post) => `
        <a href="/articles/${post.slug}/" class="article-item">
          <span class="article-item-year">${post.dateFormatted.split(' ').slice(0, 2).join(' ')}</span>
          <span class="article-item-content">
            <span class="article-item-title">${post.title}</span>
            ${post.excerpt ? `<span class="article-item-excerpt">${post.excerpt}</span>` : ''}
          </span>
          <span class="article-item-meta">${post.readingTime} min</span>
        </a>`
    )
    .join('\n');

  return `
    <header class="tag-header">
      <p class="tag-header-label">Tag</p>
      <h1 class="tag-title">${tagName}</h1>
      <p class="tag-count">${posts.length} article${posts.length !== 1 ? 's' : ''}</p>
      <hr class="tag-rule">
    </header>

    <section class="year-group">
      ${listHTML}
    </section>`;
}
