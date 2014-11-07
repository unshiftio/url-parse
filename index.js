'use strict';

var qs = require('querystringify')
  , loca = require('./location');

//
// MOARE: Mother Of All Regular Expressions
//
var regexp = /^(?:(?:(([^:\/#\?]+:)?(?:(?:\/\/)(?:(?:(?:([^:@\/#\?]+)(?:\:([^:@\/#\?]*))?)@)?(([^:\/#\?\]\[]+|\[[^\/\]@#?]+\])(?:\:([0-9]+))?))?)?)?((?:\/?(?:[^\/\?#]+\/+)*)(?:[^\?#]*)))?(\?[^#]+)?)(#.*)?/
  , keys = ',,protocol,username,password,host,hostname,port,pathname,query,hash'.split(',')
  , parts = keys.length;

/**
 * The actual URL instance. Instead of returning an object we've opted-in to
 * create an actual constructor as it's much more memory efficient and
 * faster and it pleases my CDO.
 *
 * @constructor
 * @param {String} address The address we want to parse.
 * @param {Boolean|function} query Parse the query string.
 * @api public
 */
function URL(address, query) {
  if (!(this instanceof URL)) return new URL(address, query);

  for (var i = 0, bits = regexp.exec(address); i < parts; i++) {
    if (keys[i]) this[keys[i]] = bits[i] || loca[keys[i]] || '';
  }

  if (query) {
    if ('function' === typeof query) this.query = query(this.query);
    else this.query = qs.parse(this.query);
  }

  this.href = this.toString();
}

/**
 * Transform the properties back in to a valid and full URL string.
 *
 * @param {Function} query Optional query stringify function.
 * @returns {String}
 * @api public
 */
URL.prototype.toString = function toString(query) {
  var result = this.protocol +'//';

  if (this.username) result += this.username +':'+ this.password +'@';

  result += this.hostname;
  if (this.port) result += ':'+ this.port;

  result += this.pathname;

  if (this.query) {
    if ('string' !== typeof this.query) result += '?'+ (query || qs.stringfy)(this.query);
    else result += this.query;
  }

  if (this.hash) result += this.hash;

  return result;
};

//
// Expose the URL parser.
//
module.exports = URL;
