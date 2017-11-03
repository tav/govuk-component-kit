// Public Domain (-) 2017-present The Component Kit Authors.
// See the Component Kit UNLICENSE file for details.

//! Package bytes implements functions for manipulating byte slices.

import {byte} from 'govuk/types'

// `from` converts a string object into a sequence of utf-8 bytes.
export function from(s: string): byte[] {
	const buf = Buffer.from(s)
	const slice = new Array(buf.length)
	for (let i = 0; i < buf.length; i++) {
		slice[i] = buf[i]
	}
	return slice
}

// `string` converts a sequence of utf-8 bytes into a string object.
export function string(b: byte[]): string {
	return Buffer.from(b).toString('utf8')
}
