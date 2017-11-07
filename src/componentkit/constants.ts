// Public Domain (-) 2017-present The Component Kit Authors.
// See the Component Kit UNLICENSE file for details.

//! The constants module specifies characters/sets/slices for componentkit.

import * as bytes from 'govuk/bytes'

// Basic character sets.
export const ALPHA_CHARS = bytes.set(
	'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
)

export const ALPHA_NUMERIC_CHARS = bytes.set(
	'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
)

export const LOWER_ALPHA_CHARS = bytes.set('abcdefghijklmnopqrstuvwxyz')
export const NUMERIC_CHARS = bytes.set('0123456789')
export const UPPER_ALPHA_CHARS = bytes.set('ABCDEFGHIJKLMNOPQRSTUVWXYZ')
export const WHITESPACE_CHARS = bytes.set(' \n\t')

// Mixed character sets.
export const LEFT_ANGLE_BRACKET_OR_BRACE_CHARS = bytes.set('<{')

// Compound character sets.
export const IDENT_CHARS = bytes.set(
	'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-'
)

// Whitespace.
export const NEWLINE = bytes.codepoint('\n')
export const SPACE = bytes.codepoint(' ')
export const TAB = bytes.codepoint('\t')

// Delimiters.
export const LEFT_ANGLE_BRACKET = bytes.codepoint('<')
export const RIGHT_ANGLE_BRACKET = bytes.codepoint('>')
export const LEFT_BRACE = bytes.codepoint('{')
export const RIGHT_BRACE = bytes.codepoint('}')
export const LEFT_PAREN = bytes.codepoint('(')
export const RIGHT_PAREN = bytes.codepoint(')')
export const LEFT_SQUARE_BRACKET = bytes.codepoint('[')
export const RIGHT_SQUARE_BRACKET = bytes.codepoint(']')

// Quote marks.
export const BACKTICK = bytes.codepoint('`')
export const DOUBLE_QUOTES = bytes.codepoint('"')
export const SINGLE_QUOTES = bytes.codepoint("'")

// Special chars.
export const AT_SIGN = bytes.codepoint('@')
export const BACKSLASH = bytes.codepoint('\\')
export const COLON = bytes.codepoint(':')
export const COMMA = bytes.codepoint(',')
export const HASH = bytes.codepoint('#')
export const HYPHEN = bytes.codepoint('-')
export const PERIOD = bytes.codepoint('.')
export const SEMICOLON = bytes.codepoint(';')
export const SLASH = bytes.codepoint('/')

// HTML comments.
export const HTML_COMMENT_START_STRING = bytes.from('!--')
export const HTML_COMMENT_END_STRING = bytes.from('-->')

// Template delimiters.
export const LEFT_DOUBLE_BRACE_STRING = bytes.from('{{')
export const RIGHT_DOUBLE_BRACE_STRING = bytes.from('}}')
export const TEMPLATE_BLOCK_OPEN_STRING = bytes.from('{{#')
export const TEMPLATE_BLOCK_CLOSE_STRING = bytes.from('{{/')

// Template keywords.
export const DEFER_STRING = bytes.from('defer}}')
export const ELSE_STRING = bytes.from('else}}')
export const FOR_STRING = bytes.from('for ')
export const IF_STRING = bytes.from('if ')
