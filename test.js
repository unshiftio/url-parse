describe('url-parse', function () {
  'use strict';

  var assume = require('assume')
    , parse = require('./');

  it('exposes parse as a function', function () {
    assume(parse).is.a('function');
  });

  it('parses an url', function () {
    var res = parse('https://user:pass@sub.subdomain.example.com:808/path/?query=string&more=ok#hash');

    assume(res).is.a('object');
    assume(res.auth).equals('user:pass');
    assume(res.hash).equals('#hash');
    assume(res.host).equals('sub.subdomain.example.com:808');
    assume(res.hostname).equals('sub.subdomain.example.com');
    assume(res.path).equals('/path/?query=string&more=ok');
    assume(res.pathname).equals('/path/');
    assume(res.protocol).equals('https:');
    assume(res.query).equals('query=string&more=ok');
    assume(res.search).equals('?query=string&more=ok');
  });

  it('parses the query string when the qs boolean is supplied', function () {
    var res = parse('http://example.com/?foo=bar', true);

    assume(res.query).is.a('object');
    assume(res.query.foo).equals('bar');
  });

  it('correctly extracts the protocol', function () {
    var res = parse('http://example.com');
    assume(res.protocol).equals('http:');

    res = parse('https://example.com');
    assume(res.protocol).equals('https:');

    res = parse('file://example.com');
    assume(res.protocol).equals('file:');
  });

  it('has the same href as the one we supplied', function () {
    var href = 'https://subdomain.example.org/path/?query=string#hash'
      , res = parse(href);

    assume(res.href).equals(href);
  });
});
