/**
 * About page template.
 *
 * @param {Object} options
 * @param {string} options.title       — From frontmatter
 * @param {string} options.contentHtml — Rendered markdown body
 */
export default function about({ title, contentHtml }) {
  return `
    <article>
      <h1 class="about-title">${title}</h1>
      <hr class="about-rule">
      <div class="about-body">
        ${contentHtml}
      </div>
    </article>`;
}
