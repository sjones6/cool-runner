// Node
const {AssertionError} = require("assert");

// Packages
const {greenBright,cyan,red} = require("chalk");

class ErrTracker {
    constructor() {
        this.reset();
    }

    suite(suiteName) {
        this.suites.push(suiteName);
    }

    increment() {
        this.count++;
    }

    add(desc) {
        this.errs.push(desc);
    }

    anyErr() {
        return Boolean (this.errs.length);
    }

    log() {
        if (this.errs.length) {
            console.log(red(`\n\nERRORS: ${this.errs.length > 0 ? this.errs.length : 0}\n`));
            console.log(this.errs.reduce((carry, msg) => {
                return carry + msg.case + "\n" + red(this.getErrorMessage(msg.err)) + "\n";
            }, ""));
        } else if (this.count > 0) {
            console.log(greenBright("\nAll tests pass!\n\n"));
        } else {
            console.log(cyan("\nNo TestCases found!\n\n"));
        }
    }

    reset() {
        this.count = 0;
        this.errs = [];
        this.suites = [];
    }

    getErrorMessage(err) {
        if (err instanceof AssertionError) {
            return this._generateAssertionErrorMessage(err);
        } else if (err instanceof Error) {
            return "Uncaught error: " + err.message + "\n\n" + err.stack;
        } else {
            return (typeof err.toString === "function") ? err.toString() : err;
        }
    }

    _generateAssertionErrorMessage(err) {
        return red(`\tFailed asserting '${err.message}''`);
    }
}

module.exports = ErrTracker;