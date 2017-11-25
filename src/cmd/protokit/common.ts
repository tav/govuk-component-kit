// Public Domain (-) 2017-present The Component Kit Authors.
// See the Component Kit UNLICENSE file for details.

import * as fs from 'fs'
import * as log from 'govuk/log'
import * as os from 'govuk/os'
import * as typescript from 'govuk/typescript'
import * as path from 'path'

export function getGroups(root: string): Array<[string, string]> {
	const groups: Array<[string, string]> = []
	for (const filename of fs.readdirSync(root)) {
		const dir = path.join(root, filename)
		const infoPath = path.join(dir, 'group.ts')
		if (os.isDirectory(dir) && os.isFile(infoPath)) {
			const source = fs.readFileSync(infoPath, {encoding: 'utf8'})
			const info = typescript.module(infoPath, source) as {Title?: string}
			groups.push([info.Title || '', filename])
		}
	}
	return groups
}

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
