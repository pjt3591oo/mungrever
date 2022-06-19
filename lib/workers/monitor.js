const { spawn } = require('child_process');

const Helper = require('../helper');
const execPath = process.argv[2];
const helper = new Helper();
const pid = process.pid;

let isRestart = true;

const controller = new AbortController();

const createProcess = (execPath) => {
  const { signal } = controller;

  const child = spawn('node', [execPath], {
    signal,
    detached: true,
    stdio: ['ignore', 'pipe', 'pipe']
  });

  child.stdout.on('data', (msg) => {
    if (!isRestart) return;
    helper.writeLogs(pid, msg);
  })

  child.stderr.on('data', (msg) => {
    // system call error: https://nodejs.org/api/errors.html#common-system-errors
    isRestart = !msg.toString().includes(`code: 'EADDRINUSE'`)
    helper.writeLogs(pid, msg);
    helper.writeErr(pid, msg);
  })

  child.on('close', (code, signal) => {
    console.log('close', isRestart, pid)
    
    const pcbs = helper.getProcesses();
    const targetPcbIdx = pcbs.findIndex(v => v.mungrever === pid);
    helper.deleteProcess(targetPcbIdx);

    if (!isRestart) {
      console.log('프로세스를 다시생성하지 않습니다.');
      // controller.abort();
      return;
    }

    console.log('프로세스를 다시 생성합니다.');
    createProcess(execPath);
  })
  helper.createProcess(pid, child.pid, execPath)
  return child.pid
}

createProcess(execPath);

process.on('SIGINT', () => {
  console.log(`[PROCESS MANAGER ${pid}] CTRL+C`)
  controller.abort()
  process.exit(0);
});

process.on('SIGQUIT', () => {
  console.log('Keyboard quit')
  controller.abort()

  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log(`[PROCESS MANAGER ${pid}] kill command`)
  controller.abort()
  process.exit(0);
});

process.on('SIGHUP', () => {
  console.log(`[PROCESS MANAGER ${pid}] kill SIGHUP`)
  controller.abort()
  process.exit(0);
}); 
