// Public Domain (-) 2017-present The Component Kit Authors.
// See the Component Kit UNLICENSE file for details.

import * as bytes from 'govuk/bytes'

// Basic character sets.
export const ALPHA = bytes.fromString(
	'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
)

export const ALPHA_LOWER = bytes.fromString('abcdefghijklmnopqrstuvwxyz')
export const ALPHA_UPPER = bytes.fromString('ABCDEFGHIJKLMNOPQRSTUVWXYZ')

export const ALPHA_NUMERIC = bytes.fromString(
	'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
)

export const NUMERIC = bytes.fromString('0123456789')

// Whitespace.
export const NEWLINE = bytes.fromString('\n')
export const SPACE = bytes.fromString(' ')
export const TAB = bytes.fromString('\t')
export const WHITESPACE = bytes.fromString(' \n\t')

// Delimiters.
export const LEFT_ANGLE_BRACKET = bytes.fromString('<')
export const RIGHT_ANGLE_BRACKET = bytes.fromString('>')
export const LEFT_BRACE = bytes.fromString('{')
export const RIGHT_BRACE = bytes.fromString('}')
export const LEFT_PAREN = bytes.fromString('(')
export const RIGHT_PAREN = bytes.fromString(')')
export const LEFT_SQUARE_BRACKET = bytes.fromString('[')
export const RIGHT_SQUARE_BRACKET = bytes.fromString(']')

// Quote marks.
export const BACK_TICK = bytes.fromString('`')
export const DOUBLE_QUOTES = bytes.fromString('"')
export const SINGLE_QUOTES = bytes.fromString("'")

// Special chars.
export const HASH = bytes.fromString('#')
