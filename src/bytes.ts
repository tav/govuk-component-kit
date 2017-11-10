// Public Domain (-) 2017-present The Component Kit Authors.
// See the Component Kit UNLICENSE file for details.

//! The bytes module implements functions for manipulating byte slices.

import {byte} from 'govuk/types'

// `codepoint` returns the codepoint for the given ASCII character.
export function codepoint(char: string): byte {
	if (char.length !== 1) {
		throw Error(
			`bytes: codepoint must only be called with a single byte ascii char`
		)
	}
	const cp = from(char)[0]
	if (cp > 127) {
		throw TypeError(`bytes: codepoint for "${char}" is outside the ascii range`)
	}
	return cp
}

// `from` converts a string object into a sequence of utf-8 bytes.
export function from(s: string): byte[] {
	const buf = Buffer.from(s)
	const slice = new Array(buf.length)
	for (let i = 0; i < buf.length; i++) {
		slice[i] = buf[i]
	}
	return slice
}

// `set` converts a sequence of characters into a set of bytes.
export function set(s: string): Set<byte> {
	return new Set(from(s))
}

// `string` converts a sequence of utf-8 bytes into a string object.
export function string(b: byte[]): string {
	return Buffer.from(b).toString('utf8')
}
