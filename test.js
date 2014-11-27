describe('url-parse', function () {
  'use strict';

  var assume = require('assume')
    , parse = require('./');

  it('exposes parse as a function', function () {
    assume(parse).is.a('function');
  });

  it('exposes the querystring module', function () {
    assume(parse.qs).equals(require('querystringify'));
  });

  it('exposes the location function', function () {
    assume(parse.location).equals(require('./lolcation'));
  });

  it('parsers the query string', function () {
    var url = 'http://google.com/?foo=bar'
      , data = parse(url, true);

    assume(data.query).is.a('object');
    assume(data.query.foo).equals('bar');
  });

  it('allows a custom function as parser', function () {
    var url = 'http://google.com/?foo=bar'
      , data = parse(url, function () { return '1337'; });

    assume(data.query).equals('1337');
  });

  it('allows a custom stringify function', function () {
    var url = 'http://google.com/?foo=bar'
      , data = parse(url, true)
      , str;

    str = data.toString(function () { return 'lolcakes'; });
    assume(str).equals('http://google.com/?lolcakes');
  });

  it('allows a custom location object', function () {
    var url = '/foo?foo=bar'
      , data = parse(url, parse('http://google.com'));

    assume(data.href).equals('http://google.com/foo?foo=bar');
  });

  it('is blob: location aware', function () {
    var blob = {"hash":"","search":"","pathname":"https%3A//gist.github.com/3f272586-6dac-4e29-92d0-f674f2dde618","port":"","hostname":"","host":"","protocol":"blob:","origin":"https://gist.github.com","href":"blob:https%3A//gist.github.com/3f272586-6dac-4e29-92d0-f674f2dde618"}
      , url = '/unshiftio/url-parse'
      , data = parse(url, blob);

    assume(data.href).equals('https://gist.github.com/unshiftio/url-parse');
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
    var url = 'http://example.com:80'
      , parsed = parse(url);

    assume(parsed.port).equals('');
    assume(parsed.host).equals('example.com');
    assume(parsed.hostname).equals('example.com');
    assume(parsed.href).equals('http://example.com');
  });

  it('accepts @ in pathnames', function () {
    var url = 'http://mt0.google.com/vt/lyrs=m@114&hl=en&src=api&x=2&y=2&z=3&s=';

    assume(parse(url).pathname).equals('/vt/lyrs=m@114&hl=en&src=api&x=2&y=2&z=3&s=');
  });

  it('accepts multiple ???', function () {
    var url = 'http://mt0.google.com/vt/lyrs=m@114???&hl=en&src=api&x=2&y=2&z=3&s=';
    assume(parse(url).query).equals('???&hl=en&src=api&x=2&y=2&z=3&s=');
  });

  it('does not inherit hashes and query strings from source object', function () {
    var data = parse('/foo', parse('http://foo:bar@sub.example.com/bar?foo=bar#hash'));

    assume(data.port).equals('');
    assume(data.username).equals('foo');
    assume(data.password).equals('bar');
    assume(data.host).equals('sub.example.com');
    assume(data.href).equals('http://foo:bar@sub.example.com/foo');
  });

  it('accepts a string as source argument', function () {
    var data = parse('/foo', 'http://foo:bar@sub.example.com/bar?foo=bar#hash');

    assume(data.port).equals('');
    assume(data.username).equals('foo');
    assume(data.password).equals('bar');
    assume(data.host).equals('sub.example.com');
    assume(data.href).equals('http://foo:bar@sub.example.com/foo');
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
