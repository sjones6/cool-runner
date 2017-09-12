const assert = require("assert");
const CoolRunner = require("../index");
const TestCase = CoolRunner.TestCase;

class AsyncTest extends TestCase {
    constructor() {
        super();
        this.setTimeout(400);
    }

    beforeAll(done) {
        return new Promise(resolve => {
            assert.strictEqual(typeof done === 'function', true);
            resolve();
        });
    }

    beforeEach(done) {
        assert.strictEqual(typeof done === 'function', true);
        done();

    }

    afterEach(done) {
        assert.strictEqual(typeof done === 'function', true);
        done();
    }

    afterAll(done) {
        return new Promise(resolve => {
            assert.strictEqual(typeof done === 'function', true);
            setTimeout(resolve, 390);
        });
    }

    test_that_this_is_actually_run(done) {
        return new Promise(resolve => {
            assert.strictEqual(typeof done === 'function', true);
            resolve();
        });
    }

}

module.exports = AsyncTest;