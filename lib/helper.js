const fs = require('fs');
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

  createProcess (monitorPid, childPid, script) {
    const pcbs = [...this.getProcesses()]
    pcbs.push({
      mungrever: monitorPid,
      pid: childPid,
      script,
      uptime: new Date().getTime()
    })
    const raw = pcbs.map(v => `${v.mungrever},${v.pid},${v.script},${v.uptime}`).join('\n')
    fs.writeFileSync(pidsPath, raw + '\n', {
      encoding:'utf8',flag:'w'
    })
  }
  
  deleteProcess (idx) {
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

    const pcb = this.#strToPcb(lines[idx])
    return pcb
  }

  #strToPcb(str) {
    const splited = str.split(',')
    const pcb = {
      mungrever: parseInt(splited[0]),
      pid: parseInt(splited[1]),
      script: splited[2],
      uptime: parseInt(splited[3])
    }

    return pcb;
  }
}

module.exports = Helper;