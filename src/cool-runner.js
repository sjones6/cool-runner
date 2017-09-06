// Node
const fs = require("fs");
const {join} = require("path");
const {AssertionError} = require("assert");

// Packages
const processArgs = require("minimist");
const {cyan,blueBright,red} = require("chalk");

// Local
const uncacheRequire = require("./uncacheRequire");
const ErrTracker = require("./ErrTracker");

// Closure State
const cwd = process.cwd();
const noop = () => {};
let TestCase;

class CoolRunner {
    constructor(opt) {
        this.lastRun;
        this._opt = {};
        this.tests = [];
        this._currentSuite = [];
        this._tracker = new ErrTracker();
        this._setOptions(opt);
    }

    /**
     * @param {function} allDone  Called when the suite is finished
     */
    run(allDone) {
        if (this._debounce()) {
            this.lastRun = Date.now();
            this._finished = typeof allDone === "function" ? allDone : noop;
            this._currentSuite = [];
            this._addTest(this._opt.testDir);
            this._runSuite();
        }
    }

    /* private api */
    
    _setOptions(opt = {}) {
        this.argv = processArgs(process.argv);
        this._opt.testDir = join(cwd, opt.testDir || this.argv.testDir || "tests"); 
    }

    _debounce() {
        return Boolean(!this.lastRun || (Date.now() - this.lastRun) > 2000);
    }

    _suiteFinished() {
        this.tests = [];
        this._tracker.log();
        this._tracker.reset();
        this._finished(!this._tracker.anyErr());
    }

    _runSuite() {
        // safeguard if no tests
        if (!this.tests.length) {
            this._suiteFinished();
            return;
        }

        // Reload base class
        TestCase = uncacheRequire("./TestCase");
        
        // Start processing
        this._runTestCase(0);
    }

    _runTestCase(i) {
        let Test = this.tests[i];
        
        let next = () => {
            i++;
            if (this.tests[i]) {
                this._runTestCase(i);
            } else {
                this._suiteFinished();
            }
        }

        if (!(Test && Test.prototype instanceof TestCase) || !Test) {
            return next();
        }

        let suite = new Test();
        let toRun = Object.getOwnPropertyNames(Test.prototype).filter(key => {
            return /test$/i.test(key) || /^test/i.test(key);
        });
        if (toRun && toRun.length) {
            this._tracker.suite(Test.name);
            this._processTests(suite, toRun, next);
        } else {
            next();
        }
    }

    _processTests(suite, testNames, suiteDone) {
        let runTest = i => {
            if (!testNames[i]) {
                suite.afterAll();
                suiteDone();
            } else {
                setImmediate(() => {
                    try {
                        suite.beforeEach();
                        suite[testNames[i]].call(suite, () => {
                            suite.afterEach();
                            this._tracker.increment();
                            process.stdout.write(cyan("."));
                            i++;
                            runTest(i);
                        });
                    } catch (err) {
                        if (err instanceof AssertionError) {
                            process.stdout.write(red("F"));
                            this._tracker.add({
                                case: `${suite.constructor.name}: ${testNames[i]}`,
                                err
                            });
                        } else {
                            this._tracker.add({
                                case: `${suite.constructor.name}: ${testNames[i]}`,
                                uncaught: true,
                                err
                            });
                        }
                        i++;
                        runTest(i);
                    }
                });
            }
        }
        suite.beforeAll();
        runTest(0);
    }

    _addTest(dir) {
        fs.readdirSync(dir).forEach(file => {
            let absPath = join(dir, file);
            if (fs.lstatSync(absPath).isDirectory()) {
                return this._addTest(absPath);
            } else if (file.substr(-3) === ".js") {
                this.tests.push(uncacheRequire(absPath));
            }
        });
    }
}

CoolRunner.TestCase = require("./TestCase");

module.exports = CoolRunner;