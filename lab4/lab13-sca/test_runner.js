const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/',
  method: 'GET'
};

const req = http.request(options, (res) => {
  console.log('Status:', res.statusCode);
  console.log('CSP:', res.headers['content-security-policy']);
  console.log('X-Content-Type-Options:', res.headers['x-content-type-options']);
  res.resume();
});

req.on('error', (err) => {
  console.error('Error connecting to secure app:', err.message);
});

req.end();
