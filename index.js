'use strict';

var required = require('requires-port')
  , lolcation = require('./lolcation')
  , qs = require('querystringify');

var keys = ',,protocol,username,password,host,hostname,port,pathname,query,hash'.split(',')
  , inherit = { protocol: 1, host: 1, hostname: 1 }
  , relativere = /^\/(?!\/)/
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
  // Story time children:
  //
  // FireFox 34 has some problems with their Regular Expression engine and
  // executing a RegExp can cause a `too much recursion` error. We initially fixed
  // this by moving the Regular Expression in the URL constructor so it's created
  // every single time. This fixed it for some URL's but the more complex the
  // URL's get the easier it is to trigger. Complexer URL like:
  //
  //   https://www.mozilla.org/en-US/firefox/34.0/whatsnew/?oldversion=33.1
  //
  // Still triggered the recursion error. After talking with Chrome and FireFox
  // engineers it seemed to be caused by:
  //
  //   https://code.google.com/p/v8/issues/detail?id=430
  //
  // As FireFox started using Chrome's RegExp engine. After testing various of
  // workarounds I finally stumbled upon this gem, use new RegExp as it sometimes
  // behaves different then a RegExp literal. The biggest problem with this
  // FireFox problem is that it's super hard to reproduce as our "normal" test
  // suite doesn't catch it. The only way to reproduce it was run the parser in
  // jsperf.com (uses the benchmark module from npm) and supply it the URL
  // mentioned above as URL to parse.
  //
  // Steps for compiling the new RegExp:
  //
  // 1. Take the regular RegExp as seen below.
  // 2. Escape the RegExp using XRegExp.escape from http://xregexp.com/tests/
  // 3. ??
  // 4. Profit.
  //
  // RegExp source: /^(?:(?:(([^:\/#\?]+:)?(?:(?:\/\/)(?:(?:(?:([^:@\/#\?]+)(?:\:([^:@\/#\?]*))?)@)?(([^:\/#\?\]\[]+|\[[^\/\]@#?]+\])(?:\:([0-9]+))?))?)?)?((?:\/?(?:[^\/\?#]+\/+)*)(?:[^\?#]*)))?(\?[^#]+)?)(#.*)?/
  //
  var regexp = new RegExp('\^\(\?:\(\?:\(\(\[\^:\\/\#\\\?\]\+:\)\?\(\?:\(\?:\\/\\/\)\(\?:\(\?:\(\?:\(\[\^:@\\/\#\\\?\]\+\)\(\?:\\:\(\[\^:@\\/\#\\\?\]\*\)\)\?\)@\)\?\(\(\[\^:\\/\#\\\?\\\]\\\[\]\+\|\\\[\[\^\\/\\\]@\#\?\]\+\\\]\)\(\?:\\:\(\[0\-9\]\+\)\)\?\)\)\?\)\?\)\?\(\(\?:\\/\?\(\?:\[\^\\/\\\?\#\]\+\\/\+\)\*\)\(\?:\[\^\\\?\#\]\*\)\)\)\?\(\\\?\[\^\#\]\+\)\?\)\(\#\.\*\)\?')
    , relative = relativere.test(address)
    , bits = regexp.exec(address)
    , type = typeof location
    , url = this
    , i = 0
    , key;

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
  if ('object' !== type && 'string' !== type) {
    parser = location;
    location = null;
  }

  if (parser && 'function' !== typeof parser) {
    parser = qs.parse;
  }

  location = lolcation(location);

  for (; i < parts; key = keys[++i]) {
    if (!key) continue;

    url[key] = bits[i] || (key in inherit || ('port' === key && relative) ? location[key] || '' : '');

    //
    // The protocol, host, host name should always be lower cased even if they
    // are supplied in uppercase. This way, when people generate an `origin`
    // it be correct.
    //
    if (i === 2 || i === 5 || i === 6) url[key] = url[key].toLowerCase();
  }

  //
  // Also parse the supplied query string in to an object. If we're supplied
  // with a custom parser as function use that instead of the default build-in
  // parser.
  //
  if (parser) url.query = parser(url.query);

  //
  // We should not add port numbers if they are already the default port number
  // for a given protocol. As the host also contains the port number we're going
  // override it with the hostname which contains no port number.
  //
  if (!required(url.port, url.protocol)) {
    url.host = url.hostname;
    url.port = '';
  }

  //
  // The href is just the compiled result.
  //
  url.href = url.toString();
}

/**
 * This is convenience method for changing properties in the URL instance to
 * insure that they all propagate correctly.
 *
 * @param {String} prop Property we need to adjust.
 * @param {Mixed} value The newly assigned value.
 * @returns {URL}
 * @api public
 */
URL.prototype.set = function set(part, value, fn) {
  var url = this;

  if ('query' === part) {
    if ('string' === typeof value) value = (fn || qs.parse)(value);
    url[part] = value;
  } else if ('port' === part) {
    url[part] = value;

    if (!required(value, url.protocol)) {
      url.host = url.hostname;
      url[part] = '';
    } else if (value) {
      url.host = url.hostname +':'+ value;
    }
  } else if ('hostname' === part) {
    url[part] = value;

    if (url.port) value += ':'+ url.port;
    url.host = value;
  } else if ('host' === part) {
    url[part] = value;

    if (/\:\d+/.test(value)) {
      value = value.split(':');
      url.hostname = value[0];
      url.port = value[1];
    }
  } else {
    url[part] = value;
  }

  url.href = url.toString();
  return url;
};

/**
 * Transform the properties back in to a valid and full URL string.
 *
 * @param {Function} stringify Optional query stringify function.
 * @returns {String}
 * @api public
 */
URL.prototype.toString = function toString(stringify) {
  if (!stringify || 'function' !== typeof stringify) stringify = qs.stringify;

  var query
    , url = this
    , result = url.protocol +'//';

  if (url.username) result += url.username +':'+ url.password +'@';

  result += url.hostname;
  if (url.port) result += ':'+ url.port;

  result += url.pathname;

  if (url.query) {
    if ('object' === typeof url.query) query = stringify(url.query);
    else query = url.query;

    result += (query.charAt(0) === '?' ? '' : '?') + query;
  }

  if (url.hash) result += url.hash;

  return result;
};

//
// Expose the URL parser and some additional properties that might be useful for
// others.
//
URL.qs = qs;
URL.location = lolcation;
module.exports = URL;
