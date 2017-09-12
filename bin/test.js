#!/usr/bin/env node
const CoolRunner = require("../index");
let runner = new CoolRunner();

process.on("uncaughtException", err => {
    runner.processUncaught(err);
});

runner.run(success => {

    // Exit with non-zero code on failure
    process.exit(success ? 0 : 1);
});