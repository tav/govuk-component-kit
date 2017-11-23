// Public Domain (-) 2017-present The Component Kit Authors.
// See the Component Kit UNLICENSE file for details.

import * as fs from 'fs'
import * as io from 'govuk/io'
import * as log from 'govuk/log'
import * as os from 'os'
import * as path from 'path'

function* walkFrom(
	dir: string,
	strip: number
): IterableIterator<[string, string]> {
	for (const filename of fs.readdirSync(dir)) {
		const filepath = path.join(dir, filename)
		if (fs.statSync(filepath).isDirectory()) {
			yield* walkFrom(filepath, strip)
		} else {
			const relpath = filepath.slice(strip)
			yield [relpath, fs.readFileSync(filepath, {encoding: 'utf8'})]
		}
	}
}

// `isDirectory` returns whether the given path is a directory. Note that it
// will return false if the path is not accessible due to permissions.
export function isDirectory(path: string) {
	try {
		return fs.statSync(path).isDirectory()
	} catch (err) {
		return false
	}
}

// `isFile` returns whether the given path is a file. Note that it will return
// false if the path is not accessible due to permissions.
export function isFile(path: string) {
	try {
		return fs.statSync(path).isFile()
	} catch (err) {
		return false
	}
}

// `walk` traverses the directory recursively and yields the relative path name
// and contents for all files found.
export function* walk(dir: string) {
	let strip = dir.length
	if (dir[dir.length - 1] !== '/') {
		strip += 1
	}
	yield* walkFrom(dir, strip)
}

export function watch(dir: string, cb: () => void, throttle = 1000) {
	const platform = os.platform()
	if (platform === 'darwin' || platform === 'win32') {
		fs.watch(dir, {recursive: true}, io.throttle(cb, throttle))
		return
	}
	new Watcher(dir, io.throttle(cb, throttle)).run()
	log.error(
		`Sorry, watching directories is not yet implemented for ${platform}`
	)
	process.exit(1)
}

class Watcher {
	constructor(root: string, cb: () => void) {}

	run() {}
}
