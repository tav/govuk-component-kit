// Public Domain (-) 2017-present The Component Kit Authors.
// See the Component Kit UNLICENSE file for details.

//! The log module provides logging support for configurable backends.

import * as terminal from 'govuk/terminal'
import * as util from 'util'

// `error` logs the given message at the ERROR level.
export function error(message: string | Error, ...params: any[]) {
	console.log('')
	if (message instanceof Error && !params.length) {
		console.error(
			terminal.redBg(` ${'ERROR'.padStart(9)} `),
			terminal.yellow(message.toString())
		)
		if (message.stack) {
			console.log('')
			console.log(
				terminal.blue(
					message.stack
						.split('\n')
						.slice(1)
						.join('\n')
				)
			)
		}
	} else {
		console.log(
			terminal.redBg(` ${'ERROR'.padStart(9)} `),
			terminal.yellow(util.format(message, ...params))
		)
	}
}

// `info` logs the given message at the INFO level.
export function info(message: string, ...params: any[]) {
	console.log('')
	console.log(terminal.blackBg(` ${'INFO'.padStart(9)} `), message, ...params)
}

// `request` logs the given message at the INFO level.
export function request(method: string, message: string, ...params: any[]) {
	console.log('')
	console.log(
		terminal.whiteBg(terminal.black(` ${method.padStart(9)} `)),
		message,
		...params
	)
}

// `success` logs the given message at the INFO level.
export function success(message: string, ...params: any[]) {
	console.log('')
	console.log(
		terminal.greenBg(` ${'SUCCESS'.padStart(9)} `),
		message,
		...params
	)
}
