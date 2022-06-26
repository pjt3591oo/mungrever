const Helper = require('../../helper');

const Monitor = require('./monitor');
const Fork = require('./fork')
const Cluster = require('./cluster')

const execPath = process.argv[2];
const isDebug = process.argv.some(v => v === '-d')
const command = process.argv.find(v => v.includes('-c') && v.length > 2)?.split(' ').slice(1)
const instances = parseInt(process.argv.find(v => v.includes('-i') && v.length > 2)?.split(' ').slice(1)[0] || 0)

const helper = new Helper();
const monitor = new Monitor(helper);

if (instances) {
  const cluster = new Cluster(execPath, isDebug, instances);
  monitor.setMode(cluster)
} else {
  const fork = new Fork(execPath, isDebug, command);
  monitor.setMode(fork)
}

monitor.start();