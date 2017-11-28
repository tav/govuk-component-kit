// Public Domain (-) 2017-present The Component Kit Authors.
// See the Component Kit UNLICENSE file for details.

//! The ckit module provides utility functions for use by components.

export function map<T>(iterable: Iterable<T>, callback: (elem: T) => string) {
	const out = []
	for (const elem of iterable) {
		out.push(callback(elem))
	}
	return out
}

export function flatten(elems: any, result: string[] = [], top = true) {
	for (const elem of elems) {
		if (!elem) {
			continue
		}
		if (typeof elem === 'string') {
			result.push(elem)
		} else {
			flatten(elem, result, false)
		}
	}
	if (top) {
		return result.join('')
	}
}
