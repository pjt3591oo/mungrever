const { spawn } = require('child_process');
const path = require("path");
const fs = require('fs');

class Monitor {
  #monitorPath = path.join(__dirname, 'workers/monitor.js')
  debug = true

  constructor() {
    this.controller = new AbortController()
  }

  #getOptions(options) {
    const option ={
      signal: this.controller.signal, 
      detached: true, 
      stdio: [ 'ignore', 'ignore', 'ignore' ] 
    }
    if (options.debug) {
      option.stdio = ['pipe', 'pipe', 'pipe']
    }

    return option
  }

  #makeChild(execPath, options) {
    const commands = [this.#monitorPath, execPath]
    this.debug = options.debug

    if (this.debug) {
      commands.push('-d')
    }
    if (options.command) {
      commands.push(`-c ${options.command}`)
    }
    if (options.instances) {
      commands.push(`-i ${options.instances}`)
    }

    const option = this.#getOptions(options)

    return spawn('node', commands, option)
  }

  #createMonitor (execPath, options) {
    const child = this.#makeChild(execPath, options);

    if (!options.debug) {
      child.unref()
      return 
    } 

    child.stderr.on('data', (msg) => {
      console.log(msg.toString());
    })
    child.stdout.on('data', (msg) => {
      console.log(msg.toString());
    })

    if(options.watch) {
      this.#createMonitorWatch(execPath, options, child)
    }
    this.childProcessKillSignal()
  }

  #createMonitorWatch(execPath, options, child) {
    const watch = fs.watch(path.join(execPath, '../'), (eventType, filename) => {
      watch.close()
      this.#createMonitor(execPath, options)
      child.kill('SIGHUP')
    })
  }

  createMonitor (execPath, options) {
    this.#createMonitor(execPath, options);
  }

  childProcessKillSignal() {
    process.on('SIGINT', () => {
      console.log(`[mungrever] CTRL+C`)
      this.controller.abort()
      process.exit(0);
    });
    
    process.on('SIGQUIT', () => {
      console.log('[mungrever] Keyboard quit')
      this.controller.abort()
      process.exit(0);
    });
    
    process.on('SIGTERM', () => {
      console.log(`[mungrever] kill command`)
      this.controller.abort()
      process.exit(0);
    });
    
    process.on('SIGHUP', () => {
      console.log(`[mungrever] kill SIGHUP`)
      this.controller.abort()
      process.exit(0);
    }); 
  }
}

module.exports = Monitor;