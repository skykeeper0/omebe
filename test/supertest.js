var server = require ('../server/server'),
    assert = require ('assert'),
    http = require ('http');
var port = 8080;

describe('server', function () {
    before(function () {
        server.listen(port);
    });

    after(function () {
        server.close();
    });

    describe('Server status and Message', function () {
      it('status response should be equal 200', function (done) {
            http.get('http://127.0.0.1:8080', function (response) {
                  assert.equal(response.statusCode, 200);
                  done();
            });
       });
    });
});