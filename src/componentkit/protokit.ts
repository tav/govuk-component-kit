// Public Domain (-) 2017-present The Component Kit Authors.
// See the Component Kit UNLICENSE file for details.

//! The protokit module implements a component manager for Protokit.

import * as code from 'govuk/componentkit/code'
import * as log from 'govuk/log'
import * as os from 'govuk/os'
import {dict} from 'govuk/types'
import * as web from 'govuk/web'
import * as path from 'path'

export interface ErrorPage {
	render(ctx: web.Context, error: Error): string
}

export interface GroupInfo {
	Description: string
	GroupID: string
	Title: string
}

export interface GroupPage {
	render(ctx: web.Context, group: string, versions: VersionInfo[]): string
}

export interface SitePage {
	render(ctx: web.Context, groups: GroupInfo[]): string
}

export interface Page {
	render(ctx: web.Context): string
}

export interface VersionInfo {
	Changes: string[]
	Created: number
	StartURL: string
	Title: string
	VersionID: string
}

interface VersionFiles {
	components: {
		[key: string]: {
			css?: string
			html?: string
			ts?: string
		}
	}
	info: string
	fields: {
		[key: string]: string
	}
	pages: {
		[key: string]: {
			html?: string
			ts?: string
		}
	}
	protokit: {
		group?: string
		site?: string
	}
	text: {
		[key: string]: string
	}
	variables: {
		css?: string
		components?: string
		pages?: string
	}
}

const ALPHA_NUMERIC = /^[A-Za-z0-9]*$/
const ALPHA_UPPER = /^[A-Z]/
const FIELD_IDENT = /^[a-z]*\.[A-Za-z0-9]*$/
const MESSAGE_IDENT = /^[A-Z][A-Z_]*(_[a-z][a-z])?$/
const URL_IDENT = /^[\/A-Za-z0-9-]*$/
const VERSION_IDENT = /^[A-Za-z0-9-]*$/

const VALID_METATYPES = new Set([
	'components',
	'fields',
	'pages',
	'protokit',
	'text',
	'variables',
])

function splitFilename(filename: string) {
	const idx = filename.lastIndexOf('.')
	if (idx === -1) {
		return [filename, '']
	}
	return [filename.slice(0, idx), filename.slice(idx + 1)]
}

function merge() {}

export class Manager {
	id = 0
	pages: {[key: string]: {[key: string]: Page}} = {}
	stylesheets: {[key: string]: dict} = {}
	versions: VersionInfo[] = []

	constructor(public root: string) {
		this.compile(true)
		os.watch(root, this.compile.bind(this))
	}

	getCSS(group: string, version: string) {
		const versions = this.stylesheets[group]
		if (!versions) {
			return
		}
		return versions[version]
	}

	getPage(args: string[]): Page | undefined {
		const [version, ...urlsegments] = args
		const pages = this.pages[version]
		if (!pages) {
			return
		}
		return pages['/' + urlsegments.join('/')]
	}

	renderPage(ctx: web.Context, args: string[]) {
		return 404
	}

	private compile(firstTime?: boolean) {
		this.id++
		if (!firstTime) {
			log.info('Changed detected. Rebuilding components ...')
		}
		try {
			const data = this.load()
			// Get rid of versions without a matching info.ts file.
			for (const version of Object.keys(data)) {
				if (version === 'base') {
					continue
				}
				if (data[version].info === undefined) {
					delete data[version]
				}
			}
			const sources: dict = {}
			for (const [version, spec] of Object.entries(data)) {
				if (version !== 'base') {
					sources[`@ckit/info/${this.id}/${version}`] = spec.info!
				}
			}
			const mods = code.compile(sources)
			if (!mods) {
				log.error('componentkit: aborting building of components due to error')
				return
			}
			const versions: VersionInfo[] = []
			for (const id of Object.keys(mods)) {
				const split = id.split('/')
				const type = split[1]
				const version = split[3]
				if (type === 'info') {
					const info = mods[id] as VersionInfo
					info.Created = info.Created || 0
					info.StartURL = info.StartURL || '/'
					info.Title = info.Title || 'Untitled Prototype'
					info.VersionID = version
					versions.push(info)
				}
			}
			this.versions = versions.sort((a, b) => b.Created - a.Created)
		} catch (err) {
			if (!err.handled) {
				log.error(err)
			}
			log.error('componentkit: aborting building of components due to error')
			return
		}
		if (!firstTime) {
			log.success('Components successfully built!')
		}
		// let lexer = lex.html()
		// if (lexer.error)  {
		// 	//
		// }
		// compile.html(lexer.tokens)
	}

	// `load` walks the prototype directory and gathers the contents of all
	// version config, component, and page files.
	private load() {
		const versions: VersionedData = {}
		for (const [filepath, contents] of os.walk(this.root)) {
			const segments = filepath.split(path.sep)
			if (segments.length < 3) {
				const ver = segments[0]
				if (segments[1] === 'version.ts' && ver !== 'base') {
					if (!versions[ver]) {
						versions[ver] = {components: {}, fields: {}, pages: {}}
					}
					versions[ver].info = contents
				}
				continue
			}
			const version = segments[0]
			if (!VERSION_IDENT.test(version)) {
				continue
			}
			if (!versions[version]) {
				versions[version] = {components: {}, fields: {}, pages: {}}
			}
			const meta = versions[version]
			const metatype = segments[1]
			if (!VALID_METATYPES.has(metatype)) {
				continue
			}
			switch (metatype) {
				case 'components':
					if (segments.length !== 3) {
						continue
					}
					const [name, type] = splitFilename(segments[2])
					if (!(ALPHA_UPPER.test(name) && ALPHA_NUMERIC.test(name))) {
						continue
					}
					if (!meta.components[name]) {
						meta.components[name] = {css: '', html: '', ts: ''}
					}
					switch (type) {
						case 'css':
							meta.components[name].css = contents
							break
						case 'html':
							meta.components[name].html = contents
							break
						case 'ts':
							meta.components[name].ts = contents
							break
					}
					break
				case 'fields':
					if (segments.length !== 3) {
						continue
					}
					const [field, fieldExt] = splitFilename(segments[2])
					if (fieldExt !== 'ts') {
						continue
					}
					if (!FIELD_IDENT.test(field)) {
						continue
					}
					meta.fields[field] = contents
					break
				// case 'messages':
				// 	if (segments.length !== 3) {
				// 		continue
				// 	}
				// 	const [msg, msgExt] = splitFilename(segments[2])
				// 	if (!MESSAGE_IDENT.test(msg)) {
				// 		continue
				// 	}
				// 	if (!meta.messages[msg]) break
				case 'pages':
					let [url, ext] = splitFilename('/' + segments.slice(2).join('/'))
					if (url === '/index') {
						url = '/'
					}
					if (!URL_IDENT.test(url)) {
						continue
					}
					if (!meta.pages[url]) {
						meta.pages[url] = {html: '', ts: ''}
					}
					switch (ext) {
						case 'html':
							meta.pages[url].html = contents
							break
						case 'ts':
							meta.pages[url].ts = contents
							break
					}
					break
			}
		}
		return versions
	}

	private buildPage(source: string) {
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
}
