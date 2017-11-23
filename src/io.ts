// Public Domain (-) 2017-present The Component Kit Authors.
// See the Component Kit UNLICENSE file for details.

// `Context` represents an I/O deadline.
export interface Context {
	deadline: number
}

// `throttle` returns a callback that can be called repeatedly but will only
// call the underlying `func` at most once within the given `wait` time period.
export function throttle(func: any, wait: number) {
	let timerID: NodeJS.Timer | undefined
	return () => {
		if (timerID) {
			clearTimeout(timerID)
		}
		timerID = setTimeout(() => {
			timerID = undefined
			func()
		}, wait)
	}
}
