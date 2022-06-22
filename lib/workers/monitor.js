const { spawn } = require('child_process');

const Helper = require('../helper');

class Monitor {
  
  constructor() {
    this.helper = new Helper();

    this.execPath = process.argv[2];
    this.isDebug = process.argv.some(v => v === '-d')

    this.controller = new AbortController();
    this.pid = process.pid;

    this.isRestart = true;

    this.createProcess();
    this.#childProcessKillSignal();
    this.helper.writeLogs(this.pid, 'test')
  }

  #pipeOut(msg) {
    if (!this.isRestart) return;
    if(this.isDebug) {
      console.log(msg.toString())
    } else {
      this.helper.writeLogs(this.pid, msg);
    }
  }

  #pipeErr(msg) {
    // system call error: https://nodejs.org/api/errors.html#common-system-errors
    this.isRestart = !msg.toString().includes(`code: 'EADDRINUSE'`)

    if (this.isDebug) {
      console.log(msg.toString())
    } else {
      this.helper.writeLogs(this.pid, msg);
      this.helper.writeErr(this.pid, msg);
    }
  }

  #childProcessCloseHandler(code, signal) {
    console.log('close', this.isRestart, this.pid)
    
    this.#killClear();

    if (!this.isRestart) {
      console.log('프로세스를 다시생성하지 않습니다.');
      this.#childProcessKill()
      return;
    }

    console.log('프로세스를 다시 생성합니다.');
    this.createProcess(this.execPath);
  }

  #childProcessKill() {
    this.controller.abort();
  }

  createProcess() {
    const { signal } = this.controller;

    const child = spawn('node', [this.execPath], {
      signal,
      detached: true,
      stdio: ['ignore', 'pipe', 'pipe']
    });
  
    child.stdout.on('data', this.#pipeOut.bind(this))
    child.stderr.on('data', this.#pipeErr.bind(this))
  
    child.on('close', this.#childProcessCloseHandler.bind(this) )

    this.helper.createProcess(this.pid, child.pid, this.execPath)
    return child.pid
  }

  // .mungrever/mungrever.pid에서 해당 프로세스 항목을 지운다
  #killClear() {
    try {
      const pcbs = this.helper.getProcesses();
      const targetPcbIdx = pcbs.findIndex(v => v.mungrever === this.pid);
      this.helper.deleteProcess(targetPcbIdx);
    } catch(err) {
      console.error(err);
    }
  }
  
  #childProcessKillSignal() {
    process.on('SIGINT', () => {
      console.log(`[PROCESS MANAGER ${this.pid}] CTRL+C`)
      this.#killClear()
      this.#childProcessKill()
      process.exit(0);
    });
    
    process.on('SIGQUIT', () => {
      console.log('Keyboard quit')
      this.#killClear()
      this.#childProcessKill()
      process.exit(0);
    });
    
    process.on('SIGTERM', () => {
      console.log(`[PROCESS MANAGER ${this.pid}] kill command`)
      this.#killClear()
      this.#childProcessKill()
      process.exit(0);
    });
    
    process.on('SIGHUP', () => {
      console.log(`[PROCESS MANAGER ${this.pid}] kill SIGHUP`)
      this.#killClear()
      this.#childProcessKill()
      process.exit(0);
    }); 
  }
}

const monitor = new Monitor()
