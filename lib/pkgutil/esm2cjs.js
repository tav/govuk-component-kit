// Public Domain (-) 2017-present The Component Kit Authors.
// See the Component Kit UNLICENSE file for details.

const parser = require('cherow')

class Module {
	constructor(source) {
		this.source = source
		this.handle = this.handle.bind(this)
	}
	compile() {
		if (parser.tokenize) {
			// Esprima
			parser.parseModule(this.source, {range: true}, this.handle)
		} else {
			// Cherow
			parser.parseModule(this.source, {
				delegate: this.handle,
				next: true,
				ranges: true,
			})
		}
		return this.source
	}
	handle(node) {
		console.log(node)
	}
}

// `compile` converts import/export declarations in the input source code using
// ES Modules syntax into related calls for CommonJS. Please note that CommonJS
// semantics still apply, i.e.
//
// 1. All imports are evaluated synchronously.
// 2. Imports return actual objects, and not identifiers.
function compile(source) {
	return new Module(source).compile()
}

exports.compile = compile
