class TestCase {
    constructor() {
        this.setTimeout(2000);
    }

    setTimeout(timeout) {
        this.timeout = timeout;
    }

    beforeAll(done) {
        done();
    }

    beforeEach(done) {
        done();
    }

    afterAll(done) {
        done();
    }

    afterEach(done) {
        done();
    }
}

module.exports = TestCase;