// Public Domain (-) 2017-present The Component Kit Authors.
// See the Component Kit UNLICENSE file for details.

import * as lexer from 'govuk/lexer'

export default lexer.defineConstants({
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
	LEFT_BRACE: '{',
	LEFT_PAREN: '(',
	LEFT_SQUARE_BRACKET: '[',
	RIGHT_ANGLE_BRACKET: '>',
	RIGHT_BRACE: '}',
	RIGHT_PAREN: ')',
	RIGHT_SQUARE_BRACKET: ']',

	// Quote marks.
	BACK_TICK: '`',
	DOUBLE_QUOTES: '"',
	SINGLE_QUOTES: "'",

	// Special chars.
	HASH: '#',
})
