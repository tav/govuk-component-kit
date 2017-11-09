// Public Domain (-) 2017-present The Component Kit Authors.
// See the Component Kit UNLICENSE file for details.

//! The optparse module implements support for parsing command line options.

// `Args` provides a utility class for dealing with flagged arguments.
export class Args extends Array {
	get(...flags: string[]) {
		for (const flag of flags) {
			const idx = this.indexOf(flag)
			if (idx === -1) {
				continue
			}
			return this[idx + 1] || ''
		}
		return ''
	}

	getNumber(fallback: number, ...flags: string[]) {
		const arg = this.get(...flags)
		const value = parseInt(arg, 10)
		if (isNaN(value)) {
			return fallback
		}
		return value
	}
}
