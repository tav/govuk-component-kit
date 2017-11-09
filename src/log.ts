// Public Domain (-) 2017-present The Component Kit Authors.
// See the Component Kit UNLICENSE file for details.

//! The log module provides logging support for configurable backends.

// `error` logs the given message at the ERROR level.
export function error(message: string, ...params: any[]) {
	console.error('ERROR:', message, ...params)
}

// `info` logs the given message at the INFO level.
export function info(message: string, ...params: any[]) {
	console.log(message, ...params)
}
