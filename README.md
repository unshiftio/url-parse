# url-parse
[![Made by unshift](https://img.shields.io/badge/made%20by-unshift-00ffcc.svg?style=flat-square)](http://unshift.io)[![Version npm](http://img.shields.io/npm/v/url-parse.svg?style=flat-square)](http://browsenpm.org/package/url-parse)[![Build Status](http://img.shields.io/travis/unshiftio/url-parse/master.svg?style=flat-square)](https://travis-ci.org/unshiftio/url-parse)[![Dependencies](https://img.shields.io/david/unshiftio/url-parse.svg?style=flat-square)](https://david-dm.org/unshiftio/url-parse)[![Coverage Status](http://img.shields.io/coveralls/unshiftio/url-parse/master.svg?style=flat-square)](https://coveralls.io/r/unshiftio/url-parse?branch=master)[![IRC channel](http://img.shields.io/badge/IRC-irc.freenode.net%23unshift-00a8ff.svg?style=flat-square)](http://webchat.freenode.net/?channels=unshift)

The `url-parse` method exposes two different API interfaces. The `url` interface
that you know from Node.js and the new `URL` interface that is available in the
latest browsers.

Since `0.1` we've moved away from using the DOM's `<a>` element for URL parsing
and moving to a full Regular Expression solution. The main reason for this
change is to make the URL parser available in different JavaScript environments
as you don't always have access to the DOM like `Worker` environments. This
module still have a really small foot print as this module's main intention is
to be bundled with client-side code.

In addition to URL parsing we also expose the bundled `querystringify` module.

## Installation

This module is designed to be used using either browserify or node.js it's
released in the public npm registry and can be installed using:

```
npm install url-parse
```

## Usage

All examples assume that this library is bootstrapped using:

```js
'use strict';

var URL = require('url-parse');
```

To parse an URL simply call the `URL` method with the URL that needs to be
transformed in to an object.

```js
var url = new URL('https://github.com/foo/bar');
```

The `new` keyword is optional but it will save you an extra function invocation.
In the example above we've demonstrated the URL interface, but as said in the
module description we also support the node.js interface. So you could also use
the library in this way:

```js
'use strict';

var parse = require('url-parse')
  , url = parse('https://github.com/foo/bar', true);
```

The returned `url` instance contains the following properties:

- `protocol`: Without slashes `http:`.
- `username`: Username of basic authentication.
- `password`: Password of basic authentication.
- `host`: Host name with port number.
- `hostname`: Host name without port number.
- `port`: Optional port number.
- `pathname`: URL path.
- `query`: Prefixed with `?`
- `hash`: Prefixed with `#`

## URL.stringify()

The returned `url` object comes with a custom `toString` method which will
generate a full URL again when called. The method accepts an extra function
which will stringify the query string for you. If you don't supply a function we
will use our default method.

```js
var location = url.toString(); // http://example.com/whatever/?qs=32
```

## License

MIT
