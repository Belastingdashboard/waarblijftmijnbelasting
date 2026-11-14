// Kleine lokale server voor de voorvertoning van het dashboard
const http = require('http'), fs = require('fs'), path = require('path');
const root = path.resolve(__dirname, '..', 'site');
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.txt': 'text/plain; charset=utf-8' };
http.createServer((req, res) => {
  const p = path.join(root, path.normalize(decodeURIComponent(req.url.split('?')[0])).replace(/^(\.\.[\/\\])+/, ''));
  const file = p === root || p === root + path.sep ? path.join(root, 'index.html') : p;
  if (!file.startsWith(root)) { res.writeHead(403); return res.end(); }
  fs.readFile(file, (e, d) => {
    if (e) { res.writeHead(404); return res.end('Niet gevonden'); }
    res.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream' });
    res.end(d);
  });
}).listen(process.env.PORT || 8765, '127.0.0.1');
