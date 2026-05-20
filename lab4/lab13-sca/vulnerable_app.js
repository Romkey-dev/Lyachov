const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const axios = require('axios');

const app = express();
const port = 3000;
const db = new sqlite3.Database('./comments.db');
const API_KEY = 'demo-hardcoded-api-key-12345';

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

function initDb() {
  db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL,
      comment TEXT NOT NULL,
      created_at TEXT NOT NULL
    )`);
    db.run(`INSERT OR IGNORE INTO comments (id, username, comment, created_at) VALUES (1, 'admin', '<strong>Welcome!</strong>', '2026-05-01T12:00:00Z')`);
  });
}

app.get('/', (req, res) => {
  db.all('SELECT * FROM comments ORDER BY created_at DESC', (err, rows) => {
    if (err) {
      return res.status(500).send('Database error');
    }
    res.render('index_vulnerable', { comments: rows });
  });
});

app.post('/comment', (req, res) => {
  const username = req.body.username || 'Anonymous';
  const comment = req.body.comment || '';

  const query = `INSERT INTO comments (username, comment, created_at) VALUES ('${username}', '${comment}', datetime('now'))`;
  db.run(query, function (err) {
    if (err) {
      return res.status(500).send('Cannot save comment');
    }
    res.redirect('/');
  });
});

app.get('/api/comments', (req, res) => {
  const sort = req.query.sort || 'created_at DESC';
  db.all(`SELECT id, username, comment, created_at FROM comments ORDER BY ${sort}`, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rows);
  });
});

app.get('/api/search', (req, res) => {
  const search = req.query.q || '';
  db.all(`SELECT id, username, comment, created_at FROM comments WHERE comment LIKE '%${search}%'`, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rows);
  });
});

app.get('/api/config', (req, res) => {
  res.json({ apiKey: API_KEY, message: 'Hardcoded secret exposed' });
});

app.get('/api/external', async (req, res) => {
  const url = req.query.url || 'https://api.example.com/data';
  try {
    const response = await axios.get(url);
    res.json({ url, status: response.status, data: response.data });
  } catch (err) {
    res.status(500).json({ error: 'External request failed', details: err.message });
  }
});

initDb();
app.listen(port, () => {
  console.log(`Vulnerable app listening at http://localhost:${port}`);
});
