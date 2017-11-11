// Public Domain (-) 2017-present The Component Kit Authors.
// See the Component Kit UNLICENSE file for details.

import * as fs from 'fs'

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
