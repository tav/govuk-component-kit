// Public Domain (-) 2017-present The Component Kit Authors.
// See the Component Kit UNLICENSE file for details.

const {Lexer} = require('componentkit/lexer')

// Self-closing tags are specified as void elements in HTML5:
// http://w3c.github.io/html/syntax.html#writing-html-documents-elements
const selfClosingTags = new Set([
	'area',
	'base',
	'br',
	'col',
	'embed',
	'hr',
	'img',
	'input',
	'link',
	'meta',
	'param',
	'source',
	'track',
	'wbr',
])
