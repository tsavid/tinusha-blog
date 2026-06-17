/**
 * Index (article listing) page template.
 *
 * @param {Array} posts — Array of post objects, sorted newest first
 * @param {Object} post
 * @param {string} post.title
 * @param {string} post.slug
 * @param {string} post.excerpt
 * @param {string} post.date          — YYYY-MM-DD
 * @param {string} post.dateFormatted — e.g. "May 31, 2026"
 * @param {number} post.readingTime
 * @param {Array}  post.tags
 */
export default function index(posts) {
  // Group posts by year
  const grouped = {};
  for (const post of posts) {
    const year = post.date.slice(0, 4);
    if (!grouped[year]) grouped[year] = [];
    grouped[year].push(post);
  }

  // Sort years descending
  const years = Object.keys(grouped).sort((a, b) => b - a);

  const listHTML = years
    .map(
      (year) => `
      <section class="year-group">
        <h2 class="year-heading">${year}</h2>
        ${grouped[year]
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
          .join('\n')}
      </section>`
    )
    .join('\n');

  return `
    <header class="index-header">
      <h1 class="index-title">The Journal</h1>
      <p class="index-subtitle">A record of thinking.</p>
      <hr class="index-rule">
    </header>

    ${listHTML}`;
}
