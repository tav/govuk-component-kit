// Public Domain (-) 2017-present The Component Kit Authors.
// See the Component Kit UNLICENSE file for details.

//! The terminal module provides support functionality for writing to stdout.

import * as iter from 'govuk/iter'

// `SUPPORTS_COLOR` indicates whether the output is likely to display color,
// i.e. if the current process is being run within a text terminal (TTY) context
// in a terminal emulator that supports 256 colors.
export const SUPPORTS_COLOR =
	Boolean(process.stdout.isTTY) && /-256(color)?$/i.test(process.env.TERM || '')

let cursorHidden = true
let restoreCursorRegistered = false

export function black(text: string) {
	return SUPPORTS_COLOR ? `\u001b[30m${text}\u001b[0m` : text
}

export function blackBg(text: string) {
	return SUPPORTS_COLOR ? `\u001b[40m${text}\u001b[0m` : text
}

export function blackBold(text: string) {
	return SUPPORTS_COLOR ? `\u001b[30;1m${text}\u001b[0m` : text
}

export function blackBoldBg(text: string) {
	return SUPPORTS_COLOR ? `\u001b[100;1m${text}\u001b[0m` : text
}

export function blue(text: string) {
	return SUPPORTS_COLOR ? `\u001b[34m${text}\u001b[0m` : text
}

export function blueBg(text: string) {
	return SUPPORTS_COLOR ? `\u001b[44m${text}\u001b[0m` : text
}

export function blueBold(text: string) {
	return SUPPORTS_COLOR ? `\u001b[34;1m${text}\u001b[0m` : text
}

export function blueBoldBg(text: string) {
	return SUPPORTS_COLOR ? `\u001b[104;1m${text}\u001b[0m` : text
}

export function clearLine() {
	process.stdout.write('\r\u001b[2K')
}

export function clearLines(n: number) {
	for (const _ of iter.range(n)) {
		process.stdout.write('\u001b[1A\r\u001b[2K')
	}
}

export function cursorUp() {
	process.stdout.write('\u001b[1A')
}

export function cyan(text: string) {
	return SUPPORTS_COLOR ? `\u001b[36m${text}\u001b[0m` : text
}

export function cyanBg(text: string) {
	return SUPPORTS_COLOR ? `\u001b[46m${text}\u001b[0m` : text
}

export function cyanBold(text: string) {
	return SUPPORTS_COLOR ? `\u001b[36;1m${text}\u001b[0m` : text
}

export function cyanBoldBg(text: string) {
	return SUPPORTS_COLOR ? `\u001b[106;1m${text}\u001b[0m` : text
}

export function green(text: string) {
	return SUPPORTS_COLOR ? `\u001b[32m${text}\u001b[0m` : text
}

export function greenBg(text: string) {
	return SUPPORTS_COLOR ? `\u001b[42m${text}\u001b[0m` : text
}

export function greenBold(text: string) {
	return SUPPORTS_COLOR ? `\u001b[32;1m${text}\u001b[0m` : text
}

export function greenBoldBg(text: string) {
	return SUPPORTS_COLOR ? `\u001b[102;1m${text}\u001b[0m` : text
}

export function grey(text: string) {
	return SUPPORTS_COLOR ? `\u001b[90m${text}\u001b[0m` : text
}

export function hideCursor() {
	process.stdout.write('\u001b[?25l')
	cursorHidden = true
	if (!restoreCursorRegistered) {
		process.on('exit', () => {
			if (cursorHidden) {
				process.stdout.write('\u001b[?25h')
			}
		})
		restoreCursorRegistered = true
	}
}

export function magenta(text: string) {
	return SUPPORTS_COLOR ? `\u001b[35m${text}\u001b[0m` : text
}

export function magentaBg(text: string) {
	return SUPPORTS_COLOR ? `\u001b[45m${text}\u001b[0m` : text
}

export function magentaBold(text: string) {
	return SUPPORTS_COLOR ? `\u001b[35;1m${text}\u001b[0m` : text
}

export function magentaBoldBg(text: string) {
	return SUPPORTS_COLOR ? `\u001b[105;1m${text}\u001b[0m` : text
}

export function red(text: string) {
	return SUPPORTS_COLOR ? `\u001b[31m${text}\u001b[0m` : text
}

export function redBg(text: string) {
	return SUPPORTS_COLOR ? `\u001b[41m${text}\u001b[0m` : text
}

export function redBold(text: string) {
	return SUPPORTS_COLOR ? `\u001b[31;1m${text}\u001b[0m` : text
}

export function redBoldBg(text: string) {
	return SUPPORTS_COLOR ? `\u001b[101;1m${text}\u001b[0m` : text
}

export function showCursor() {
	process.stdout.write('\u001b[?25h')
	cursorHidden = false
}

export function underline(text: string) {
	return SUPPORTS_COLOR ? `\u001b[4m${text}\u001b[0m` : text
}

export function white(text: string) {
	return SUPPORTS_COLOR ? `\u001b[37m${text}\u001b[0m` : text
}

export function whiteBg(text: string) {
	return SUPPORTS_COLOR ? `\u001b[47m${text}\u001b[0m` : text
}

export function whiteBold(text: string) {
	return SUPPORTS_COLOR ? `\u001b[37;1m${text}\u001b[0m` : text
}

export function whiteBoldBg(text: string) {
	return SUPPORTS_COLOR ? `\u001b[107;1m${text}\u001b[0m` : text
}

export function yellow(text: string) {
	return SUPPORTS_COLOR ? `\u001b[33m${text}\u001b[0m` : text
}

export function yellowBg(text: string) {
	return SUPPORTS_COLOR ? `\u001b[43m${text}\u001b[0m` : text
}

export function yellowBold(text: string) {
	return SUPPORTS_COLOR ? `\u001b[33;1m${text}\u001b[0m` : text
}

export function yellowBoldBg(text: string) {
	return SUPPORTS_COLOR ? `\u001b[103;1m${text}\u001b[0m` : text
}

export function printTest() {
	const ignore = ['printTest', 'SUPPORTS_COLOR']
	for (const varname of Object.keys(exports)) {
		if (!ignore.includes(varname)) {
			console.log(exports[varname]('hello world ' + varname))
		}
	}
}
