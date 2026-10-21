#!/usr/bin/env node
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../dist');
const port = Number(process.env.PORT ?? 4173);

const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.woff2': 'font/woff2',
};

const server = http.createServer((req, res) => {
  const url = new URL(req.url ?? '/', 'http://localhost');
  let pathname = decodeURIComponent(url.pathname);

  const send = (file, status = 200) => {
    const ext = path.extname(file);
    res.writeHead(status, {
      'Content-Type': types[ext] ?? 'application/octet-stream',
      'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=31536000, immutable',
    });
    fs.createReadStream(file).pipe(res);
  };

  // trailing slash cleanup, matching trailingSlash: false
  if (pathname.length > 1 && pathname.endsWith('/')) {
    res.writeHead(308, { Location: pathname.replace(/\/+$/, '') + url.search });
    res.end();
    return;
  }

  const candidates = [
    path.join(root, pathname),
    path.join(root, pathname, 'index.html'),
    path.join(root, `${pathname}.html`),
  ];

  for (const candidate of candidates) {
    if (candidate.startsWith(root) && fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
      send(candidate);
      return;
    }
  }

  if (pathname.startsWith('/assets/')) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not found');
    return;
  }

  // SPA fallback for client-only routes such as /admin and /dashboard.
  send(path.join(root, 'index.html'), 200);
});

server.listen(port, '0.0.0.0', () => {
  console.log(`dist server listening on http://0.0.0.0:${port}`);
});
