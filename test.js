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

    it('does inherit port numbers from relative urls', function () {
      var data = parse('/foo', parse('http://sub.example.com:808/'));

      assume(data.port).equals('808');
      assume(data.hostname).equals('sub.example.com');
      assume(data.host).equals('sub.example.com:808');
      assume(data.href).equals('http://sub.example.com:808/foo');
    });

    it('inherits protocol for relative protocols', function () {
      var data = parse('//foo.com/foo', parse('http://sub.example.com:808/'));

      assume(data.port).equals('');
      assume(data.host).equals('foo.com');
      assume(data.protocol).equals('http:');
      assume(data.href).equals('http://foo.com/foo');
    });

    it('does not inherit pathnames from the source', function () {
      var data = parse('http://localhost', parse('http://foo:bar@sub.example.com/bar?foo=bar#hash'));

      assume(data.port).equals('');
      assume(data.host).equals('localhost');
      assume(data.href).equals('http://localhost');
    });

    it('does not inherit hashes and query strings from source object', function () {
      var data = parse('/foo', parse('http://sub.example.com/bar?foo=bar#hash'));

      assume(data.port).equals('');
      assume(data.host).equals('sub.example.com');
      assume(data.href).equals('http://sub.example.com/foo');
    });

    it('does not inherit auth from source object', function () {
      var data = parse('/foo', parse('http://foo:bar@sub.example.com'));

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

    it('only sets port when its not default', function () {
      var data = parse('http://google.com/foo');

      assume(data.set('port', 80)).equals(data);

      assume(data.host).equals('google.com');
      assume(data.href).equals('http://google.com/foo');

      assume(data.set('port', 443)).equals(data);
      assume(data.host).equals('google.com:443');
      assume(data.href).equals('http://google.com:443/foo');
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

    it('updates the port when updating host', function () {
      var data = parse('http://google.com/?foo=bar');

      assume(data.set('host', 'yahoo.com:808')).equals(data);

      assume(data.hostname).equals('yahoo.com');
      assume(data.host).equals('yahoo.com:808');
      assume(data.port).equals('808');

      assume(data.href).equals('http://yahoo.com:808/?foo=bar');
    });

    it('updates the host when updating hostname', function () {
      var data = parse('http://google.com:808/?foo=bar');

      assume(data.set('hostname', 'yahoo.com')).equals(data);

      assume(data.hostname).equals('yahoo.com');
      assume(data.host).equals('yahoo.com:808');
      assume(data.port).equals('808');

      assume(data.href).equals('http://yahoo.com:808/?foo=bar');
    });

    it('updates other values', function () {
      var data = parse('http://google.com/?foo=bar');

      assume(data.set('protocol', 'https:')).equals(data);
      assume(data.protocol).equals('https:');

      assume(data.href).equals('https://google.com/?foo=bar');
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
