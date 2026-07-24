const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const logFile = 'dev-server.log';
try { fs.unlinkSync(logFile); } catch (e) {}

const out = fs.openSync(logFile, 'w');
const projectDir = 'E:\\New folder\\COLLAB-SPACE';

const child = spawn('cmd.exe', ['/c', 'npm run dev'], {
  cwd: projectDir,
  detached: true,
  stdio: ['ignore', out, out],
});

child.unref();

console.log('Dev server starting in background...');
console.log('PID:', child.pid);
console.log('URL: http://localhost:3000');
console.log('Log file:', path.join(projectDir, logFile));
console.log('');
console.log('To stop: Stop-Process -Id', child.pid);
