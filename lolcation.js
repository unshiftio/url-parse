'use strict';

/**
 * These properties should not be copied or inherited from. This is only needed
 * for all non blob URL's as the a blob URL does not include a hash, only the
 * origin.
 *
 * @type {Object}
 * @private
 */
var ignore = { hash: 1, query: 1 }
  , URL;

/**
 * The location object differs when your code is loaded through a normal page,
 * Worker or through a worker using a blob. And with the blobble begins the
 * trouble as the location object will contain the URL of the blob, not the
 * location of the page where our code is loaded in. The actual origin is
 * encoded in the `pathname` so we can thankfully generate a good "default"
 * location from it so we can generate proper relative URL's again.
 *
 * @param {Object} location Optional default location object.
 * @returns {Object} lolcation object.
 * @api public
 */
module.exports = function lolcation(location) {
  location = location || (new Function('return this.location'))() || {};
  URL = URL || require('./');

  var finaldestination = {}
    , key;

  if ('blob:' === location.protocol) {
    finaldestination = new URL(unescape(location.pathname), {});
  } else if ('string' === typeof location) {
    finaldestination = new URL(location, {});
    for (key in ignore) delete finaldestination[key];
  } else for (key in location) {
    if (key in ignore) continue;
    finaldestination[key] = location[key];
  }

  return finaldestination;
};
