// Public Domain (-) 2017-present The Component Kit Authors.
// See the Component Kit UNLICENSE file for details.

//! The inspect module looks for relevant metadata in typescript files.

import * as ts from 'typescript'

const COMPONENT_INTERFACES: {[key: string]: boolean} = {
	Props: true,
}

const PAGE_VARIABLES: {[key: string]: boolean} = {
	backlink: true,
	entrypoint: true,
}

function createSourceFile(source: string) {
	return ts.createSourceFile(
		'source.ts',
		source,
		ts.ScriptTarget.ESNext,
		true,
		ts.ScriptKind.TS
	)
}

function getDepth(node: ts.Node) {
	let depth = 0
	while (node.parent) {
		depth++
		node = node.parent
	}
	return depth
}

// `component` finds the relevant metadata from a component's typescript file.
export function component(source: string) {
	const meta: {[key: string]: boolean} = {
		Props: false,
	}
	const inspect = (node: ts.Node) => {
		if (node.kind === ts.SyntaxKind.InterfaceDeclaration) {
			const ident = (node as ts.InterfaceDeclaration).name.escapedText as string
			if (COMPONENT_INTERFACES[ident]) {
				meta[ident] = true
			}
		}
		ts.forEachChild(node, inspect)
	}
	inspect(createSourceFile(source))
	return meta
}

// `page` finds the relevant metadata from a page's typescript file.
export function page(source: string) {
	const meta: {[key: string]: boolean} = {
		backlink: false,
		entrypoint: false,
	}
	const inspect = (node: ts.Node) => {
		if (node.kind === ts.SyntaxKind.FunctionDeclaration) {
			const decl = node as ts.FunctionDeclaration
			if (decl.name) {
				const ident = decl.name.escapedText as string
				if (PAGE_VARIABLES[ident] && getDepth(node) === 1) {
					meta[ident] = true
				}
			}
		} else if (node.kind === ts.SyntaxKind.VariableDeclaration) {
			const decl = node as ts.VariableDeclaration
			const ident = (decl.name as ts.Identifier).escapedText as string
			if (PAGE_VARIABLES[ident] && getDepth(node) === 3) {
				meta[ident] = true
			}
		}
		ts.forEachChild(node, inspect)
	}
	inspect(createSourceFile(source))
	return meta
}
