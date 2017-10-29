// Public Domain (-) 2017-present The Component Kit Authors.
// See the Component Kit UNLICENSE file for details.

const fs = require('fs')
const path = require('path')

// `info` returns a listing of the packages found in the `../../lib/` directory,
// grouped by those that are in CommonJS format and those that are in ES Modules
// format, e.g.
//
//     {cjs: ["pkgutil"], esm: ["componentkit", "protokit"]}
//
function info(cjsPackages = ['pkgutil']) {
	const libDir = path.join(path.dirname(path.dirname(__dirname)), 'lib')
	const cjs = []
	const esm = []
	for (let pkg of fs.readdirSync(libDir)) {
		if (fs.statSync(path.join(libDir, pkg)).isDirectory()) {
			if (cjsPackages.includes(pkg)) {
				cjs.push(pkg)
			} else {
				esm.push(pkg)
			}
		}
	}
	return {cjs, esm}
}

exports.info = info
