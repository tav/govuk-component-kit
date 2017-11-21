// Public Domain (-) 2017-present The Component Kit Authors.
// See the Component Kit UNLICENSE file for details.

//! The log module provides logging support for configurable backends.

import * as terminal from 'govuk/terminal'

let processMode = false

// `error` logs the given message at the ERROR level.
export function error(message: string | Error) {
	if (processMode) {
		console.log('')
	}
	if (message instanceof Error) {
		console.error(
			terminal.redBg(` ${'ERROR'.padStart(10)} `),
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
			terminal.redBg(` ${'ERROR'.padStart(10)} `),
			terminal.yellow(message)
		)
	}
}

export function fileError(message: string, filename: string, trace: string[]) {
	if (processMode) {
		console.log('')
	}
	console.log(
		terminal.redBg(` ${'ERROR'.padStart(10)} `),
		terminal.yellow(`Error in ${terminal.underline(filename)}`)
	)
	console.log('')
	console.log(trace.map(line => `    ${line}`).join('\n'))
	console.log('')
	console.log(terminal.blue(`    ${message}`))
}

// `info` logs the given object/message at the INFO level.
export function info(obj: string | any) {
	if (processMode) {
		console.log('')
	}
	console.log(terminal.blackBg(` ${'INFO'.padStart(10)} `), obj)
}

// `request` logs the given message at the INFO level.
export function request(method: string, message: string) {
	if (processMode) {
		console.log('')
	}
	console.log(
		terminal.whiteBg(terminal.black(` ${method.padStart(10)} `)),
		message
	)
}

// `setProcessMode` enables process mode logging with an additional line break
// between each log message.
export function setProcessMode() {
	processMode = true
}

// `success` logs the given message at the INFO level.
export function success(message: string) {
	if (processMode) {
		console.log('')
	}
	console.log(terminal.greenBg(` ${'SUCCESS'.padStart(10)} `), message)
}
