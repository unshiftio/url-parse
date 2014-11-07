describe('url-parse', function () {
  'use strict';

  var assume = require('assume')
    , parse = require('./');

  it('exposes parse as a function', function () {
    assume(parse).is.a('function');
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
