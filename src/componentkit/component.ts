// Public Domain (-) 2017-present The Component Kit Authors.
// See the Component Kit UNLICENSE file for details.

//! The component module implements the core component manager.

import * as fs from 'fs'
import * as log from 'govuk/log'
import * as web from 'govuk/web'
import * as ts from 'typescript'

export interface Page {
	render(ctx: web.Context, mgr: Manager): string
}

function throttle(func: any, wait: number) {
	let timerID: NodeJS.Timer | undefined
	return () => {
		if (timerID) {
			clearTimeout(timerID)
		}
		timerID = setTimeout(() => {
			timerID = undefined
			func()
		}, wait)
	}
}

export class Manager {
	cache: {[key: string]: string} = {}
	stylesheets: {[key: string]: string} = {}

	constructor(public root: string) {
		this.compile()
		fs.watch(root, {recursive: true}, throttle(this.compile.bind(this), 1000))
	}

	compile() {
		if (Object.keys(this.cache).length) {
			log.info('..', 'Changed detected. Rebuilding components ...')
		}
		const cache = {}
		const stylesheets = {}
		this.cache = cache
		this.stylesheets = stylesheets
	}

	buildPage(source: string) {
		// ts.createProgram()
		return `
import * as ckit from 'govuk/componentkit/ckit'
import * as html from 'govuk/componentkit/html'
import {enumerate, range} from 'govuk/iter'
import * as web from 'govuk/web'

const a = 20
const a = 40

export function render(ctx: web.Context): string {
	for (const i of range(20)) {
		console.log(i)
	}
	return ${source}
}`
	}

	evalPage(source: string) {
		const exports = {}
		new Function(
			'exports',
			`"use strict"
			${source}
		`
		)(exports)
		return exports
	}

	getCSS(version: string) {
		return this.stylesheets[version] || ''
	}

	getPage(args: string[]): Page | undefined {
		const source = this.buildPage('20')
		const output = ts.transpileModule(source, {
			compilerOptions: {
				module: ts.ModuleKind.CommonJS,
				noImplicitAny: true,
				target: ts.ScriptTarget.ESNext,
			},
			reportDiagnostics: true,
		})
		log.info('??', output)
		const obj = this.evalPage(output.outputText)
		log.info('..', obj)
		let page
		return page
	}
}
