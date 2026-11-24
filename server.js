const http = require('node:http');
const { readFile } = require('node:fs/promises');
const { join } = require('node:path');

const assets = new Map([
  ['/', 'index.html'], ['/index.html', 'index.html'],
  ['/vendor/megajs.js', 'vendor/megajs.js'],
  ['/vendor/videostream.js', 'vendor/videostream.js']
]);
const server = http.createServer(async (req, res) => {
  const asset = assets.get(req.url.split('?')[0]);
  if (!asset) return res.writeHead(404).end();
  try {
    const body = await readFile(join(__dirname, asset));
    const type = asset.endsWith('.js') ? 'text/javascript' : 'text/html';
    res.writeHead(200, { 'Content-Type': type + '; charset=utf-8' }).end(body);
  } catch {
    res.writeHead(500).end();
  }
});
server.listen(Number(process.env.PORT || 3000), '127.0.0.1', () => {
  console.log('Reprodutor em http://127.0.0.1:' + server.address().port);
});
