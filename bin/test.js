#!/usr/bin/env node
const CoolRunner = require("../index");
let runner = new CoolRunner();

runner.run(success => {

    // Exit with non-zero code on failure
    process.exit(success ? 0 : 1);
});