// Public Domain (-) 2017-present The Component Kit Authors.
// See the Component Kit UNLICENSE file for details.

import * as bytes from 'govuk/bytes'

// Basic character sets.
export const ALPHA_CHARS = bytes.from(
	'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
)

export const ALPHA_NUMERIC_CHARS = bytes.from(
	'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
)

export const LOWER_ALPHA_CHARS = bytes.from('abcdefghijklmnopqrstuvwxyz')
export const NUMERIC_CHARS = bytes.from('0123456789')
export const UPPER_ALPHA_CHARS = bytes.from('ABCDEFGHIJKLMNOPQRSTUVWXYZ')
export const WHITESPACE_CHARS = bytes.from(' \n\t')

// Whitespace.
export const NEWLINE = bytes.from('\n')
export const SPACE = bytes.from(' ')
export const TAB = bytes.from('\t')

// Delimiters.
export const LEFT_ANGLE_BRACKET = bytes.from('<')
export const RIGHT_ANGLE_BRACKET = bytes.from('>')
export const LEFT_BRACE = bytes.from('{')
export const RIGHT_BRACE = bytes.from('}')
export const LEFT_PAREN = bytes.from('(')
export const RIGHT_PAREN = bytes.from(')')
export const LEFT_SQUARE_BRACKET = bytes.from('[')
export const RIGHT_SQUARE_BRACKET = bytes.from(']')

// Quote marks.
export const BACKTICK = bytes.from('`')
export const DOUBLE_QUOTES = bytes.from('"')
export const SINGLE_QUOTES = bytes.from("'")

// Special chars.
export const AT_SIGN = bytes.from('@')
export const BACKSLASH = bytes.from('\\')
export const COLON = bytes.from(':')
export const COMMA = bytes.from(',')
export const HASH = bytes.from('#')
export const PERIOD = bytes.from('.')
export const SEMICOLON = bytes.from(';')
export const SLASH = bytes.from('/')

// Template delimiters.
export const LEFT_DOUBLE_BRACE = bytes.from('{{')
export const RIGHT_DOUBLE_BRACE = bytes.from('}}')
export const TEMPLATE_BLOCK_OPEN = bytes.from('{{#')
export const TEMPLATE_BLOCK_CLOSE = bytes.from('{{/')

// Template keywords.
export const DEFER_BLOCK = bytes.from('defer}}')
export const ELSE_BLOCK = bytes.from('else}}')
export const FOR_BLOCK = bytes.from('for ')
export const IF_BLOCK = bytes.from('if ')

// Compound character sets.
export const IDENT_CHARS = bytes.from(
	'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-'
)

// Mixed character sets.
export const LEFT_ANGLE_BRACKET_OR_BRACE_CHARS = bytes.from('<{')
