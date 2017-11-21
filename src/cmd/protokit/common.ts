// Public Domain (-) 2017-present The Component Kit Authors.
// See the Component Kit UNLICENSE file for details.

import * as log from 'govuk/log'
import * as os from 'govuk/os'
import * as path from 'path'

export function getRoot() {
	let dir = process.cwd()
	while (true) {
		if (os.isDirectory(path.join(dir, '.protokit'))) {
			return [dir, '']
		}
		if (dir === '/') {
			return ['', 'protokit: you do not seem to be inside a protokit repo']
		}
		dir = path.dirname(dir)
	}
}

export function getRootOrExit() {
	const [root, err] = getRoot()
	if (err) {
		log.error(err)
		process.exit(1)
	}
	return root
}
