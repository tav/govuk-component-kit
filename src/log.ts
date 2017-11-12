// Public Domain (-) 2017-present The Component Kit Authors.
// See the Component Kit UNLICENSE file for details.

//! The log module provides logging support for configurable backends.

import * as terminal from 'govuk/terminal'

function pad(text: string, limit: number) {
	if (text.length > limit) {
		return text.slice(0, limit)
	}
	const out = []
	const missing = limit - text.length
	for (let i = 0; i < missing; i++) {
		out.push(' ')
	}
	out.push(text)
	return out.join('')
}

// `error` logs the given message at the ERROR level.
export function error(message: string, ...params: any[]) {
	console.error(terminal.redBg(` ${pad('ERROR', 9)} `), message, ...params)
}

// `info` logs the given message at the INFO level.
export function info(prefix: string, message: string, ...params: any[]) {
	console.log(terminal.greenBoldBg(` ${pad(prefix, 9)} `), message, ...params)
}

// `request` logs the given message at the INFO level.
export function request(method: string, message: string, ...params: any[]) {
	console.log(terminal.yellowBoldBg(` ${pad(method, 9)} `), message, ...params)
}
