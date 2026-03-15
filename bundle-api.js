const http = require('http');
const { execFile } = require('child_process');

const PORT = 3002;

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Content-Type': 'application/json'
};

http.createServer((req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, CORS); res.end(); return;
  }

  const url = new URL(req.url, `http://localhost:${PORT}`);

  // GET /scan?mint=ADDRESS
  if (url.pathname === '/scan' && req.method === 'GET') {
    const mint = url.searchParams.get('mint');
    if (!mint || !/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(mint)) {
      res.writeHead(400, CORS);
      res.end(JSON.stringify({ error: 'Invalid mint address' }));
      return;
    }

    console.log(`[${new Date().toISOString()}] Scanning: ${mint}`);
    res.writeHead(200, CORS);

    const env = { ...process.env, JSON_OUTPUT: '1' };
    execFile('node', ['/root/bundle-scan.js', mint], { env, timeout: 180000 }, (err, stdout, stderr) => {
      if (err) {
        res.end(JSON.stringify({ error: 'Scan failed', detail: err.message }));
        return;
      }
      // Extract JSON from output
      const match = stdout.match(/JSON_RESULT:(.+)/);
      if (match) {
        res.end(match[1]);
      } else {
        // Return raw text as fallback
        res.end(JSON.stringify({ error: 'No JSON result', raw: stdout.slice(-500) }));
      }
    });
    return;
  }

  // GET /health
  if (url.pathname === '/health') {
    res.writeHead(200, CORS);
    res.end(JSON.stringify({ status: 'ok', service: 'iseclaw-bundle-api', port: PORT }));
    return;
  }

  res.writeHead(404, CORS);
  res.end(JSON.stringify({ error: 'Not found' }));

}).listen(PORT, () => console.log(`Iseclaw Bundle API running on port ${PORT}`));
