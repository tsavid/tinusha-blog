import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import chokidar from 'chokidar';
import { build } from './build.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DIST = path.join(__dirname, 'dist');
const PORT = 3000;

// --- MIME types ---
const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.xml': 'application/rss+xml',
  '.ico': 'image/x-icon',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.json': 'application/json',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

// --- SSE live-reload snippet ---
const SSE_SNIPPET = `
<script>
(function() {
  var source = new EventSource('/__reload');
  source.addEventListener('reload', function() {
    window.location.reload();
  });
  source.onerror = function() {
    source.close();
    setTimeout(function() {
      var retry = new EventSource('/__reload');
      retry.addEventListener('reload', function() {
        window.location.reload();
      });
    }, 1000);
  };
})();
<\/script>
`;

// --- SSE clients ---
let sseClients = [];

// --- Initial build ---
console.log('Building...');
await build();

// --- HTTP Server ---
const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  let pathname = url.pathname;

  // SSE endpoint for live reload
  if (pathname === '/__reload') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
    });
    res.write(':ok\n\n');

    sseClients.push(res);

    req.on('close', () => {
      sseClients = sseClients.filter((client) => client !== res);
    });
    return;
  }

  // Resolve file path
  let filePath = path.join(DIST, pathname);

  // Directory request: look for index.html
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html');
  }

  // If no extension and file doesn't exist, try adding .html
  if (!path.extname(filePath) && !fs.existsSync(filePath)) {
    filePath += '.html';
  }

  // Serve file
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath);
    const mimeType = MIME_TYPES[ext] || 'application/octet-stream';

    let content = fs.readFileSync(filePath);

    // Inject SSE snippet into HTML responses
    if (ext === '.html') {
      let html = content.toString('utf-8');
      html = html.replace('</body>', SSE_SNIPPET + '</body>');
      content = html;
    }

    res.writeHead(200, { 'Content-Type': mimeType });
    res.end(content);
  } else {
    // 404
    const notFoundPath = path.join(DIST, '404.html');
    if (fs.existsSync(notFoundPath)) {
      let html = fs.readFileSync(notFoundPath, 'utf-8');
      html = html.replace('</body>', SSE_SNIPPET + '</body>');
      res.writeHead(404, { 'Content-Type': 'text/html' });
      res.end(html);
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 — Not Found');
    }
  }
});

server.listen(PORT, () => {
  console.log(`\nDev server: http://localhost:${PORT}\n`);
});

// --- File Watching ---
let building = false;
let pendingBuild = false;

async function rebuild() {
  if (building) {
    pendingBuild = true;
    return;
  }
  building = true;

  try {
    await build();
    // Notify all SSE clients
    for (const client of sseClients) {
      client.write('event: reload\ndata: reload\n\n');
    }
  } catch (err) {
    console.error('Build error:', err);
  }

  building = false;

  if (pendingBuild) {
    pendingBuild = false;
    rebuild();
  }
}

const watcher = chokidar.watch(
  [
    path.join(__dirname, 'posts', '**', '*.md'),
    path.join(__dirname, 'pages', '**', '*.md'),
    path.join(__dirname, 'src', '**', '*'),
  ],
  {
    ignoreInitial: true,
    awaitWriteFinish: { stabilityThreshold: 100 },
  }
);

watcher.on('all', (event, filePath) => {
  const rel = path.relative(__dirname, filePath);
  console.log(`[${event}] ${rel}`);
  rebuild();
});
