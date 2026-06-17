/**
 * RSS 2.0 feed template.
 *
 * @param {Array} posts — Array of published post objects
 * @param {Object} post
 * @param {string} post.title
 * @param {string} post.slug
 * @param {string} post.excerpt
 * @param {string} post.date — YYYY-MM-DD
 */
export default function rss(posts) {
  const baseUrl = process.env.CF_PAGES_URL || process.env.SITE_URL || '';
  const now = new Date().toUTCString();

  const items = posts
    .map((post) => {
      const postUrl = `${baseUrl}/articles/${post.slug}/`;
      const pubDate = new Date(post.date + 'T12:00:00Z').toUTCString();

      return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${postUrl}</link>
      <description>${escapeXml(post.excerpt || '')}</description>
      <pubDate>${pubDate}</pubDate>
      <guid isPermaLink="true">${postUrl}</guid>
    </item>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>The Journal</title>
    <link>${baseUrl}</link>
    <description>A record of thinking.</description>
    <language>en</language>
    <lastBuildDate>${now}</lastBuildDate>
    <atom:link href="${baseUrl}/feed.xml" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`;
}

function escapeXml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
