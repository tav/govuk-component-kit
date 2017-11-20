// Public Domain (-) 2017-present The Component Kit Authors.
// See the Component Kit UNLICENSE file for details.

//! The code module provides support for creating modules programmatically.

import * as fs from 'fs'
import * as log from 'govuk/log'
import * as terminal from 'govuk/terminal'
import {dict} from 'govuk/types'
import * as path from 'path'
import * as ts from 'typescript'
import * as vm from 'vm'

const OPTS: ts.CompilerOptions = {
	experimentalDecorators: true,
	module: ts.ModuleKind.CommonJS,
	noImplicitAny: true,
	sourceMap: true,
	target: ts.ScriptTarget.ESNext,
}

let ignoredImports: Set<string>
let nodeInspector: ts.SourceFile
let tsLib: ts.SourceFile

function createModule(filename: string, source: string) {
	const module = {exports: {}}
	try {
		const wrapper = vm.runInThisContext(
			`(function(module, exports, require) {
'use strict'
${source}
})`,
			{filename, lineOffset: -2}
		)
		wrapper(module, module.exports, require)
	} catch (err) {
		if (err instanceof SyntaxError && err.stack) {
			const lines = err.stack.split('\n')
			const highlight = terminal.red(lines[2].replace(/\^/g, '~'))
			const msg = lines[4].slice(13) // get rid of 'SyntaxError: '
			log.fileError(msg, lines[0], [lines[1], highlight])
		} else {
			log.error(err)
		}
		err.handled = true
		throw err
	}
	return module.exports
}

function genLocals() {
	if (ignoredImports) {
		return
	}

	ignoredImports = new Set(Object.keys(require.cache))
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

	nodeInspector = ts.createSourceFile(
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
		if (!ignoredImports.has(mod)) {
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
	const files = compiler.files
	for (const diagnostic of diagnostics) {
		if (diagnostic.file) {
			const {line, character} = diagnostic.file.getLineAndCharacterOfPosition(
				diagnostic.start!
			)
			const message = ts.flattenDiagnosticMessageText(
				diagnostic.messageText,
				'\n'
			)
			const filename = diagnostic.file.fileName
			const trace: string[] = []
			if (filename.startsWith('@ckit')) {
				// TODO(tav): Handle internal mapping to component source files
			}
			const source = diagnostic.file.text
			const sourceLine = source.split('\n')[line]
			const ctxLine = `${' '.repeat(character)}${terminal.red(
				'~'.repeat(diagnostic.length || 1)
			)}`
			trace.push(sourceLine)
			trace.push(ctxLine)
			log.fileError(message, `${filename}:${line + 1}:${character + 1}`, trace)
			// console.log([diagnostic.start, diagnostic.length])
			// console.log(
			// 	FOO.slice(diagnostic.start, diagnostic.start! + diagnostic.length!)
			// )
		}
	}
}

class Compiler {
	files: {
		[key: string]: {
			js: string
			source: string
			sourcemap: string
		}
	} = {}

	constructor(private sources: dict) {
		for (let [path, source] of Object.entries(sources)) {
			// Replace the .ts extension
			path = path.slice(0, path.length - 3) + '.js'
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
		const source = this.sources[path]
		if (source) {
			return ts.createSourceFile(path, source, langVersion)
		}
		if (path === 'lib.d.ts') {
			return tsLib
		}
		if (path === 'inspector.d.ts') {
			return nodeInspector
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
		if (path.endsWith('.map')) {
			path = path.slice(0, path.length - 4)
			this.files[path].sourcemap = data
		} else {
			this.files[path].js = data
		}
	}
}
