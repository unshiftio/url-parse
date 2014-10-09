describe('url-parse', function () {
  'use strict';

  var assume = require('assume')
    , parse = require('./')
    , qs = parse.querystring
    , qsify = parse.querystringify;

  it('exposes parse as a function', function () {
    assume(parse).is.a('function');
  });

  describe('#querystringify', function () {
    var obj = {
      foo: 'bar',
      bar: 'foo'
    };

    it('is exposed as method', function () {
      assume(qsify).is.a('function');
    });

    it('transforms an object', function () {
      assume(qsify(obj)).equals('foo=bar&bar=foo');
    });

    it('can optionally prefix', function () {
      assume(qsify(obj, true)).equals('?foo=bar&bar=foo');
    });

    it('can prefix with custom things', function () {
      assume(qsify(obj, '&')).equals('&foo=bar&bar=foo');
    });
  });

  describe('querystring', function () {
    it('is exposed as method', function () {
      assume(qs).is.a('function');
    });

    it('will parse a querystring to an object', function () {
      var obj = qs('foo=bar');

      assume(obj).is.a('object');
      assume(obj.foo).equals('bar');
    });

    it('will parse the `query` property of the parse', function () {
      var url = parse('https://google.com?foo=bar')
        , obj = qs(url.query);

      assume(obj).is.a('object');
      assume(obj.foo).equals('bar');
    });

    it('will also work if querystring is prefixed with ?', function () {
      var obj = qs('?foo=bar&shizzle=mynizzle');

      assume(obj).is.a('object');
      assume(obj.foo).equals('bar');
      assume(obj.shizzle).equals('mynizzle');
    });
  });
});
