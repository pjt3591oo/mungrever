class Monitor {
  
  constructor(helper) {
    this.helper = helper;
    this.pid = process.pid;
    this.controller = new AbortController();
  }

  setMode(mode) {
    this.mode = mode;
    this.mode
      .setController(this.controller)
      .setMungreverpid(this.pid);
  }

  start() {
    this.mode.createProcess();
    this.#childProcessKillSignal();
  }

  #sendKillSignalToChildProcess() {
    this.controller.abort();
  }

  // .mungrever/mungrever.pid에서 해당 프로세스 항목을 지운다
  #killClear() {
    try {
      this.mode.killClear()
    } catch (err) {
      console.log(err);
    }
  }
  
  #childProcessKillSignal() {
    process.on('SIGINT', () => {
      console.log(`[PROCESS MANAGER ${this.pid}] CTRL+C`)
      this.#killClear()
      this.#sendKillSignalToChildProcess()
      process.exit(0);
    });
    
    process.on('SIGQUIT', () => {
      console.log('Keyboard quit')
      this.#killClear()
      this.#sendKillSignalToChildProcess()
      process.exit(0);
    });
    
    process.on('SIGTERM', () => {
      console.log(`[PROCESS MANAGER ${this.pid}] kill command`)
      this.#killClear()
      this.#sendKillSignalToChildProcess()
      process.exit(0);
    });
    
    process.on('SIGHUP', () => {
      console.log(`[PROCESS MANAGER ${this.pid}] kill SIGHUP`)
      this.#killClear()
      this.#sendKillSignalToChildProcess()
      process.exit(0);
    }); 
  }
}

module.exports = Monitor;