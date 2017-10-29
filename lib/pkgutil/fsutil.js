// Public Domain (-) 2017-present The Component Kit Authors.
// See the Component Kit UNLICENSE file for details.

const fs = require('fs')

function mkdir(dir) {
	try {
		if (fs.lstatSync(dir).isDirectory()) {
			return
		}
	} catch (err) {}
	fs.mkdirSync(dir)
}

exports.mkdir = mkdir
