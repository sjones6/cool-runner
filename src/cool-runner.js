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

        // Record success
        let success = !this._tracker.anyErr();
        
        // Write out logs
        this._tracker.log();

        // Reset state
        this._tracker.reset();
        this._clearCacheModules();

        // Call finished handler
        this._finished.call(null, success);
    }

    _clearCacheModules() {
        Object.keys(require.cache).forEach(cached => {
            delete require.cache[cached];
        });
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

        try {
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
        } catch (err) {
            console.log("Error received attempting to create test case. Error bypassed.", err);
            next();
        }
    }

    _processTests(suite, testNames, suiteDone) {
        this._currSuite = suite.constructor.name;

        let runTest = i => {

            let runNext = () => {
                i++;
                runTest(i);
            };

            let processSuiteErr = err => {
                if (err instanceof AssertionError) {
                    process.stdout.write(red("F"));
                    this._tracker.add({
                        case: `${suite.constructor.name}: ${testNames[i]}`,
                        err
                    });
                } else {
                    this.processUncaught(err);
                }
            };

            if (!testNames[i]) {
                this._promise(suite.afterAll.bind(suite), err => {
                    if (err) {
                        processSuiteErr(err);
                    }
                    suiteDone();
                }, suite.timeout);
            } else {
                setImmediate(() => {
                    try {
                        this._promise(
                            suite.beforeAll.bind(suite),
                            err => {
                                if (err) {
                                    processSuiteErr(err);
                                    return suiteDone();
                                }

                                this._promise(
                                    suite.beforeEach.bind(suite),
                                    err => {
                                        if (err) {
                                            processSuiteErr(err);
                                            return suiteDone();
                                        }

                                        this._currTest = testNames[i];
                                        this._promise(
                                            suite[testNames[i]].bind(suite),
                                            err => {
                                                if (err) {
                                                    processSuiteErr(err);
                                                    return runNext();
                                                }
                                                
                                                this._promise(
                                                    suite.afterEach.bind(suite),
                                                    err => {
                                                        if (err) {
                                                            return processSuiteErr(err);
                                                            return runNext();
                                                        }
                                                        
                                                        this._tracker.increment();
                                                        process.stdout.write(cyan("."));
                                                        runNext();
                                                    },
                                                    suite.timeout
                                                );
                                            },
                                            suite.timeout
                                        );
                                    },
                                    suite.timeout
                                );
                            },
                            suite.timeout
                        );
                    } catch (err) {
                        processSuiteErr(err);
                    }
                });
            }
        }

        // Kick it off
        runTest(0);
    }

    processUncaught(err) {
        process.stdout.write(red("F"));
        this._tracker.add({
            case: `${this._currSuite || "Uncaught Error"}: ${this._currTest || "unkown test case"}`,
            uncaught: true,
            err
        });
    }

    _addTest(dir) {
        fs.readdirSync(dir).forEach(file => {
            let absPath = join(dir, file);
            if (fs.lstatSync(absPath).isDirectory()) {
                return this._addTest(absPath);
            } else if (file.substr(-3) === ".js") {
                try {
                    let testCase = uncacheRequire(absPath);
                    this.tests.push(testCase);
                } catch (err) {
                    this._tracker.add({
                        case: absPath,
                        uncaught: true,
                        testCase: true,
                        err
                    });
                }
            }
        });
    }

    _promise(cb, next, wait) {
        let finished = false;
        let timeout = setTimeout(() => {
            done(new Error("timed out waiting for response"))
        }, wait);
        let done = (err, val) => {
            if (!finished) {
                finished = true;
                clearTimeout(timeout);
                next(err, val);
            }
        };
        try {
            let res = cb.call(null, done);
            if (res instanceof Promise) {
                res.then(val => done(null, val))
                    .catch(done);
            }
        } catch (err) {
            done(err);
        }
    }
}

CoolRunner.TestCase = require("./TestCase");

module.exports = CoolRunner;