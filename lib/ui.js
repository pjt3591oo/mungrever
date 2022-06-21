const clc = require("cli-color");
const { baseDir, logDir } = require('./constant');
const fs = require('fs');
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

const logMonit = (pcbs, idx) => {
  const filepath = `${logDir}/${pcbs[idx].mungrever}.log`
  _baseDir()
  console.log(`${clc.green('info')}:    Monitor Path: ${filepath}`);

  let SIZE = 512; 
  
  const stat = fs.statSync(filepath)
  let bytesRead = stat.size;
  
  fs.watch(filepath, (eventType, filename) => {
    
    fs.open(filepath, 'r', function(err, fd) {
      fs.fstat(fd, function(err, stats) {
        let bufferSize = stats.size;
        let buffer = Buffer.alloc(bufferSize);
    
        while (bytesRead < bufferSize) {
          let size = Math.min(SIZE, bufferSize - bytesRead);
          let read = fs.readSync(fd, buffer, bytesRead, size, bytesRead);
          bytesRead += read;
        }
        if (buffer.toString().trim()) {
          console.log(buffer.toString().trim());
        }
      });
    });
  })
}

module.exports = {
  createProcess,
  deleteProcess,
  viewProcess,
  logMonit,
}