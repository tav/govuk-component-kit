// Public Domain (-) 2017-present The Component Kit Authors.
// See the Component Kit UNLICENSE file for details.

//! The iter module provides support functionality for dealing with iterators.

// `enumerate` is an iterator for the `[index, value]` of the given iterable.
export function* enumerate<T>(
	iterable: IterableIterator<T> | T[],
	start = 1
): IterableIterator<[number, T]> {
	let idx = start
	for (const elem of iterable) {
		yield [idx, elem]
		idx++
	}
}

// `range` generates the numbers in the given range on demand, inclusive of the
// `stop` value. If only a single parameter is given, it is taken as the `stop`
// value and the generated range will start at 1.
export function* range(start: number, stop?: number, step?: number) {
	if (stop === undefined) {
		stop = start
		start = 1
	}
	if (step) {
		while (stop >= start) {
			yield start
			start += step
		}
	} else {
		while (stop >= start) {
			yield start++
		}
	}
}
