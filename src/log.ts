// Public Domain (-) 2017-present The Component Kit Authors.
// See the Component Kit UNLICENSE file for details.

//! The log module provides logging support for configurable backends.

import * as terminal from 'govuk/terminal'

let logged = false

// `error` logs the given message at the ERROR level.
export function error(message: string | Error, err?: Error) {
	if (logged) {
		console.log('')
	} else {
		logged = true
	}
	if (message instanceof Error) {
		err = message
		message = message.toString()
	} else if (err) {
		message = `${message}: ${err.toString()}`
	}
	if (err) {
		console.error(
			terminal.redBg(` ${'ERROR'.padStart(10)} `),
			terminal.yellow(message)
		)
		if (err.stack) {
			console.log('')
			console.log(
				terminal.blue(
					err.stack
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
	if (logged) {
		console.log('')
	} else {
		logged = true
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
	if (logged) {
		console.log('')
	} else {
		logged = true
	}
	console.log(terminal.whiteBg(terminal.black(` ${'INFO'.padStart(10)} `)), obj)
}

// `request` logs the given message at the INFO level.
export function request(method: string, message: string) {
	if (logged) {
		console.log('')
	} else {
		logged = true
	}
	console.log(
		terminal.whiteBg(terminal.black(` ${method.padStart(10)} `)),
		message
	)
}

// `success` logs the given message at the INFO level.
export function success(message: string) {
	if (logged) {
		console.log('')
	} else {
		logged = true
	}
	console.log(terminal.greenBg(` ${'SUCCESS'.padStart(10)} `), message)
}

// Set default handlers for unhandled errors.
process.on('uncaughtException', err => {
	error('Uncaught exception', err)
	process.exit(1)
})

process.on('unhandledRejection', err => {
	error('Unhandled promise rejection', err)
	process.exit(1)
})
