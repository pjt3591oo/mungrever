const cluster = require('cluster');
const fs = require('fs');
const Helper = require('../../helper');
const {
  logDir, errDir
} = require('../../constant')

class Cluster {
  controller;

  constructor(execPath, isDebug, instances) {
    this.helper = new Helper();

    this.execPath = execPath;
    this.isDebug = isDebug
    this.instances = instances

    this.mungreverPid = process.pid;
  }

  setController(controller) {
    this.controller = controller;
    return this
  }

  setMungreverpid(mungreverPid) {
    this.mungreverPid = mungreverPid
    return this
  }

  createWorker () {
    const worker = cluster.fork({
      silent: true,
    });
    const streamStdout = fs.createWriteStream(`${logDir}/${worker.process.pid}.log`)
    const streamStderr = fs.createWriteStream(`${errDir}/${worker.process.pid}.err`)
    
    worker.process.stdout.pipe(streamStdout)
    worker.process.stderr.pipe(streamStderr)

    this.helper.createProcess(this.mungreverPid, worker.process.pid, this.execPath, 'cluster')
  }

  childProcessCloseHandler (worker, code, signal) {
    console.log(`worker ${worker.process.pid} died`);
    console.log(`code :${code} `);
    console.log(`signal :${signal} `);
    
    const pcbs = this.helper.getProcesses();
    const targetPcbIdx = pcbs.findIndex(v => v.pid === worker.process.pid)
    this.helper.deleteProcess(targetPcbIdx);
    
    if (signal) {
      this.instances--;
      console.log('[클러스터모드] 프로세스를 다시생성하지 않습니다.');
      console.log('[클러스터모드] 종료된 프로세스는 자동으로 삭제됩니다.');
      console.log(`[클러스터모드] 앞으로 ${this.instances} 개의 프로세스가 관리됩니다.`);
      return;
    }

    console.log('[클러스터모드] 프로세스를 다시 생성합니다.');
    this.createWorker()
  }

  createProcess() {
    cluster.setupMaster({
      exec : this.execPath,
      silent: true,
    });

    for (let i = 0; i < this.instances; i++) {
      this.createWorker()
    }

    cluster.on('exit', this.childProcessCloseHandler.bind(this));
  }

  // .mungrever/mungrever.pid에서 해당 프로세스 항목을 지운다
  killClear() {
    const pcbs = this.helper.getProcesses();
    pcbs
      .reduce((acc, cur, index) => {
        if (cur.mungrever === this.mungreverPid) {
          acc.push(index)
        }
        return acc
      }, [])
      .reverse()
      .forEach((pcbLineIdx) => {
        this.helper.deleteProcess(pcbLineIdx);
      })
  }
}

module.exports = Cluster;