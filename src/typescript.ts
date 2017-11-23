// Public Domain (-) 2017-present The Component Kit Authors.
// See the Component Kit UNLICENSE file for details.

import * as log from 'govuk/log'
import * as strings from 'govuk/strings'
import * as terminal from 'govuk/terminal'
import * as ts from 'typescript'
import * as vm from 'vm'

// `module` transpiles the given source into javascript and then evaluates it
// into a commonjs module.
export function module(filename: string, source: string) {
	const js = ts.transpileModule(source, {
		compilerOptions: {
			module: ts.ModuleKind.CommonJS,
			target: ts.ScriptTarget.ESNext,
		},
		fileName: filename,
		reportDiagnostics: true,
	})
	if (reportErrors(js.diagnostics)) {
		return
	}
	const mod = {exports: {}}
	const wrapper = vm.runInThisContext(
		`(function(module, exports, require) {
${js.outputText}
});`,
		{filename}
	)
	wrapper(mod, mod.exports, require)
	return mod.exports
}

// `reportErrors` tries to intelligently print errors from compiling typescript
// code, and returns whether any errors were reported.
export function reportErrors(diagnostics?: ts.Diagnostic[]) {
	if (!diagnostics) {
		return
	}
	let errored = false
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
			if (filename.startsWith('@ckit')) {
				// TODO(tav): Handle internal mapping to component source files
			}
			const source = diagnostic.file.text
			const sourceLine = source.split('\n')[line]
			let tabCount = strings.count(sourceLine, '\t')
			let prefix = ''
			if (tabCount) {
				// TODO(tav): The tabs may not line up if interleaved with other characters.
				if (tabCount > character) {
					tabCount = character
				}
				prefix = '\t'.repeat(tabCount) + ' '.repeat(character - tabCount)
			} else {
				prefix = ' '.repeat(character)
			}
			const ctxLine = `${prefix}${terminal.red(
				'~'.repeat(diagnostic.length || 1)
			)}`
			const trace = [sourceLine, ctxLine]
			errored = true
			log.fileError(message, `${filename}:${line + 1}:${character + 1}`, trace)
		}
	}
	return errored
}
