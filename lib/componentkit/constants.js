// Public Domain (-) 2017-present The Component Kit Authors.
// See the Component Kit UNLICENSE file for details.

const lexer = require('componentkit/lexer')

module.exports = lexer.defineConstants({
	// Basic character sets.
	ALPHA: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
	ALPHA_LOWER: 'abcdefghijklmnopqrstuvwxyz',
	ALPHA_NUMERIC:
		'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
	ALPHA_UPPER: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
	NUMERIC: '0123456789',

	// Whitespace.
	NEWLINE: '\n',
	SPACE: ' ',
	TAB: '\t',
	WHITESPACE: ' \n\t',

	// Delimiters.
	LEFT_ANGLE_BRACKET: '<',
	RIGHT_ANGLE_BRACKET: '>',
	LEFT_BRACE: '{',
	RIGHT_BRACE: '}',
	LEFT_PAREN: '(',
	RIGHT_PAREN: ')',
	LEFT_SQUARE_BRACKET: '[',
	RIGHT_SQUARE_BRACKET: ']',

	// Quote marks.
	SINGLE_QUOTES: "'",
	DOUBLE_QUOTES: '"',
	BACK_TICK: '`',

	// Special chars.
	HASH: '#',
})
