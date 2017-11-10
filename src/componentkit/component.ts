// Public Domain (-) 2017-present The Component Kit Authors.
// See the Component Kit UNLICENSE file for details.

//! The component module provides utilities for use by components.

export function map<T>(iterable: Iterable<T>, callback: (elem: T) => string) {
	const out = []
	for (const elem of iterable) {
		out.push(callback(elem))
	}
	return out
}
