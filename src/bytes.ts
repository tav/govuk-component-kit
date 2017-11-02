// Public Domain (-) 2017-present The Component Kit Authors.
// See the Component Kit UNLICENSE file for details.

import {byte} from 'govuk/types'

// `fromString` converts a string object into a sequence of utf-8 bytes.
export function fromString(s: string): byte[] {
	const buf = Buffer.from(s)
	const slice = new Array(buf.length)
	for (let i = 0; i < buf.length; i++) {
		slice[i] = buf[i]
	}
	return slice
}

// `toString` converts a sequence of utf-8 bytes into a string object.
export function toString(b: byte[]): string {
	return Buffer.from(b).toString('utf8')
}
