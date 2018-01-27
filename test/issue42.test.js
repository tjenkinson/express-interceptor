var express = require('express');
var expect = require('unexpected')
.clone()
.installPlugin(require('unexpected-express'));

var interceptStatusCode;
var interceptorMiddleware = require('../')(function (req, res) {
  return {
    isInterceptable: function () {
      return true;
    },
    intercept: function (body, send) {
      interceptStatusCode = res.statusCode;
      send(body);
    }
  }
});

describe('issue 35', function () {
  before(function () {
    this.app = express()
    .use(interceptorMiddleware)
    .use(express.static('./public'));
    interceptStatusCode = undefined;
  });
  it('returns 200 when file exists', function () {
    return expect(this.app, 'to yield exchange', {
      request: '/test.txt',
      response: {
        statusCode: 200,
        body: 'testing123'
      }
    }).then(() => {
      expect(interceptStatusCode, 'to equal', 200);
    });
  });
  it('returns 404 when file does not exist', function () {
    return expect(this.app, 'to yield exchange', {
      request: '/nonexistent.txt',
      response: {
        statusCode: 404
      }
    }).then(() => {
      expect(interceptStatusCode, 'to equal', 404);
    });;
  });
});
