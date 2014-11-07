'use strict';

var URL = require('./');

//
// The location object differs when your code is loaded through a normal page,
// Worker or through a worker using a blob. And with the blobble begins the
// trouble as location object will contain the URL of the blob, not the location
// of the page where the code is loaded in. The actual origin is encoded in the
// `pathname` so we can thankfully generate a good "default" location from it so
// we can generate proper relative URL's again.
//
var natives = (new Function('return this.location'))() || {}
  , loca = {}
  , key;

if ('blob:' === natives.protocol) loca = new URL(unescape(natives.pathname));
else for (key in natives) {
  loca[key] = natives[key];
}

module.exports = loca;
