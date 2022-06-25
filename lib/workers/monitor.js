const { spawn } = require('child_process');
const cluster = require('cluster');
const fs = require('fs');
const Helper = require('../helper');
const {
  logDir, errDir
} = require('../constant')

class Monitor {
  
  constructor() {
    this.helper = new Helper();

    this.execPath = process.argv[2];
    this.isDebug = process.argv.some(v => v === '-d')
    this.command = process.argv.find(v => v.includes('-c') && v.length > 2)?.split(' ').slice(1)
    this.instances = parseInt(process.argv.find(v => v.includes('-i') && v.length > 2)?.split(' ').slice(1)[0] || 1)
    this.controller = new AbortController();
    this.pid = process.pid;

    this.isRestart = true;
    if (this.instances > 0) {
      this.createClusterWorker();
    } else {
      this.createProcess();
    }
    this.#childProcessKillSignal();
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

  #makeChild() {
    const { signal } = this.controller;
    const processOption = {
      signal,
      detached: true,
      stdio: ['ignore', 'pipe', 'pipe']
    }
    let child;

    if (this.command) {
      const [env, ...script] = this.command
      child = spawn(env, script, processOption)
    } else {
      child = spawn('node', [this.execPath], processOption)
    }

    return child
  }

  createProcess() {
    const child = this.#makeChild();
  
    child.stdout.on('data', this.#pipeOut.bind(this))
    child.stderr.on('data', this.#pipeErr.bind(this))
  
    child.on('close', this.#childProcessCloseHandler.bind(this) )
    this.helper.createProcess(this.pid, child.pid, this.execPath, 'fork')
    return child.pid
  }

  createClusterWorker() {
    cluster.setupMaster({
      exec : this.execPath,
      silent: true,
    });

    const createWorker = () => {
      const worker = cluster.fork({
        silent: true,
      });
      const streamStdout = fs.createWriteStream(`${logDir}/${worker.process.pid}.log`)
      const streamStderr = fs.createWriteStream(`${errDir}/${worker.process.pid}.err`)
      worker.process.stdout.pipe(streamStdout)
      worker.process.stderr.pipe(streamStderr)
      this.helper.createProcess(this.pid, worker.process.pid, this.execPath, 'cluster')
    }

    const exitHandler = (worker, code, signal) => {
      console.log(`worker ${worker.process.pid} died`);
      console.log(`code :${code} `);
      console.log(`signal :${signal} `);
      
      const pcbs = this.helper.getProcesses();
      const targetPcbIdx = pcbs.findIndex(v => v.pid === worker.process.pid)
      this.helper.deleteProcess(targetPcbIdx);
      
      if (signal) {
        return;
      }

      createWorker()
    }
    for (let i = 0; i < this.instances; i++) {
      createWorker()
    }

    cluster.on('exit', exitHandler.bind(this));
  }

  // .mungrever/mungrever.pid에서 해당 프로세스 항목을 지운다
  #killClear() {
    try {
      for (let i = 0 ; i < this.instances ; i++) {
        const pcbs = this.helper.getProcesses();
        const targetPcbIdx = pcbs.findIndex(v => v.mungrever === this.pid);
        this.helper.deleteProcess(targetPcbIdx);
      }
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
