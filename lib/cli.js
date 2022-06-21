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
      .version('0.1.0');

    program.command('start')
      .description('create process by [*.js]')
      .argument('<string>', '*.js')
      .option('-n, --name <*.js>', 'process name')
      .option('-i <number>', 'cluster count')
      .action((filename, options) => {
        const { name } = options
        
        const execPath = path.join(__dirname, `../${filename}`)
        this.monitor.createMonitor(execPath, name);
        createProcess(execPath, name);
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
      });

    program.command('list')
      .description('managed process lise')
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