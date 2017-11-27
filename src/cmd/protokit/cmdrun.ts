// Public Domain (-) 2017-present The Component Kit Authors.
// See the Component Kit UNLICENSE file for details.

import * as fs from 'fs'
import * as common from 'govuk/cmd/protokit/common'
import * as protokit from 'govuk/componentkit/protokit'
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
	txt: 'text/plain',
}

function createRouter(root: string) {
	let mgr: protokit.Manager
	try {
		mgr = new protokit.Manager(root)
	} catch (err) {
		log.error(err)
		process.exit(1)
	}
	return (ctx: web.Context) => {
		const args = ctx.url.args
		if (args[0] === 'static') {
			return serveStatic(ctx, mgr, args.slice(1))
		}
		try {
			return mgr.renderPage(ctx, args)
		} catch (err) {
			log.error(err)
			return 500
		}
	}
}

function getDefaultPort() {
	const port = parseInt(process.env.PORT || '', 10)
	if (isNaN(port)) {
		return 9000
	}
	return port
}

function serveStatic(ctx: web.Context, mgr: protokit.Manager, args: string[]) {
	if (args.length < 3) {
		return 404
	}
	const group = args[0]
	const version = args[1]
	args = args.slice(2)
	if (args[2] === 'components.css') {
		const resp = mgr.getCSS(group, version)
		if (resp === undefined) {
			return 404
		}
		ctx.setHeader('content-type', 'text/css')
		return resp
	}
	let filepath
	if (group === 'base') {
		filepath = path.join(mgr.root, 'base', 'static', ...args)
	} else {
		filepath = path.join(mgr.root, group, version, 'static', ...args)
	}
	if (!os.isFile(filepath)) {
		if (group === 'base') {
			return 404
		}
		filepath = path.join(mgr.root, 'base', 'static', ...args)
		if (!os.isFile(filepath)) {
			return 404
		}
	}
	const ext = args[args.length - 1].split('.').pop() as string
	const ctype = CONTENT_TYPES[ext]
	if (ctype) {
		ctx.setHeader('content-type', ctype)
	}
	return fs.readFileSync(filepath)
}

export async function main(args: optparse.Args) {
	const port = args.getNumber(getDefaultPort(), '-p', '--port')
	const host = args.get('--host')
	const env = args.includes('--prod') ? 'production' : 'dev'
	const root = common.getRootOrExit()
	const router = createRouter(root)
	const opts = {env, staticBase: '/static/'}
	const dispatcher = new server.Dispatcher(opts, router)
	const err = await dispatcher.run(port, host)
	if (err) {
		log.error(err)
		process.exit(1)
	}
	console.log('')
	log.success(
		`Protokit server is running in ${env} mode at ${terminal.underline(
			`http://${host || 'localhost'}:${port}`
		)}`
	)
}
