#!/usr/bin/env node
const parseArgs = require("minimist");
const args = parseArgs(process.argv);
let command = args._[2];

switch (command) {
    case "test": 
        require("./test.js");
        break;
    case "watch":
        require("./watch.js");
        break;
    default:
        throw "Unsupported command!";
}