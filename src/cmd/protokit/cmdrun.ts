// Public Domain (-) 2017-present The Component Kit Authors.
// See the Component Kit UNLICENSE file for details.

import * as fs from 'fs'
import * as component from 'govuk/componentkit/component'
import * as log from 'govuk/log'
import * as optparse from 'govuk/optparse'
import * as os from 'govuk/os'
import * as terminal from 'govuk/terminal'
import * as web from 'govuk/web'
import * as server from 'govuk/web/server'
import * as path from 'path'

export const INFO = 'run the protokit server'
export const FLAGS = `
-p, --port      specify the port to run on [9000]
--prod          enable production mode [false]
`

const CONTENT_TYPES: {[key: string]: string} = {
	css: 'text/css',
	gif: 'image/gif',
	jpeg: 'image/jpeg',
	jpg: 'image/jpeg',
	js: 'application/javascript',
	png: 'image/png',
	svg: 'image/svg+xml',
}

function createRouter(root: string) {
	const mgr = new component.Manager(root)
	return (ctx: web.Context) => {
		const args = ctx.url.args
		if (args[0] === 'static') {
			return serveStatic(ctx, mgr, args.slice(1))
		}
		let page
		try {
			page = mgr.getPage(args)
		} catch (err) {
			log.error(err)
			return 500
		}
		if (!page) {
			return 404
		}
		let resp
		try {
			resp = page.render(ctx, mgr)
		} catch (err) {
			log.error(err)
			return 500
		}
		return resp
	}
}

function getDefaultPort() {
	const port = parseInt(process.env.PORT || '', 10)
	if (isNaN(port)) {
		return 9000
	}
	return port
}

function getProtokitRoot() {
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

function serveStatic(ctx: web.Context, mgr: component.Manager, args: string[]) {
	if (!args[0]) {
		return 404
	}
	if (args[1] === 'components.css') {
		const resp = mgr.getCSS(args[0])
		if (!resp) {
			return 404
		}
		ctx.setHeader('content-type', 'text/css')
		return resp
	}
	const filepath = path.join(mgr.root, args[0], 'static', ...args.slice(1))
	if (!os.isFile(filepath)) {
		return 404
	}
	const ext = args[args.length - 1].split('.').pop() as string
	const ctype = CONTENT_TYPES[ext]
	if (ctype) {
		ctx.setHeader('content-type', ctype)
	}
	return fs.readFileSync(filepath, {encoding: 'utf8'})
}

export async function main(args: optparse.Args) {
	const port = args.getNumber(getDefaultPort(), '-p', '--port')
	const host = args.get('--host')
	const env = args.includes('--prod') ? 'production' : 'dev'
	let [root, err] = getProtokitRoot()
	if (err) {
		log.error(err)
		process.exit(1)
	}
	const router = createRouter(root)
	const opts = {env, staticBase: '/static/'}
	const dispatcher = new server.Dispatcher(opts, router)
	err = await dispatcher.run(port, host)
	if (err) {
		log.error(err)
		process.exit(1)
	}
	log.info(
		'>>',
		`Protokit server is running in ${env} mode at ${terminal.underline(
			`http://${host || 'localhost'}:${port}`
		)}`
	)
}
