describe('url-parse', function () {
  'use strict';

  var assume = require('assume')
    , parse = require('../');

  it('exposes parse as a function', function () {
    assume(parse).is.a('function');
  });

  it('exposes the querystring module', function () {
    assume(parse.qs).equals(require('querystringify'));
  });

  it('exposes the location function', function () {
    assume(parse.location).is.a('function');
  });

  it('exposes the extractProtocol function', function () {
    assume(parse.extractProtocol).is.a('function');
  });

  it('defaults to empty address to return valid URL instance', function () {
    var url = parse();

    assume(url).to.be.an('object');
    assume(url.pathname).to.be.a('string');
    assume(url.host).to.be.a('string');
    assume(url.hostname).to.be.a('string');
  });

  describe('extractProtocol', function () {
    it('extracts the protocol data', function () {
      assume(parse.extractProtocol('')).eql({
        slashes: false,
        protocol: '',
        rest: ''
      });
    });

    it('does not truncate the input string', function () {
      var input = 'foo\nbar\rbaz\u2028qux\u2029';

      assume(parse.extractProtocol(input)).eql({
        slashes: false,
        protocol: '',
        rest: input
      });
    });
  });

  it('parses the query string into an object', function () {
    var url = 'http://google.com/?foo=bar'
      , data = parse(url, true);

    assume(data.query).is.a('object');
    assume(data.query.foo).equals('bar');

    url = 'http://google.com/';
    data = parse(url, true);

    assume(data.query).is.a('object');
    assume(data.query).is.empty();
  });

  it('does not add question mark to href if query string is empty', function () {
    var url = 'http://google.com/'
      , data = parse(url, true);

    assume(data.href).equals(url);
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
    var blob = {
      'href': 'blob:https%3A//gist.github.com/3f272586-6dac-4e29-92d0-f674f2dde618',
      'pathname': 'https%3A//gist.github.com/3f272586-6dac-4e29-92d0-f674f2dde618',
      'origin': 'https://gist.github.com',
      'protocol': 'blob:',
      'hostname': '',
      'search': '',
      'hash': '',
      'host': '',
      'port': ''
    };

    var url = '/unshiftio/url-parse'
      , data = parse(url, blob);

    assume(data.href).equals('https://gist.github.com/unshiftio/url-parse');
  });

  it('can parse complex urls multiple times without errors', function () {
    var url = 'https://www.mozilla.org/en-US/firefox/34.0/whatsnew/?oldversion=33.1';

    for (var i = 0; i < 100; i++) {
      parse(url);
    }
  });

  it('converts hostname to lowercase', function () {
    var url = 'HTTP://fOo.eXaMPle.com';

    assume(parse(url).hostname).equals('foo.example.com');
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

  it('understands an / as pathname', function () {
    var url = 'http://example.com:80/'
      , parsed = parse(url);

    assume(parsed.port).equals('');
    assume(parsed.username).equals('');
    assume(parsed.password).equals('');
    assume(parsed.pathname).equals('/');
    assume(parsed.host).equals('example.com');
    assume(parsed.hostname).equals('example.com');
    assume(parsed.href).equals('http://example.com/');
  });

  it('does not care about spaces', function () {
    var url = 'http://x.com/path?that\'s#all, folks'
      , parsed = parse(url);

    assume(parsed.port).equals('');
    assume(parsed.username).equals('');
    assume(parsed.password).equals('');
    assume(parsed.pathname).equals('/path');
    assume(parsed.hash).equal('#all, folks');
    assume(parsed.query).equal('?that\'s');
    assume(parsed.host).equals('x.com');
    assume(parsed.hostname).equals('x.com');
  });

  it('accepts + in the url', function () {
    var url = 'http://x.y.com+a/b/c'
      , parsed = parse(url);

    assume(parsed.protocol).equals('http:');
    assume(parsed.host).equals('x.y.com+a');
    assume(parsed.hostname).equals('x.y.com+a');
    assume(parsed.pathname).equals('/b/c');
  });

  describe('origin', function () {
    it('generates an origin property', function () {
      var url = 'http://google.com:80/pathname'
        , parsed = parse(url);

      assume(parsed.origin).equals('http://google.com');
    });

    it('is lowercased', function () {
      var url = 'HTTP://gOogle.cOm:80/pathname'
        , parsed = parse(url);

      assume(parsed.origin).equals('http://google.com');
    });

    it('sets null if no hostname is specified', function () {
      var url = 'http://'
        , parsed = parse(url, {});

      assume(parsed.origin).equals('null');
    });

    it('removes default ports for http', function () {
      var o = parse('http://google.com:80/pathname');
      assume(o.origin).equals('http://google.com');

      o = parse('http://google.com:80');
      assume(o.origin).equals('http://google.com');

      o = parse('http://google.com');
      assume(o.origin).equals('http://google.com');

      o = parse('https://google.com:443/pathname');
      assume(o.origin).equals('https://google.com');

      o = parse('http://google.com:443/pathname');
      assume(o.origin).equals('http://google.com:443');

      o = parse('https://google.com:80/pathname');
      assume(o.origin).equals('https://google.com:80');
    });

    it('handles file:// based urls as null', function () {
      var o = parse('file://google.com/pathname');
      assume(o.origin).equals('null');
    });

    it('removes default ports for ws', function () {
      var o = parse('ws://google.com:80/pathname');
      assume(o.origin).equals('ws://google.com');

      o = parse('wss://google.com:443/pathname');
      assume(o.origin).equals('wss://google.com');

      o = parse('ws://google.com:443/pathname');
      assume(o.origin).equals('ws://google.com:443');

      o = parse('wss://google.com:80/pathname');
      assume(o.origin).equals('wss://google.com:80');
    });
  });

  describe('protocol', function () {
    it('extracts the right protocol from a url', function () {
      var testData = [
        {
          href: 'http://example.com',
          protocol: 'http:',
          pathname: ''
        },
        {
          href: 'mailto:test@example.com',
          pathname: 'test@example.com',
          protocol: 'mailto:'
        },
        {
          href: 'data:text/html,%3Ch1%3EHello%2C%20World!%3C%2Fh1%3E',
          pathname: 'text/html,%3Ch1%3EHello%2C%20World!%3C%2Fh1%3E',
          protocol: 'data:'
        },
        {
          href: 'sip:alice@atlanta.com',
          pathname: 'alice@atlanta.com',
          protocol: 'sip:'
        }
      ];

      var data;
      for (var i = 0, len = testData.length; i < len; ++i) {
        data = parse(testData[i].href);
        assume(data.protocol).equals(testData[i].protocol);
        assume(data.pathname).equals(testData[i].pathname);
      }
    });

    it('converts protocol to lowercase', function () {
      var url = 'HTTP://example.com';

      assume(parse(url).protocol).equals('http:');
    });

    it('correctly adds ":" to protocol in final url string', function () {
      var data = parse('google.com/foo', {});
      data.set('protocol', 'https');
      assume(data.href).equals('https://google.com/foo');

      data = parse('https://google.com/foo');
      data.protocol = 'http';
      assume(data.toString()).equals('http://google.com/foo');

      data = parse('http://google.com/foo');
      data.set('protocol', 'https:');
      assume(data.href).equals('https://google.com/foo');
    });
  });

  describe('ip', function () {
    it('parses ipv6', function () {
      var url = 'http://[1080:0:0:0:8:800:200C:417A]:61616/foo/bar?q=z'
        , parsed = parse(url);

      assume(parsed.port).equals('61616');
      assume(parsed.query).equals('?q=z');
      assume(parsed.protocol).equals('http:');
      assume(parsed.hostname).equals('[1080:0:0:0:8:800:200c:417a]');
      assume(parsed.pathname).equals('/foo/bar');
      assume(parsed.href).equals('http://[1080:0:0:0:8:800:200c:417a]:61616/foo/bar?q=z');
    });

    it('parses ipv6 with auth', function () {
      var url = 'http://user:password@[3ffe:2a00:100:7031::1]:8080'
        , parsed = parse(url);

      assume(parsed.username).equals('user');
      assume(parsed.password).equals('password');
      assume(parsed.host).equals('[3ffe:2a00:100:7031::1]:8080');
      assume(parsed.hostname).equals('[3ffe:2a00:100:7031::1]');
      assume(parsed.href).equals(url);
    });

    it('parses ipv4', function () {
      var url = 'http://222.148.142.13:61616/foo/bar?q=z'
        , parsed = parse(url);

      assume(parsed.port).equals('61616');
      assume(parsed.query).equals('?q=z');
      assume(parsed.protocol).equals('http:');
      assume(parsed.hostname).equals('222.148.142.13');
      assume(parsed.pathname).equals('/foo/bar');
      assume(parsed.href).equals(url);
    });
  });

  describe('auth', function () {
    it('does not lowercase the USER:PASS', function () {
      var url = 'HTTP://USER:PASS@EXAMPLE.COM'
        , parsed = parse(url);

      assume(parsed.username).equals('USER');
      assume(parsed.password).equals('PASS');
      assume(parsed.protocol).equals('http:');
      assume(parsed.host).equals('example.com');
      assume(parsed.hostname).equals('example.com');
    });

    it('accepts @ in pathnames', function () {
      var url = 'http://mt0.google.com/vt/lyrs=m@114&hl=en&src=api&x=2&y=2&z=3&s='
        , parsed = parse(url);

      assume(parsed.pathname).equals('/vt/lyrs=m@114&hl=en&src=api&x=2&y=2&z=3&s=');
      assume(parsed.username).equals('');
      assume(parsed.password).equals('');
    });

    it('does not require passwords for auth', function () {
      var url = 'http://user@www.example.com/'
        , parsed = parse(url);

      assume(parsed.password).equals('');
      assume(parsed.pathname).equals('/');
      assume(parsed.username).equals('user');
      assume(parsed.protocol).equals('http:');
      assume(parsed.hostname).equals('www.example.com');
      assume(parsed.href).equals(url);
    });
  });

  it('accepts multiple ???', function () {
    var url = 'http://mt0.google.com/vt/lyrs=m@114???&hl=en&src=api&x=2&y=2&z=3&s=';
    assume(parse(url).query).equals('???&hl=en&src=api&x=2&y=2&z=3&s=');
  });

  it('accepts a string as source argument', function () {
    var data = parse('/foo', 'http://sub.example.com/bar?foo=bar#hash');

    assume(data.port).equals('');
    assume(data.host).equals('sub.example.com');
    assume(data.href).equals('http://sub.example.com/foo');
  });

  describe('inheritance', function () {
    it('does not inherit port numbers for non relative urls', function () {
      var data = parse('http://localhost', parse('http://sub.example.com:808/'));

      assume(data.port).equals('');
      assume(data.host).equals('localhost');
      assume(data.href).equals('http://localhost');
    });

    it('inherits port numbers for relative urls', function () {
      var data = parse('/foo', parse('http://sub.example.com:808/'));

      assume(data.port).equals('808');
      assume(data.hostname).equals('sub.example.com');
      assume(data.host).equals('sub.example.com:808');
      assume(data.href).equals('http://sub.example.com:808/foo');
    });

    it('inherits slashes for relative urls', function () {
      var data = parse('/foo', {
        hash: '',
        host: 'example.com',
        hostname: 'example.com',
        href: 'http://example.com/',
        origin: 'http://example.com',
        password: '',
        pathname: '/',
        port: '',
        protocol: 'http:',
        search: ''
      });

      assume(data.slashes).equals(true);
      assume(data.href).equals('http://example.com/foo');

      data = parse('/foo', {
        auth: null,
        hash: null,
        host: 'example.com',
        hostname: 'example.com',
        href: 'http://example.com/',
        path: '/',
        pathname: '/',
        port: null,
        protocol: 'http:',
        query: null,
        search: null,
        slashes: true
      });

      assume(data.slashes).equals(true);
      assume(data.href).equals('http://example.com/foo');
    });

    it('inherits protocol for relative protocols', function () {
      var data = parse('//foo.com/foo', parse('http://sub.example.com:808/'));

      assume(data.port).equals('');
      assume(data.host).equals('foo.com');
      assume(data.protocol).equals('http:');
      assume(data.href).equals('http://foo.com/foo');
    });

    it('does not inherit pathname for non relative urls', function () {
      var data = parse('http://localhost', parse('http://foo:bar@sub.example.com/bar?foo=bar#hash'));

      assume(data.port).equals('');
      assume(data.host).equals('localhost');
      assume(data.href).equals('http://localhost');
    });

    it('resolves pathname for relative urls', function () {
      var data, i = 0;
      var tests = [
        ['', 'http://foo.com', ''],
        ['', 'http://foo.com/', '/'],
        ['a', 'http://foo.com', '/a'],
        ['a/', 'http://foo.com', '/a/'],
        ['b/c', 'http://foo.com/a', '/b/c'],
        ['b/c', 'http://foo.com/a/', '/a/b/c'],
        ['.', 'http://foo.com', '/'],
        ['./', 'http://foo.com', '/'],
        ['./.', 'http://foo.com', '/'],
        ['.', 'http://foo.com/a', '/'],
        ['.', 'http://foo.com/a/', '/a/'],
        ['./', 'http://foo.com/a/', '/a/'],
        ['./.', 'http://foo.com/a/', '/a/'],
        ['./b', 'http://foo.com/a/', '/a/b'],
        ['..', 'http://foo.com', '/'],
        ['../', 'http://foo.com', '/'],
        ['../..', 'http://foo.com', '/'],
        ['..', 'http://foo.com/a/b', '/'],
        ['..', 'http://foo.com/a/b/', '/a/'],
        ['../..', 'http://foo.com/a/b', '/'],
        ['../..', 'http://foo.com/a/b/', '/'],
        ['../../../../c', 'http://foo.com/a/b/', '/c'],
        ['./../d', 'http://foo.com/a/b/c', '/a/d'],
        ['d/e/f/./../../g', 'http://foo.com/a/b/c', '/a/b/d/g']
      ];

      for (; i < tests.length; i++) {
        data = parse(tests[i][0], tests[i][1]);
        assume(data.pathname).equals(tests[i][2]);
      }
    });

    it('does not inherit hashes and query strings from source object', function () {
      var data = parse('/foo', parse('http://sub.example.com/bar?foo=bar#hash'));

      assume(data.port).equals('');
      assume(data.host).equals('sub.example.com');
      assume(data.href).equals('http://sub.example.com/foo');
    });

    it('does not inherit auth from source object', function () {
      var base = parse('http://foo:bar@sub.example.com')
        , data = parse('/foo', base);

      assume(data.port).equals('');
      assume(data.username).equals('');
      assume(data.password).equals('');
      assume(data.host).equals('sub.example.com');
      assume(data.href).equals('http://sub.example.com/foo');
    });
  });

  describe('#set', function () {
    it('correctly updates the host when setting port', function () {
      var data = parse('http://google.com/foo');

      assume(data.set('port', 8080)).equals(data);

      assume(data.host).equals('google.com:8080');
      assume(data.href).equals('http://google.com:8080/foo');
    });

    it('correctly updates the host when setting port (IPv6)', function () {
      var data = parse('http://[7886:3423::1233]/foo');

      assume(data.set('port', 8080)).equals(data);

      assume(data.host).equals('[7886:3423::1233]:8080');
      assume(data.href).equals('http://[7886:3423::1233]:8080/foo');
    });

    it('removes querystring and hash', function () {
      var data = parse('https://thisanurl.com/?swag=yolo#representing');

      data.set('query', '');
      data.set('hash', '');

      assume(data.href).equals('https://thisanurl.com/');
    });

    it('only sets port when its not default', function () {
      var data = parse('http://google.com/foo');

      assume(data.set('port', 80)).equals(data);

      assume(data.host).equals('google.com');
      assume(data.href).equals('http://google.com/foo');

      assume(data.set('port', 443)).equals(data);
      assume(data.host).equals('google.com:443');
      assume(data.href).equals('http://google.com:443/foo');
    });

    it('only sets port when its not default (IPv6)', function () {
      var data = parse('http://[7886:3423::1233]/foo');

      assume(data.set('port', 80)).equals(data);

      assume(data.host).equals('[7886:3423::1233]');
      assume(data.href).equals('http://[7886:3423::1233]/foo');

      assume(data.set('port', 443)).equals(data);
      assume(data.host).equals('[7886:3423::1233]:443');
      assume(data.href).equals('http://[7886:3423::1233]:443/foo');
    });

    it('prepends / to pathname', function () {
      var url = parse();

      url
        .set('protocol', 'http')
        .set('host', 'example.com:80')
        .set('pathname', 'will/get/slash/prepended');

      assume(url.pathname).equals('/will/get/slash/prepended');
      assume(url.href).equals('http://example.com:80/will/get/slash/prepended');

      url.set('pathname', '');

      assume(url.pathname).equals('');
      assume(url.href).equals('http://example.com:80');

      url.set('pathname', '/has/slash');

      assume(url.pathname).equals('/has/slash');
      assume(url.href).equals('http://example.com:80/has/slash');
    });

    it('updates query with object', function () {
      var data = parse('http://google.com/?foo=bar');

      assume(data.set('query', { bar: 'foo' })).equals(data);

      assume(data.query.foo).equals(undefined);
      assume(data.query.bar).equals('foo');

      assume(data.href).equals('http://google.com/?bar=foo');
    });

    it('updates query with a string', function () {
      var data = parse('http://google.com/?foo=bar');

      assume(data.set('query', 'bar=foo')).equals(data);

      assume(data.query.foo).equals(undefined);
      assume(data.query.bar).equals('foo');

      assume(data.href).equals('http://google.com/?bar=foo');

      assume(data.set('query', '?baz=foo')).equals(data);

      assume(data.query.bar).equals(undefined);
      assume(data.query.baz).equals('foo');

      assume(data.href).equals('http://google.com/?baz=foo');
    });

    it('allows custom parser when updating query', function() {
      var data = parse('http://google.com/?foo=bar');

      assume(data.set('query', 'bar=foo', function () { return '1337'; })).equals(data);

      assume(data.query).equals('1337');

      assume(data.href).equals('http://google.com/?1337');
    });

    it('throws error when updating query, if custom parser is not a function', function() {
      var data = parse('http://google.com/?foo=bar');

      assume(function () {
        data.set('query', 'bar=foo', '1337');
      }).throws(Error);

      //
      // `data` is unchanged.
      //
      assume(data.href).equals('http://google.com/?foo=bar');
    });

    it('prepends # to hash', function () {
      var data = parse('http://example.com');

      data.set('hash', 'usage');

      assume(data.hash).equals('#usage');
      assume(data.href).equals('http://example.com#usage');

      data.set('hash', '#license');

      assume(data.hash).equals('#license');
      assume(data.href).equals('http://example.com#license');
    });

    it('updates the port when updating host', function () {
      var data = parse('http://google.com/?foo=bar');

      assume(data.set('host', 'yahoo.com:808')).equals(data);

      assume(data.hostname).equals('yahoo.com');
      assume(data.host).equals('yahoo.com:808');
      assume(data.port).equals('808');

      assume(data.href).equals('http://yahoo.com:808/?foo=bar');
    });

    it('updates the port when updating host (IPv6)', function () {
      var data = parse('http://google.com/?foo=bar');

      assume(data.set('host', '[56h7::1]:808')).equals(data);

      assume(data.hostname).equals('[56h7::1]');
      assume(data.host).equals('[56h7::1]:808');
      assume(data.port).equals('808');

      assume(data.href).equals('http://[56h7::1]:808/?foo=bar');
    });

    it('unsets the port when port is missing (IPv6)', function () {
      var data = parse('http://google.com/?foo=bar');

      assume(data.set('host', '[56h7::1]')).equals(data);

      assume(data.hostname).equals('[56h7::1]');
      assume(data.host).equals('[56h7::1]');
      assume(data.port).equals('');

      assume(data.href).equals('http://[56h7::1]/?foo=bar');
    });

    it('unsets the port when the port is missing from host', function () {
      var data = parse('http://google.com:8000/?foo=bar');

      assume(data.set('host', 'yahoo.com')).equals(data);

      assume(data.hostname).equals('yahoo.com');
      assume(data.host).equals('yahoo.com');
      assume(data.port).equals('');

      assume(data.href).equals('http://yahoo.com/?foo=bar');
    });

    it('updates the host when updating hostname', function () {
      var data = parse('http://google.com:808/?foo=bar');

      assume(data.set('hostname', 'yahoo.com')).equals(data);

      assume(data.hostname).equals('yahoo.com');
      assume(data.host).equals('yahoo.com:808');
      assume(data.port).equals('808');

      assume(data.href).equals('http://yahoo.com:808/?foo=bar');
    });

    it('updates slashes when updating protocol', function() {
      var data = parse('sip:alice@atlanta.com');

      assume(data.set('protocol', 'https')).equals(data);

      assume(data.href).equals('https://alice@atlanta.com');

      assume(data.set('protocol', 'mailto', true)).equals(data);

      assume(data.href).equals('mailto:alice@atlanta.com');
    });

    it('updates other values', function () {
      var data = parse('http://google.com/?foo=bar');

      assume(data.set('protocol', 'https:')).equals(data);
      assume(data.protocol).equals('https:');
      assume(data.href).equals('https://google.com/?foo=bar');

      data.set('username', 'foo');

      assume(data.username).equals('foo');
      assume(data.href).equals('https://foo@google.com/?foo=bar');
    });

    it('lowercases the required values', function () {
      var data = parse('http://google.com/?foo=bar');

      data.set('protocol', 'HTTPS:');
      assume(data.protocol).equals('https:');
      assume(data.href).equals('https://google.com/?foo=bar');

      data.set('host', 'GOOGLE.LOL');
      assume(data.host).equals('google.lol');
      assume(data.href).equals('https://google.lol/?foo=bar');

      data.set('hostname', 'YAhOo.COm');
      assume(data.hostname).equals('yahoo.com');
      assume(data.href).equals('https://yahoo.com/?foo=bar');
    });

    it('correctly updates the origin when host/protocol/port changes', function () {
      var data = parse('http://google.com/?foo=bar');

      data.set('protocol', 'HTTPS:');
      assume(data.protocol).equals('https:');
      assume(data.origin).equals('https://google.com');

      data.set('port', '1337');
      assume(data.port).equals('1337');
      assume(data.origin).equals('https://google.com:1337');

      data.set('protocol', 'file:');
      assume(data.protocol).equals('file:');
      assume(data.origin).equals('null');
    });
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
