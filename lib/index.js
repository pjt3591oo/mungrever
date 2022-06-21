#!/usr/bin/env node

const Cli = require('./cli');
const Monitor = require('./monitor');
const Helper = require('./helper');

const monitor = new Monitor();
const helper = new Helper();

const cli = new Cli(monitor, helper);

cli.start()