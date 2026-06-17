# Writings of Tinusha Savidya

Built with Node.js and vanilla HTML/CSS/JS.

## Setup

```bash
npm install
```

## Development

```bash
npm run dev
```

## Writing a Post

Create a new markdown file in `posts/`:

```bash
posts/your-post-slug.md
```

Add frontmatter at the top:

```yaml
---
title: "Your Post Title"
date: "2026-06-15"
excerpt: "A one-line summary of your post."
tags: ["tag1", "tag2"]
---
```

Write your content below the frontmatter. The post appears automatically on the next build or dev server reload.

The slug is derived from the filename: `your-post-slug.md` → `/articles/your-post-slug/`

## Draft Posts

Set `draft: true` in the frontmatter to exclude a post from production builds:

```yaml
---
title: "Work in Progress"
date: "2026-06-15"
draft: true
---
```

Drafts are included in the dev server by default. To include them in production builds:

```bash
INCLUDE_DRAFTS=true npm run build
```

## Production Build

```bash
npm run build
```

Outputs static files to `dist/`.

## Deploying to Cloudflare Pages

1. Push your repo to GitHub
2. Connect the repo in Cloudflare Pages
3. Set build command: `npm run build`
4. Set output directory: `dist`

The `_headers` and `_redirects` files in `public/` are automatically included for Cloudflare's configuration.


## Project Structure

```
blog/
├── package.json
├── build.js              ← Build pipeline
├── dev.js                ← Dev server + live reload
├── posts/                ← Markdown posts
├── pages/                ← Static pages (about)
├── public/               ← Copied to dist/ verbatim
└── src/
    ├── css/main.css      ← All styles
    ├── js/main.js        ← Client interactions
    └── templates/        ← JS template functions
```
