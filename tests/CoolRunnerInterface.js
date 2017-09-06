const assert = require("assert");
const CoolRunner = require("../index");
const TestCase = CoolRunner.TestCase;

class CoolRunnerInterface extends TestCase {
    test_that_it_has_the_appropriate_methods(done) {
        assert.strictEqual(typeof CoolRunner.prototype.run === "function", true);
        done();
    }

    test_that_receives_a_test_dir(done) {
        let runner = new CoolRunner({
            testDir: "someDir"
        });
        assert.strictEqual(/someDir/.test(runner._opt.testDir), true);
        done();
    }
}

module.exports = CoolRunnerInterface;