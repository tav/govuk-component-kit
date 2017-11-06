// Public Domain (-) 2017-present The Component Kit Authors.
// See the Component Kit UNLICENSE file for details.

//! Package lru implements a basic LRU container.

export class Cache<T> {
	data: {[key: string]: [T, number]} = {}
	size = 0
	timestamp = 0

	constructor(private limit = 100000) {}

	delete(key: string) {
		if (this.data.hasOwnProperty(key)) {
			delete this.data[key]
			this.size--
		}
	}

	get(key: string) {
		if (this.data.hasOwnProperty(key)) {
			const value = this.data[key]
			value[1] = this.timestamp++
			return value[0]
		}
	}

	set(key: string, value: T) {
		if (this.data.hasOwnProperty(key)) {
			this.data[key] = [value, this.timestamp++]
			return
		}
		if (this.size === this.limit) {
			let entries = Object.entries(this.data)
			entries.sort((a, b) => b[1][1] - a[1][1])
			entries = entries.slice(0, this.limit / 2)
			this.data = {}
			this.size = entries.length
			for (const [k, v] of entries) {
				this.data[k] = v
			}
		}
		this.data[key] = [value, this.timestamp++]
		this.size++
	}
}
