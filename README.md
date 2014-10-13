# url-parse

[![Build Status](https://travis-ci.org/unshiftio/url-parse.svg?branch=master)](https://travis-ci.org/unshiftio/url-parse)
[![NPM version](https://badge.fury.io/js/url-parse.svg)](http://badge.fury.io/js/url-parse)
[![Coverage Status](https://img.shields.io/coveralls/unshiftio/url-parse.svg)](https://coveralls.io/r/unshiftio/url-parse?branch=master)

When required on node it will expose the `url` module's `.parse` method. When
required in the browser it will offload the URL parsing to the `<a>` element in
the DOM. This allows the module to be really tiny on the browser and still be
usable on node.

In addition to parsing URL's it also has a really simple query string parser and
query string stringify.

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

var parse = require('url-parse');
```

To parse an URL simply call the `parse` method with the URL that needs to be
transformed in to an object.

```js
var url = parse('https://github.com/foo/bar');
```

The URL should now be somewhat the same as the node.js's `url.parse` output. The
notable exception being that in the browser not all properties would be set to
null.

### parse.querystring()

Parse the given query string and return an object representation from it.

```js
parse.querystring('foo=bar&bar=foo');
parse.querystring('?foo=bar&bar=foo');
```

### parse.querystringify()

Take an object and make a query string from it.

```js
parse.querystringify({ foo: 'bar' });       // foo=bar
parse.querystringify({ foo: 'bar' }, true); // ?foo=bar
parse.querystringify({ foo: 'bar' }, '&');  // &foo=bar
```

## License

MIT
