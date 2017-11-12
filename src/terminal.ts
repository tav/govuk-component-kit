// Public Domain (-) 2017-present The Component Kit Authors.
// See the Component Kit UNLICENSE file for details.

//! The terminal module provides support functionality for writing to stdout.

// `SupportsColor` indicates whether the output is likely to display color, i.e.
// if the current process is being run within a text terminal (TTY) context in a
// terminal emulator that supports 256 colors.
export const SupportsColor =
	Boolean(process.stdout.isTTY) && /-256(color)?$/i.test(process.env.TERM || '')

export function black(text: string) {
	return SupportsColor ? `\u001b[30m${text}\u001b[0m` : text
}

export function blackBg(text: string) {
	return SupportsColor ? `\u001b[40m${text}\u001b[0m` : text
}

export function blackBold(text: string) {
	return SupportsColor ? `\u001b[30;1m${text}\u001b[0m` : text
}

export function blackBoldBg(text: string) {
	return SupportsColor ? `\u001b[100;1m${text}\u001b[0m` : text
}

export function blue(text: string) {
	return SupportsColor ? `\u001b[34m${text}\u001b[0m` : text
}

export function blueBg(text: string) {
	return SupportsColor ? `\u001b[44m${text}\u001b[0m` : text
}

export function blueBold(text: string) {
	return SupportsColor ? `\u001b[34;1m${text}\u001b[0m` : text
}

export function blueBoldBg(text: string) {
	return SupportsColor ? `\u001b[104;1m${text}\u001b[0m` : text
}

export function cyan(text: string) {
	return SupportsColor ? `\u001b[36m${text}\u001b[0m` : text
}

export function cyanBg(text: string) {
	return SupportsColor ? `\u001b[46m${text}\u001b[0m` : text
}

export function cyanBold(text: string) {
	return SupportsColor ? `\u001b[36;1m${text}\u001b[0m` : text
}

export function cyanBoldBg(text: string) {
	return SupportsColor ? `\u001b[106;1m${text}\u001b[0m` : text
}

export function green(text: string) {
	return SupportsColor ? `\u001b[32m${text}\u001b[0m` : text
}

export function greenBg(text: string) {
	return SupportsColor ? `\u001b[42m${text}\u001b[0m` : text
}

export function greenBold(text: string) {
	return SupportsColor ? `\u001b[32;1m${text}\u001b[0m` : text
}

export function greenBoldBg(text: string) {
	return SupportsColor ? `\u001b[102;1m${text}\u001b[0m` : text
}

export function grey(text: string) {
	return SupportsColor ? `\u001b[90m${text}\u001b[0m` : text
}

// export function greenBg(text: string) {
// 	return SupportsColor ? `\u001b[42m${text}\u001b[0m` : text
// }

// export function greenBold(text: string) {
// 	return SupportsColor ? `\u001b[32;1m${text}\u001b[0m` : text
// }

// export function greenBoldBg(text: string) {
// 	return SupportsColor ? `\u001b[42;1m${text}\u001b[0m` : text
// }

export function magenta(text: string) {
	return SupportsColor ? `\u001b[35m${text}\u001b[0m` : text
}

export function magentaBg(text: string) {
	return SupportsColor ? `\u001b[45m${text}\u001b[0m` : text
}

export function magentaBold(text: string) {
	return SupportsColor ? `\u001b[35;1m${text}\u001b[0m` : text
}

export function magentaBoldBg(text: string) {
	return SupportsColor ? `\u001b[105;1m${text}\u001b[0m` : text
}

export function red(text: string) {
	return SupportsColor ? `\u001b[31m${text}\u001b[0m` : text
}

export function redBg(text: string) {
	return SupportsColor ? `\u001b[41m${text}\u001b[0m` : text
}

export function redBold(text: string) {
	return SupportsColor ? `\u001b[31;1m${text}\u001b[0m` : text
}

export function redBoldBg(text: string) {
	return SupportsColor ? `\u001b[101;1m${text}\u001b[0m` : text
}

export function underline(text: string) {
	return SupportsColor ? `\u001b[4m${text}\u001b[0m` : text
}

export function white(text: string) {
	return SupportsColor ? `\u001b[37m${text}\u001b[0m` : text
}

export function whiteBg(text: string) {
	return SupportsColor ? `\u001b[47m${text}\u001b[0m` : text
}

export function whiteBold(text: string) {
	return SupportsColor ? `\u001b[37;1m${text}\u001b[0m` : text
}

export function whiteBoldBg(text: string) {
	return SupportsColor ? `\u001b[107;1m${text}\u001b[0m` : text
}

export function yellow(text: string) {
	return SupportsColor ? `\u001b[33m${text}\u001b[0m` : text
}

export function yellowBg(text: string) {
	return SupportsColor ? `\u001b[43m${text}\u001b[0m` : text
}

export function yellowBold(text: string) {
	return SupportsColor ? `\u001b[33;1m${text}\u001b[0m` : text
}

export function yellowBoldBg(text: string) {
	return SupportsColor ? `\u001b[103;1m${text}\u001b[0m` : text
}

export function printTest() {
	const ignore = ['SupportsColor', 'printTest']
	for (const varname of Object.keys(exports)) {
		if (!ignore.includes(varname)) {
			console.log(exports[varname]('hello world ' + varname))
		}
	}
}
