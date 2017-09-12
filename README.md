# Cool Runner

An intentionally minimal, slightly opinionated test runner for NodeJS (does not work in the browser!)

![Cool Runnings Gif](https://media.giphy.com/media/11oPKCg5x7J7nG/giphy.gif)

## Installation

Local installation:

`yarn add cool-runner` or `npm install cool-runner --save`

You may also install globally:

`yarn add -g cool-runner` or `npm install -g cool-runner`

## Writing Tests

All tests must extend from the `TestCase` class.

```javascript
const {TestCase} = require('cool-runner');
const assert = require('assert');

class MyTestCase extends TestCase {

    constructor() {
        super();

        // How long to wait for async operations
        // Default is 2000
        this.setTimeout(2000);
    }

    /*
     * Tests should start or end with the word "test".
     * camelCase, PascalCase, snake_case, etc. are all fine
     */
    testSomeSynchronousFunctionality(done) {
        assert.strictEqual(obj.runLogic(), true);
        done();
    }

    /**
     * `done` must be called for both synchronous and async tests
     * unless using promises ...
     */
    some_async_functionality_test(done) {
        runSomeAsyncLogic.then(response => {
            assert.deepStricEqual(response, mock);
            done();
        });
    }

    /**
     * Alternatively, return a promise that resolves after 
     * everything is finished
     */
    some_async_functionality_test_with_promise() {
        return new Promise((resolve, reject) => {
            runSomeAsyncLogic.then(response => {
                assert.deepStricEqual(response, mock);
                resolve();
            });
        });
    }

    /**
     * not all methods need to be tests
     */
    squareUtilityMethod(param) {
        return param * 2;
    }

    /**
     * Call the utility method from this test case
     */
    test_some_logic_with_utility_method(done) {
        assert.equal(this.squareUtilityMethod(2), 4);
        done();
    }

    /* other helpful methods to know about */

    beforeEach(done) {
        // do something before every test is run
        done();
    }

    /**
     * Same as above, you can call the callback when finished
     * or return a promise that resolves.
     */
    beforeAll() {
        // called once before the entire suite is run.
        return new Promise((resolve, reject) => {
            // do something important
            resolve();
        });
    }

    afterEach(done) {
        // do some cleanup after each test
        done();
    }

    afterAll() {
        // called once after suite is finished
    }
}

module.exports = MyTestCase;
```

## Running Tests

CoolRunner exposes two commands, which recursively search your test directory and run all of the valid test cases.

### **`cool-runner test`**: run tests once

* `--testDir=tests`: Specify the relative path to some other directory besides `tests` where tests are stored

### **`cool-runner watch`**: run tests on file change to either src or tests

* `--testDir=tests`: Specify the relative path to some other directory besides `tests` where tests are stored
* `--srcDir=src`: Specify the relative path to some other directory besides `src` where source code is stored

### Directory Structure

By default, CoolRunner assumes you're directory structure looks like this:

```
- node_modules/
- src/     // all source code
- tests/   // all tests
- etc...
```

If you interleave source code and tests, run the following to recursively search your source directory, running only valid test cases

`cool-runner test --testDir=src`

(Note, that there is a slight performance benefit to keeping them in separate directories. This benefit could be more important as the size of the tests and source directory grow.)


## Why CoolRunner?

There are lots of great test runners available in the JavaScript ecosystem (which I use and enjoy!). However, CoolRunner is designed with a few things in mind:

* Speed: Tests should run in <1s, preferrably faster.
* Ease of use: Straightfoward API. Sensible defaults.
* Easy to wire-up to debuggers for interactive testing + debugging.
* Avoid any global state.

## Contributing

Contributions welcome on [Gitbub](https://github.com/sjones6/cool-runner).

## Issues

Submit issues on [Github](https://github.com/sjones6/cool-runner/issues).

## Authors

* [Spencer Jones (sjones6)](https://github.com/sjones6)