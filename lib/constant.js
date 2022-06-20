// const baseDir = `${process.cwd()}/.mungrever`
const baseDir = `${process.env.HOME}/.mungrever`

const logDir = `${baseDir}/logs`
const errDir = `${baseDir}/err`
const pidDir = `${baseDir}/pids`

const pidsPath = `${baseDir}/mungrever.pid` // mungrever pid,executor pid,script,uptime

module.exports = {
  baseDir,
  logDir,
  errDir,
  pidDir,
  pidsPath,
}
