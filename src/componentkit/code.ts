// Public Domain (-) 2017-present The Component Kit Authors.
// See the Component Kit UNLICENSE file for details.

//! The code module provides support for creating modules programmatically.

import * as fs from 'fs'
import * as log from 'govuk/log'
import {dict} from 'govuk/types'
import * as typescript from 'govuk/typescript'
import * as path from 'path'
import * as ts from 'typescript'
import * as vm from 'vm'

interface Code {
	js: string
	source: string
	sourcemap: string
}

const INITIAL_IMPORTS = new Set(Object.keys(require.cache))

const OPTS: ts.CompilerOptions = {
	experimentalDecorators: true,
	module: ts.ModuleKind.CommonJS,
	noImplicitAny: true,
	sourceMap: true,
	target: ts.ScriptTarget.ESNext,
}

const RECURSIVE_IMPORT = new Error('recursive import')

let inspectorLib: ts.SourceFile
let tsLib: ts.SourceFile

function buildModules(files: {[key: string]: Code}) {
	wipeRequireCache()
	let current = ''
	const modules: {[key: string]: any} = {}
	const seen = new Set()
	const ckitRequire: any = (id: string) => {
		if (id.startsWith('@ckit')) {
			if (seen.has(id)) {
				log.error(
					`componentkit: recursive import of ${id} when creating the ${current} module`
				)
				throw RECURSIVE_IMPORT
			}
			let mod = modules[id]
			if (mod) {
				return mod
			}
			mod = createModule(id, files[id], ckitRequire)
			modules[id] = mod
			return mod
		}
		return require(id)
	}
	ckitRequire.cache = require.cache
	ckitRequire.extensions = require.extensions
	ckitRequire.resolve = require.resolve
	for (const [id, code] of Object.entries(files)) {
		seen.clear()
		seen.add(id)
		if (!modules[id]) {
			current = id
			modules[id] = createModule(id, code, ckitRequire)
		}
	}
	return modules
}

function createModule(filename: string, code: Code, require: any) {
	const module = {exports: {}}
	const wrapper = vm.runInThisContext(
		`(function(module, exports, require) {
${code.js}
});`,
		{filename}
	)
	wrapper(module, module.exports, require)
	return module.exports
}

function genLocals() {
	if (tsLib) {
		return
	}
	const root = path.dirname(require.resolve('typescript'))
	const node = path.join(path.dirname(path.dirname(root)), '@types', 'node')
	const sources = [path.join(node, 'index.d.ts')].concat(
		[
			'es5',
			'es2015.symbol.wellknown',
			'es2015.symbol',
			'es2015.reflect',
			'es2015.proxy',
			'es2015.iterable',
			'es2015.promise',
			'es2015.generator',
			'es2015.collection',
			'es2015.core',
			'es2016.array.include',
			'es2017.intl',
			'es2017.object',
			'es2017.sharedmemory',
			'es2017.string',
			'esnext.asynciterable',
		].map(filename => path.join(root, `lib.${filename}.d.ts`))
	)

	inspectorLib = ts.createSourceFile(
		'inspector.d.ts',
		fs.readFileSync(path.join(node, 'inspector.d.ts'), {encoding: 'utf8'}),
		ts.ScriptTarget.ESNext
	)
	tsLib = ts.createSourceFile(
		'lib.d.ts',
		sources
			.map(path =>
				fs.readFileSync(path, {
					encoding: 'utf8',
				})
			)
			.join('\n'),
		ts.ScriptTarget.ESNext
	)
}

function wipeRequireCache() {
	for (const mod of Object.keys(require.cache)) {
		if (!INITIAL_IMPORTS.has(mod)) {
			delete require.cache[mod]
		}
	}
}

export function compile(sources: dict) {
	genLocals()
	const compiler = new Compiler(sources)
	const prog = ts.createProgram(Object.keys(sources), OPTS, compiler)
	const diagnostics = ts
		.getPreEmitDiagnostics(prog)
		.concat(prog.emit().diagnostics)
	if (typescript.reportErrors(diagnostics)) {
		return
	}
	try {
		return buildModules(compiler.files)
	} catch (err) {
		if (err !== RECURSIVE_IMPORT) {
			log.error(err)
		}
		err.handled = true
		throw err
	}
}

class Compiler {
	files: {[key: string]: Code} = {}

	constructor(private sources: dict) {
		for (const [path, source] of Object.entries(sources)) {
			this.files[path] = {js: '', source, sourcemap: ''}
		}
	}

	getDirectories(path: string) {
		console.log('getdirs:', path)
		return []
	}

	readFile(path: string) {
		return ts.sys.readFile(path, 'utf8') || ''
	}

	fileExists(path: string) {
		if (this.sources[path] || path === 'lib.d.ts') {
			return true
		}
		return ts.sys.fileExists(path)
	}

	getCanonicalFileName(filename: string) {
		return ts.sys.useCaseSensitiveFileNames ? filename : filename.toLowerCase()
	}

	getCurrentDirectory() {
		return ts.sys.getCurrentDirectory()
	}

	getDefaultLibFileName() {
		return 'lib.d.ts'
	}

	getNewLine() {
		return ts.sys.newLine
	}

	getSourceFile(path: string, langVersion: ts.ScriptTarget) {
		if (path.endsWith('.ts')) {
			const source = this.sources[path.slice(0, path.length - 3)]
			if (source) {
				return ts.createSourceFile(path, source, langVersion)
			}
		}
		if (path === 'lib.d.ts') {
			return tsLib
		}
		if (path === 'inspector.d.ts') {
			return inspectorLib
		}
		if (this.fileExists(path)) {
			return ts.createSourceFile(
				path,
				ts.sys.readFile(path, 'utf8') || '',
				langVersion
			)
		}
		log.error(`componentkit: unable to get source file for: ${path}`)
	}

	resolveModuleNames(modules: string[], context: string) {
		const resolved: ts.ResolvedModule[] = []
		for (const mod of modules) {
			if (mod.startsWith('@ckit')) {
				resolved.push({
					resolvedFileName: mod + '.ts',
				})
			} else {
				const lookup = ts.resolveModuleName(mod, context, OPTS, this)
				if (lookup.resolvedModule) {
					resolved.push(lookup.resolvedModule)
				} else {
					resolved.push(null!)
				}
			}
		}
		return resolved
	}

	useCaseSensitiveFileNames() {
		return ts.sys.useCaseSensitiveFileNames
	}

	writeFile(path: string, data: string) {
		if (path.endsWith('.js.map')) {
			path = path.slice(0, path.length - 7)
			this.files[path].sourcemap = data
		} else {
			path = path.slice(0, path.length - 3)
			this.files[path].js = data
		}
	}
}
