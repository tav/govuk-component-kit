// Public Domain (-) 2017-present The Component Kit Authors.
// See the Component Kit UNLICENSE file for details.

import {dict} from 'govuk/types'

export function parse(headers: dict, header: string) {
	const value = headers[header]
	if (!value) {
		return new Acceptable()
	}
}

class Option {
	identity = false
	order = 0
}

export class Acceptable {}
