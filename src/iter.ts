// Public Domain (-) 2017-present The Component Kit Authors.
// See the Component Kit UNLICENSE file for details.

//! The iter module provides support functionality for dealing with iterators.

// `range` generates the numbers in the given range on demand.
function* range(start: number, stop?: number, step?: number) {
	if (stop === undefined) {
		stop = start
		start = 0
	}
	if (stop < start) {
		throw new RangeError(
			'the `start` parameter cannot be less than the `stop` parameter'
		)
	}
	if (step) {
		while (stop > start) {
			yield start
			start += step
		}
	} else {
		while (stop > start) {
			yield start++
		}
	}
}
