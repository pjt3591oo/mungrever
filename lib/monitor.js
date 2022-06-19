const { spawn } = require('child_process');
const path = require("path");

class Monitor {
  #monitorPath = path.join(__dirname, 'workers/monitor.js')

  constructor() {
    
  }

  #createMonitor (execPath) {
    const controller = new AbortController();
    const { signal } = controller;

    const child = spawn('node', [this.#monitorPath, execPath], { 
      signal, 
      detached: true, 
      // stdio: [ 'ignore', 'inherit', 'inherit' ] 
      stdio: [ 'ignore', 'ignore', 'ignore' ] 
    });
    child.unref()
  }

  createMonitor (execPath) {
    this.#createMonitor(execPath);
  }
}

module.exports = Monitor;