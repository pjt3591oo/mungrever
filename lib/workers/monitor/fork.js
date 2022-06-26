
const { spawn } = require('child_process');
const fs = require('fs');
const Helper = require('../../helper');
const {
  logDir, errDir
} = require('../../constant')

class Fork {
  constroller;

  constructor(execPath, isDebug, command) {
    this.helper = new Helper();

    this.execPath = execPath;
    this.isDebug = isDebug
    this.command = command
    this.mungreverPid = process.pid;

    this.isRestart = true;
  }

  setController(controller) {
    this.controller = controller;
    return this
  }

  setMungreverpid(mungreverPid) {
    this.mungreverPid = mungreverPid
    return this
  }

  #pipeOut(msg) {
    if (!this.isRestart) return;
    if(this.isDebug) {
      console.log(msg.toString())
    } else {
      this.helper.writeLogs(this.mungreverPid, msg);
    }
  }

  #pipeErr(msg) {
    // system call error: https://nodejs.org/api/errors.html#common-system-errors
    this.isRestart = !msg.toString().includes(`code: 'EADDRINUSE'`)

    if (this.isDebug) {
      console.log(msg.toString())
    } else {
      this.helper.writeLogs(this.mungreverPid, msg);
      this.helper.writeErr(this.mungreverPid, msg);
    }
  }

  #childProcessCloseHandler(code, signal) {
    console.log('close', this.isRestart, this.mungreverPid)
    
    this.killClear();

    if (!this.isRestart) {
      console.log('[포크모드] 프로세스를 다시생성하지 않습니다.');
      this.#childProcessKill()
      return;
    }

    console.log('[포크모드]프로세스를 다시 생성합니다.');
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
    this.helper.createProcess(this.mungreverPid, child.pid, this.execPath, 'fork')
    
    return child.pid
  }

  // .mungrever/mungrever.pid에서 해당 프로세스 항목을 지운다
 killClear() {
    const pcbs = this.helper.getProcesses();
    const targetPcbIdx = pcbs.findIndex(v => v.mungrever === this.mungreverPid);
    this.helper.deleteProcess(targetPcbIdx);
  }
}

module.exports = Fork;