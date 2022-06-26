const { execSync } = require('child_process');
const { Command } = require('commander');
const path = require("path");

const { 
  createProcess, deleteProcess, 
  viewProcess, logMonit 
} = require('./ui');

const program = new Command();

class Cli {

  constructor(monitor, helper) {
    this.monitor = monitor;
    this.helper = helper;
  }

  start() {
    program
      .name('mungrever')
      .description('CLI to process management')
      .version('0.5.1');

    program.command('start')
      .description('create process by [*.js]')
      .argument('<string>', '*.js')
      .option('-c, --command <string>', 'COMMAND to execute (defaults to node)')
      .option('-i --instances <number>', 'launch [number] instances (for networked app)(load balanced)')
      .option('-w, --watch', 'Watch for file changes')
      .option('-d, --debug', 'Forces forever to log debug output')
      .action((filename, options) => {
        const execPath = options.command || path.join(__dirname, `../${filename}`)
        options.debug = options.watch || options.debug;
        if (options.command) {
          options.watch = false // command는 와치모드 불가능
        }
        this.monitor.createMonitor(execPath, options);
        createProcess(execPath, options);
      });

    program.command('log')
      .description('view log by process index')
      .argument('<number>', 'process index')
      .action((idx) => {
        const logs = this.helper.getLogs(idx);
        console.log(logs.toString())
      });

    program.command('delete')
      .description('process delete by process index')
      .argument('<number>', 'process index')
      .action((idx) => {
        const killPcb = this.helper.deleteProcess(idx)

        if (killPcb !== -1) {
          execSync(`kill ${killPcb.mungrever}`)
        }
        
        deleteProcess(killPcb)
        viewProcess(this.helper.getProcesses())
      });

    program.command('list')
      .description('managed process list')
      .action(() => {
        const pcbs = this.helper.getProcesses();
        viewProcess(pcbs)
      });

    program.command('monit')
      .description('show log monitor')
      .argument('<number>', 'process index')
      .action((idx) => {
        const pcbs = this.helper.logMonitor(idx)
        logMonit(pcbs, parseInt(idx))
      });

    program.parse();
  }
}


module.exports = Cli;