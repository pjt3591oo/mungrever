const clc = require("cli-color");
const { baseDir, logDir } = require('./constant');
const fs = require('fs');
const fileMsg = clc.xterm(249)

const _baseDir = () => {
  console.log(`${clc.green('info')}:    BASE Directory: ${baseDir}`);
}

const createProcess = (script, options) => {
  _baseDir()
  console.log(`${clc.green('info')}:    mungrever processing file: ${fileMsg(script)}`);
  if (options.watch) {
    console.log(`${clc.green('info')}:    와치(watch) 모드는 디버그(debug) 모드로 프로세스를 실행합니다.`);
    console.log(`${clc.green('info')}:    실행한 파일을 기준으로 디렉터리에 파일 변경이 감지되면 script를 다시실행합니다.`);
  }
  if (options.debug) {
    console.log(`${clc.green('info')}:    디버그(debug) 모드로 프로세스를 실행합니다.`);
    console.log(`${clc.green('info')}:    mungrever PID: ${process.pid}`);
    console.log(`${clc.green('info')}:    터미널 종료시 monitor - worker 순으로 삭제됩니다 `);
  }
}

const deleteProcess = (pcb) => {
  _baseDir()
  if (pcb === -1) {
    console.log(`${clc.green('info')}:    No mungrever processes running`)  
  } else {
    console.log(`${clc.green('info')}:    mungrever stopped process:`)
    console.table([pcb], ['mungrever', 'pid', 'mode', 'script', 'uptime'])
  }
}

const viewProcess = (pcbs) => {
  _baseDir()
  if (!pcbs?.length) {
    console.log(`${clc.green('info')}:    No mungrever processes running`)  
    return
  }
  console.log(`${clc.green('info')}:    Forever processes running`);
  console.table(pcbs, ['mungrever', 'pid', 'mode', 'script', 'uptime'])
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