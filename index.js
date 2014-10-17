'use strict';

/**
 * A DOM and Node.js compatible URL parser which leverages the DOM to do the
 * actual parsing of our URLs.
 *
 * @type {Function}
 * @param {String} url URL that needs to be parsed.
 * @param {Boolean} qs Also parse the query string.
 * @returns {Object} A parsed URL.
 * @api public
 */
var parse = 'undefined' !== typeof document ? function parse(url, qs) {
  var div = document.createElement('div')
    , data = {}
    , key
    , a;

  //
  // Uses an innerHTML property to obtain an absolute URL for older browser
  // support like IE6.
  //
  // @see http://grack.com/blog/2009/11/17/absolutizing-url-in-javascript/
  //
  div.innerHTML = '<a href="' + url + '"/>';
  a = div.firstChild;

  //
  // Transform it from a readOnly object to a read/writable object so we can
  // change some parsed values. This is required if we ever want to override
  // a port number etc. (as browsers remove port 443 and 80 from the URL's).
  //
  for (key in a) {
    if ('string' === typeof a[key] || 'number' === typeof a[key]) {
      data[key] = a[key];
    }
  }

  //
  // encodeURI and decodeURI are needed to normalize URL between IE and non-IE,
  // since IE doesn't encode the href property value and return it
  //
  // @see http://jsfiddle.net/Yq9M8/1/
  //
  data.href = encodeURI(decodeURI(data.href));

  //
  // If we don't obtain a port number (e.g. when using zombie) then try
  // and guess at a value from the 'href' value.
  //
  if (!data.port) {
    var splits = (data.href || '').split('/');
    if (splits.length > 2) {
      var host = splits[2]
        , atSignIndex = host.lastIndexOf('@');

      if (~atSignIndex) host = host.slice(atSignIndex + 1);

      splits = host.split(':');
      if (splits.length === 2) data.port = splits[1];
    }
  }

  //
  // IE quirk: The `protocol` is parsed as ":" when a protocol agnostic URL
  // is used. In this case we extract the value from the `href` value. In
  // addition to that, it's possible in IE11 that the protocol is an string for
  // relative URL's.
  //
  // @see https://github.com/primus/primus/issues/242
  //
  if (!data.protocol || ':' === data.protocol) {
    data.protocol = data.href.substr(0, data.href.indexOf(':') + 1);
  }

  //
  // Safari 5.1.7 (windows) quirk: When parsing a URL without a port number
  // the `port` in the data object will default to "0" instead of the expected
  // "". We're going to do an explicit check on "0" and force it to "".
  //
  if ('0' === data.port) data.port = '';

  //
  // Browsers do not parse authorization information, so we need to extract
  // that from the URL.
  //
  if (~data.href.indexOf('@') && !data.auth) {
    var start = data.protocol.length + 2;
    data.auth = data.href.slice(start, data.href.indexOf(data.pathname, start)).split('@')[0];
  }

  if (qs && 'string' === typeof data.query) {
    data.query = querystring(data.query || data.search);
  }

  data.query = data.query || data.search;
  return data;
} : require('url').parse;

/**
 * Simple query string parser.
 *
 * @param {String} query The query string that needs to be parsed.
 * @returns {Object}
 * @api public
 */
function querystring(query) {
  var parser = /([^=?&]+)=([^&]*)/g
    , result = {}
    , part;

  //
  // Little nifty parsing hack, leverage the fact that RegExp.exec increments
  // the lastIndex property so we can continue executing this loop until we've
  // parsed all results.
  //
  for (;
    part = parser.exec(query);
    result[decodeURIComponent(part[1])] = decodeURIComponent(part[2])
  );

  return result;
}

/**
 * Transform a query string to an object.
 *
 * @param {Object} obj Object that should be transformed.
 * @returns {String}
 * @api public
 */
function querystringify(obj, prefix) {
  prefix = prefix || '';

  var pairs = [];

  //
  // Optionally prefix with a '?' if needed
  //
  if ('string' !== typeof prefix) prefix = '?';

  for (var key in obj) {
    if (obj.hasOwnProperty(key)) {
      pairs.push(encodeURIComponent(key) +'='+ encodeURIComponent(obj[key]));
    }
  }

  return prefix + pairs.join('&');
}

//
// Expose the module.
//
parse.querystringify = querystringify;
parse.querystring = querystring;
module.exports = parse;
