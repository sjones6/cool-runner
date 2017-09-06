#!/usr/bin/env node
const fs = require("fs");
const {join} = require("path");
const {cyan} = require("chalk");
const parseArgs = require("minimist");
const CoolRunner = require("../index");

const cwd = process.cwd();
let argv = parseArgs(process.argv);
let runner = new CoolRunner();

// Watch src/ dir by default
let absSrcPath = join(cwd, (argv.srcDir || "src"));
fs.watch(absSrcPath, {recursive: true}, runner.run.bind(runner));

// Watch test dir if it is not the same as the src dir
let srcDir = argv.srcDir ? argv.srcDir.replace(/\W/g, "") : "src";
if (!argv.testDir || (argv.testDir && (argv.testDir.replace(/\W/g, "") !== srcDir))) {

    let absTestPath = join(cwd, (argv.testDir || "tests"));
    fs.watch(absTestPath, {recursive: true}, runner.run.bind(runner));
}

console.log(cyan("CoolRunner is watching for changes ...\n"));
