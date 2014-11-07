describe('url-parse', function () {
  'use strict';

  var assume = require('assume')
    , parse = require('./');

  it('exposes parse as a function', function () {
    assume(parse).is.a('function');
  });

  it('converts protocol to lowercase', function () {
    var url = 'HTTP://example.com';

    assume(parse(url).protocol).equals('http:');
  });

  it('converts hostname to lowercase', function () {
    var url = 'HTTP://fOo.eXaMPle.com';

    assume(parse(url).hostname).equals('foo.example.com');
  });

  it('does not lowercase the USER:PASS', function () {
    var url = 'HTTP://USER:PASS@EXAMPLE.COM';

    assume(parse(url).username).equals('USER');
    assume(parse(url).password).equals('PASS');
  });

  it('does not lowercase the path', function () {
    var url = 'HTTP://X.COM/Y/Z';

    assume(parse(url).pathname).equals('/Y/Z');
  });

  it('removes default port numbers', function () {
    var url = 'http://example.com:80';

    assume(parse(url).port).equals('');
    assume(parse(url).href).equals('http://example.com');
  });

  it('accepts @ in pathnames', function () {
    var url = 'http://mt0.google.com/vt/lyrs=m@114&hl=en&src=api&x=2&y=2&z=3&s=';

    assume(parse(url).pathname).equals('/vt/lyrs=m@114&hl=en&src=api&x=2&y=2&z=3&s=');
  });

  it('accepts multiple ???', function () {
    var url = 'http://mt0.google.com/vt/lyrs=m@114???&hl=en&src=api&x=2&y=2&z=3&s=';
    assume(parse(url).query).equals('???&hl=en&src=api&x=2&y=2&z=3&s=');
  });

  describe('fuzzy', function () {
    var fuzz = require('./fuzzy')
      , times = 10;

    for (var i = 0; i < times; i++) {
      (function (spec) {
        it('parses: '+ spec.href, function () {
          var url = parse(spec.href)
            , prop;

          for (prop in spec) {
            assume(url[prop]).equals(spec[prop]);
          }
        });
      })(fuzz());
    }
  });
});
