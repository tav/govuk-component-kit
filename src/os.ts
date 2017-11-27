// Public Domain (-) 2017-present The Component Kit Authors.
// See the Component Kit UNLICENSE file for details.

import * as fs from 'fs'
import * as io from 'govuk/io'
import * as log from 'govuk/log'
import * as os from 'os'
import * as path from 'path'

export function copytree(src: string, dst: string) {}

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

// `rmtree` recursively deletes all the files and directories within and
// including the given `dir`.
export function rmtree(dir: string, check = true) {
	if (check) {
		try {
			fs.statSync(dir)
		} catch (err) {
			// TODO(tav): Ensure that EACCES errors won't be raised here.
			return
		}
	}
	for (const filename of fs.readdirSync(dir)) {
		const filepath = path.join(dir, filename)
		if (fs.statSync(filepath).isDirectory()) {
			rmtree(filepath, false)
		} else {
			fs.unlinkSync(filepath)
		}
	}
	fs.rmdirSync(dir)
}

// `walk` traverses the directory recursively and yields the path name for all
// files found.
export function* walk(dir: string): IterableIterator<string> {
	for (const filename of fs.readdirSync(dir)) {
		const filepath = path.join(dir, filename)
		if (fs.statSync(filepath).isDirectory()) {
			yield* walk(filepath)
		} else {
			yield filepath
		}
	}
}

// `watch` tracks any changes within the given `dir` and all recursive
// subdirectories.
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
