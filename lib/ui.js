const clc = require("cli-color");
const { baseDir } = require('./constant');
const fileMsg = clc.xterm(249)

const _baseDir = () => {
  console.log(`${clc.green('info')}:    BASE Directory: ${baseDir}`);
}

const createProcess = (script) => {
  _baseDir()
  console.log(`${clc.green('info')}:    mungrever processing file: ${fileMsg(script)}`);
}

const deleteProcess = (pcb) => {
  _baseDir()
  if (pcb === -1) {
    console.log(`${clc.green('info')}:    No mungrever processes running`)  
  } else {
    console.log(`${clc.green('info')}:    mungrever stopped process:`)
    console.table([pcb], ['mungrever', 'pid', 'script', 'uptime'])
  }
}

const viewProcess = (pcbs) => {
  _baseDir()
  if (!pcbs?.length) {
    console.log(`${clc.green('info')}:    No mungrever processes running`)  
    return
  }
  console.log(`${clc.green('info')}:    Forever processes running`);
  console.table(pcbs, ['mungrever', 'pid', 'script', 'uptime'])
}

module.exports = {
  createProcess,
  deleteProcess,
  viewProcess,
}