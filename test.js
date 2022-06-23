const { spawn } = require('child_process');
const controller = new AbortController();

const child = spawn('python', ['example/test.py'], {
  signal: controller.signal,
  detached: true,
  stdio: ['ignore', 'pipe', 'pipe']
})

child.on('data', (msg) => {
  console.log(msg.toString())
})

child.stdout.on('data', (msg) => {
  console.log(msg.toString())
})
child.stderr.on('data', (msg) => {
  console.log(msg.toString())
})