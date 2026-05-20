const { spawn } = require('child_process');

const app = spawn('node', ['secure_app.js'], { stdio: 'inherit' });

app.on('close', (code) => {
  console.log(`Secure app exited with code ${code}`);
});
