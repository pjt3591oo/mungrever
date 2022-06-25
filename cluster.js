const cluster = require('cluster');
const fs = require('fs');

cluster.setupMaster({
  exec : "example/simple-server.js",
  silent: true,
});


function createWorker () {
  const worker = cluster.fork({
    silent: true,
  });
  const streamStdout = fs.createWriteStream(`./${worker.process.pid}.log`)
  const streamStderr = fs.createWriteStream(`./${worker.process.pid}.err`)
  worker.process.stdout.pipe(streamStdout)
  worker.process.stderr.pipe(streamStderr)
  // worker.process.stdout.pipe(process.stdout)
}

// 워커를 포크한다.
for (let i = 0; i < 2; i++) {
  createWorker()
}

console.log(process.pid)

cluster.on('exit', function(worker, code, signal) {
  console.log('worker ' + worker.process.pid + ' died');
  createWorker()
});

cluster.on('fork', function(worker) {
  console.log(`worker: ${worker.process.pid}`)
});

// fs.writeFileSync(`./${process.pid}.log`, '')
// process.stdout.write = function(str, encoding, fg) {
//   fs.appendFileSync(`./${process.pid}.log`, str)
// }