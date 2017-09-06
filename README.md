# Cool Runner

An intentionally minimal, slightly opinionated test runner for NodeJS

# Installation

`yarn add cool-runner` or `npm install cool-runner --save`

# Writing Tests

```javascript
const {TestCase} = require('cool-runner');
const assert = require('assert');

class MyTestCase extends TestCase {

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
     */
    some_async_functionality_test(done) {
        runSomeAsyncLogic.then(response => {
            assert.deepStricEqual(response, mock);
            done();
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

    beforeEach() {
        // do something before every test is run
    }

    beforeAll() {
        // called once before the entire suite is run.
    }

    afterEach() {
        // do some cleanup after each test
    }

    afterAll() {
        // called once after suite is finished
    }
}

module.exports = MyTestCase;
```

# Running Tests

CoolRunner exposes two commands, which recursively search your test 

* **Basic Test Running (`test`)**

`cool-runner test`

Options:
* `--testDir=tests`: Specify the relative path to some other directory besides `tests` where tests are stored

* **Running tests on file change (`watch`)**

`cool-runner watch`

Options:
* `--testDir=tests`: Specify the relative path to some other directory besides `tests` where tests are stored
* `--srcDir=src`: Specify the relative path to some other directory besides `src` where source code is stored

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