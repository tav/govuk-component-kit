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
	let mgr: component.Manager
	try {
		mgr = new component.Manager(root)
	} catch (err) {
		log.error(err)
		process.exit(1)
	}
	return (ctx: web.Context) => {
		const args = ctx.url.args
		if (!args[0]) {
			return serveRoot(ctx, mgr)
		}
		if (args[0] === 'static') {
			return serveStatic(ctx, mgr, args.slice(1))
		}
		let pageRenderer
		try {
			pageRenderer = mgr.getPageRenderer(args)
		} catch (err) {
			log.error(err)
			return 500
		}
		if (!pageRenderer) {
			return 404
		}
		let resp
		try {
			resp = pageRenderer(ctx, mgr)
		} catch (err) {
			log.error(err)
			return 500
		}
		return resp
	}
}

function getDate(timestamp: number) {
	return new Date(timestamp)
		.toISOString()
		.slice(0, 10)
		.replace(/-/g, '/')
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

function serveRoot(ctx: web.Context, mgr: component.Manager) {
	const cfgPath = path.join(mgr.root, 'site.ts')
	const cfgFile = fs.readFileSync(cfgPath, {encoding: 'utf8'})
	const module = {exports: {Org: '', Title: ''}}
	new Function('module', 'exports', cfgFile)(module, module.exports)
	const cfg = module.exports
	const versions = mgr.getVersionInfos()
	let versionsInfo
	if (versions.length) {
		versionsInfo = `<div class="versions">${versions
			.map(
				v => `<div class="version-info">
<div class="version"><a href="/${v.VersionID}${v.StartURL}">${v.Title}</a></div>
<div class="date">${getDate(v.Created)}</div>
<hr>
</div>`
			)
			.join('\n')}</div>`
	} else {
		versionsInfo = `
<p>Welcome. Create a new prototype version by running:</p>
<blockquote><code>protokit new</code></blockquote>
`
	}
	return `<!doctype html>
<meta charset=utf-8>
<style>
	html { margin: 0; padding: 0; }
	body {
		font-family: "HelveticaNeue", "Helvetica Neue", "Arial"; font-size: 18px;
		margin: 0; padding: 0;
	}
	header { background: #0b0c0c; color: #fff; }
	h1 { font-size: 48px; margin-bottom: 40px; }
	h2 {
		border-bottom: 4px solid rgb(43, 140, 196); font-size: 48px; font-weight: 300;
		margin-bottom: 20px; margin-top: 60px;
	}
	hr { clear: both; width: 0; height: 0; line-height: 0; }
	.center { text-align: center; }
	.header-wrapper { margin: 0 auto; max-width: 965px; padding: 12px 15px; }
	.header-wrapper img {
		width: 36px; height: 32px; margin: 0 6px 0 0; vertical-align: top;
	}
	.header-wrapper strong { font-size: 30px; line-height: 35px; }
	.main { margin: 0 auto; max-width: 965px; padding: 8px 15px; }
	.version-info {
		border-bottom: 1px dotted #ccc; padding: 24px 0 12px 0;
	}
	.versions { max-width: 800px; }
	.versions a { color: #2578a8; }
	.versions a:hover { color: #2b8cc4; }
	.versions .version { float: left; width: 70%; }
	.versions .date { float: left; width: 10%; color: #6f777b; }
</style>
<body>
<header>
	<div class="header-wrapper">
		<img src="/static/base/crown.png">
		<strong>${cfg.Org}</strong>
	</div>
</header>
<div class="main">
	<h1>${cfg.Title}</h1>
	<p>These are the prototypes for ${cfg.Org}.</p>
	<p><strong>Newest on top.</strong></p>
	<h2>Current versions</h2>
	${versionsInfo}
</div>
`
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
	return fs.readFileSync(filepath)
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
	log.setProcessMode()
	const router = createRouter(root)
	const opts = {env, staticBase: '/static/'}
	const dispatcher = new server.Dispatcher(opts, router)
	err = await dispatcher.run(port, host)
	if (err) {
		log.error(err)
		process.exit(1)
	}
	log.success(
		`Protokit server is running in ${env} mode at ${terminal.underline(
			`http://${host || 'localhost'}:${port}`
		)}`
	)
}
