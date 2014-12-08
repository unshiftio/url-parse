'use strict';

var required = require('requires-port')
  , lolcation = require('./lolcation')
  , qs = require('querystringify');

var keys = ',,protocol,username,password,host,hostname,port,pathname,query,hash'.split(',')
  , parts = keys.length;

/**
 * The actual URL instance. Instead of returning an object we've opted-in to
 * create an actual constructor as it's much more memory efficient and
 * faster and it pleases my CDO.
 *
 * @constructor
 * @param {String} address URL we want to parse.
 * @param {Boolean|function} parser Parser for the query string.
 * @param {Object} location Location defaults for relative paths.
 * @api public
 */
function URL(address, location, parser) {
  if (!(this instanceof URL)) {
    return new URL(address, location, parser);
  }

  //
  // Inline the massive regular expression because it causes issues in FireFox
  // because our `exec` usage in this function. Normally there should be no side
  // affects because we're not doing global matching so the lastIndex of regular
  // expression should stay the same but it's causing `too much recursion`
  // errors in FireFox when calling the parse method for a second time. Now,
  // with great pleasure I introduce to you:
  //
  // MOARE: Mother Of All Regular Expressions.
  //
  var regexp = /^(?:(?:(([^:\/#\?]+:)?(?:(?:\/\/)(?:(?:(?:([^:@\/#\?]+)(?:\:([^:@\/#\?]*))?)@)?(([^:\/#\?\]\[]+|\[[^\/\]@#?]+\])(?:\:([0-9]+))?))?)?)?((?:\/?(?:[^\/\?#]+\/+)*)(?:[^\?#]*)))?(\?[^#]+)?)(#.*)?/;

  //
  // The following if statements allows this module two have compatibility with
  // 2 different API:
  //
  // 1. Node.js's `url.parse` api which accepts a URL, boolean as arguments
  //    where the boolean indicates that the query string should also be parsed.
  //
  // 2. The `URL` interface of the browser which accepts a URL, object as
  //    arguments. The supplied object will be used as default values / fall-back
  //    for relative paths.
  //
  var type = typeof location;

  if ('object' !== type && 'string' !== type) {
    parser = location;
    location = null;
  }

  if (parser && 'function' !== typeof parser) {
    parser = qs.parse;
  }

  location = lolcation(location);

  for (var i = 0, bits = regexp.exec(address), key; i < parts; key = keys[++i]) {
    if (key) {
      this[key] = bits[i] || location[key] || '';

      //
      // The protocol, host, host name should always be lower cased even if they
      // are supplied in uppercase. This way, when people generate an `origin`
      // it be correct.
      //
      if (i === 2 || i === 5 || i === 6) this[key] = this[key].toLowerCase();
    }
  }

  //
  // Also parse the supplied query string in to an object. If we're supplied
  // with a custom parser as function use that instead of the default build-in
  // parser.
  //
  if (parser) this.query = parser(this.query);

  //
  // We should not add port numbers if they are already the default port number
  // for a given protocol. As the host also contains the port number we're going
  // override it with the hostname which contains no port number.
  //
  if (!required(this.port, this.protocol)) {
    this.host = this.hostname;
    this.port = '';
  }

  //
  // The href is just the compiled result.
  //
  this.href = this.toString();
}

/**
 * Transform the properties back in to a valid and full URL string.
 *
 * @param {Function} stringify Optional query stringify function.
 * @returns {String}
 * @api public
 */
URL.prototype.toString = function toString(stringify) {
  if (!stringify || 'function' !== typeof stringify) stringify = qs.stringify;

  var result = this.protocol +'//'
    , query;

  if (this.username) result += this.username +':'+ this.password +'@';

  result += this.hostname;
  if (this.port) result += ':'+ this.port;

  result += this.pathname;

  if (this.query) {
    if ('object' === typeof this.query) query = stringify(this.query);
    else query = this.query;

    result += (query.charAt(0) === '?' ? '' : '?') + query;
  }

  if (this.hash) result += this.hash;

  return result;
};

//
// Expose the URL parser and some additional properties that might be useful for
// others.
//
URL.qs = qs;
URL.location = lolcation;
module.exports = URL;
