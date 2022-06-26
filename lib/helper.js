const fs = require('fs');
const clc = require("cli-color");
const dateMsg = clc.xterm(249)
const {   
  baseDir,
  logDir,
  errDir,
  pidDir,
  pidsPath
} = require('./constant');

class Helper {

  constructor() {
    this.#init()
  }

  #init() {
    !fs.existsSync(baseDir) && fs.mkdirSync(baseDir);
    !fs.existsSync(logDir) && fs.mkdirSync(logDir);
    !fs.existsSync(errDir) && fs.mkdirSync(errDir);
    !fs.existsSync(pidDir) && fs.mkdirSync(pidDir);
  }


  getProcesses ()  {
    if (!fs.existsSync(pidsPath)) return []
    const lines = fs
      .readFileSync(`${pidsPath}`)
      .toString()
      .split('\n')
      .filter(v => v)
      
    const pcbs = lines.map((line, idx) => this.#strToPcb(line))

    return pcbs
  }
  
  getLogs (idx) {
    idx = parseInt(idx)
    try {
      const pcbs = this.getProcesses()
      
      if (!(pcbs.length > idx)) {
        return []
      }

      const pcb = pcbs[idx]
      const lines = fs.readFileSync(`${logDir}/${pcb.mungrever}.log`)
      return lines
    } catch(err) {
      console.log(err);
    }
  }
  
  writeLogs (pid, msg) {
    fs.appendFileSync(`${logDir}/${pid}.log`, msg)
  }
  writeErr (pid, msg) {
    fs.appendFileSync(`${errDir}/${pid}.log`, msg)
  }

  createProcess (monitorPid, childPid, script, mode) {
    const pcbs = [...this.getProcesses()]
    pcbs.push({
      mungrever: monitorPid,
      pid: childPid,
      mode,
      script,
      uptime: new Date().getTime()
    })
    const raw = pcbs.map(v => `${v.mungrever},${v.pid},${mode},${v.script},${v.uptime}`).join('\n')
    fs.writeFileSync(pidsPath, raw + '\n', {
      encoding:'utf8',flag:'w'
    })
  }

  logMonitor (idx) {
    idx = parseInt(idx)
    try {
      const pcbs = this.getProcesses()
      
      if (!(pcbs.length > idx)) {
        return []
      }
      
      return pcbs;
    } catch(err) {
      
    }
  }
  
  deleteProcess (idx) {
    if (!fs.existsSync(pidsPath)) return -1

    idx = parseInt(idx)
    const lines = fs
      .readFileSync(`${pidsPath}`)
      .toString()
      .split('\n')
      .filter(v => v)

    if (idx >= lines.length) return -1

    const newLines = lines.filter((line, lineIdx) => idx !== lineIdx)

    fs.writeFileSync(
      pidsPath, 
      newLines.join('\n') + '\n',
      {
        encoding:'utf8',flag:'w'
      }
    )
    console.log(lines)
    console.log(idx)
    const pcb = this.#strToPcb(lines[idx])
    return pcb
  }

  #strToPcb(str) {
    const splited = str.split(',')
    const pcb = {
      mungrever: parseInt(splited[0]),
      pid: parseInt(splited[1]),
      mode: splited[2],
      script: splited[3],
      uptime: parseInt(splited[4])
    }

    return pcb;
  }
}

module.exports = Helper;