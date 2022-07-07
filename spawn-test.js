const { spawn } = require('child_process');

const controller = new AbortController();

const childPy = spawn('python', ['example/test.py'], {
  signal: controller.signal,
  detached: true, 
  stdio: ['ignore', 'pipe', 'pipe']
})
childPy.stdout.on('data', (msg) => {
  console.log('python: ', msg.toString())
})

const childRust = spawn('./example/test', {
  signal: controller.signal,
  detached: true, 
  stdio: ['ignore', 'pipe', 'pipe']
})
childRust.stdout.on('data', (msg) => {
  console.log('rust: ', msg.toString())
})

const childGo = spawn('go',['run', 'example/test.go'], {
  signal: controller.signal,
  detached: true, 
  stdio: ['ignore', 'pipe', 'pipe']
})
childGo.stdout.on('data', (msg) => {
  console.log('go: ', msg.toString())
})
