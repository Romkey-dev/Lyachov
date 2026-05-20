const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const crypto = require('crypto');
const axios = require('axios');

const app = express();
const port = 3001;
const db = new sqlite3.Database('./comments.db');
const ALLOWED_SORT = ['created_at DESC', 'created_at ASC'];
const ALLOWED_EXTERNAL = ['https://api.example.com/data'];

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use((req, res, next) => {
  const nonce = crypto.randomBytes(16).toString('base64');
  res.locals.cspNonce = nonce;
  res.setHeader('Content-Security-Policy', `default-src 'self'; script-src 'self' 'nonce-${nonce}'; object-src 'none'; base-uri 'self';`);
  res.setHeader('X-Content-Type-Options', 'nosniff');
  next();
});

function sanitizeHtml(input) {
  if (!input) return '';
  return String(input)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function initDb() {
  db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL,
      comment TEXT NOT NULL,
      created_at TEXT NOT NULL
    )`);
    db.run(`INSERT OR IGNORE INTO comments (id, username, comment, created_at) VALUES (1, 'admin', 'Welcome to the secure board', '2026-05-01T12:00:00Z')`);
  });
}

app.get('/', (req, res) => {
  db.all('SELECT id, username, comment, created_at FROM comments ORDER BY created_at DESC', (err, rows) => {
    if (err) {
      return res.status(500).send('Database error');
    }
    res.render('index_secure', { comments: rows });
  });
});

app.post('/comment', (req, res) => {
  const username = sanitizeHtml(req.body.username || 'Anonymous').substring(0, 50);
  const comment = sanitizeHtml(req.body.comment || '').substring(0, 500);

  db.run(
    'INSERT INTO comments (username, comment, created_at) VALUES (?, ?, datetime("now"))',
    [username, comment],
    function (err) {
      if (err) {
        return res.status(500).send('Cannot save comment');
      }
      res.redirect('/');
    }
  );
});

app.get('/api/comments', (req, res) => {
  const sort = req.query.sort || 'created_at DESC';
  if (!ALLOWED_SORT.includes(sort)) {
    return res.status(400).json({ error: 'Invalid sort parameter' });
  }
  db.all('SELECT id, username, comment, created_at FROM comments ORDER BY ' + sort, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rows);
  });
});

app.get('/api/search', (req, res) => {
  const search = req.query.q || '';
  db.all('SELECT id, username, comment, created_at FROM comments WHERE comment LIKE ?', [`%${search}%`], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rows);
  });
});

app.get('/api/config', (req, res) => {
  res.json({ message: 'API key is stored securely in environment variables.' });
});

app.get('/api/external', async (req, res) => {
  const url = req.query.url || 'https://api.example.com/data';
  if (!ALLOWED_EXTERNAL.includes(url)) {
    return res.status(400).json({ error: 'External URL is not allowed' });
  }
  try {
    const response = await axios.get(url);
    res.json({ url, status: response.status, data: response.data });
  } catch (err) {
    res.status(500).json({ error: 'External request failed', details: err.message });
  }
});

initDb();
app.listen(port, () => {
  console.log(`Secure app listening at http://localhost:${port}`);
});
