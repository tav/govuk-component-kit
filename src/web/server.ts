// Public Domain (-) 2017-present The Component Kit Authors.
// See the Component Kit UNLICENSE file for details.

//! The server module provides support for running web servers.

import * as log from 'govuk/log'
import * as web from 'govuk/web'
import * as http from 'http'

export type Handler = (ctx: web.Context) => web.Response

export type HTTPHandler = (
	req: http.IncomingMessage,
	res: http.ServerResponse
) => void

// `Dispatcher` handles the logic of handling with HTTP requests.
export class Dispatcher {
	handlers: {[key: string]: Handler} = {}

	constructor(private opts: web.Options, private router?: Handler) {}

	handle(req: http.IncomingMessage, res: http.ServerResponse) {
		log.request(req.method || '-', req.url || '')
		const ctx = new web.Context(req, res, this.opts)
		let handler
		let resp
		if (this.router) {
			handler = this.router
		}
		if (handler) {
			try {
				resp = handler(ctx)
			} catch (err) {
				log.error('web: got unexpected error from handler:', err)
				resp = 500
			}
			if (!resp) {
				resp = ''
			}
		} else {
			resp = 404
		}
		let code = 200
		let body: string | Buffer
		if (typeof resp === 'string' || resp instanceof Buffer) {
			body = resp
		} else if (typeof resp === 'number') {
			code = resp
			switch (code) {
				case 404:
					body = this.response404(ctx)
					break
				case 500:
					body = this.response500(ctx)
					break
				default:
					body = ''
			}
		} else {
			code = resp.code || code
			body = resp.body || ''
			if (!body) {
				switch (code) {
					case 404:
						body = this.response404(ctx)
						break
					case 500:
						body = this.response500(ctx)
						break
				}
			}
		}
		let seenLength = false
		let seenType = false
		for (const [key, value] of Object.entries(ctx.responseHeaders)) {
			switch (key) {
				case 'content-length':
					seenLength = true
					break
				case 'content-type':
					seenType = true
			}
			res.setHeader(key, value)
		}
		if (!seenLength) {
			res.setHeader('content-length', body.length)
		}
		if (!seenType) {
			if (typeof body === 'string' && body.startsWith('<')) {
				res.setHeader('content-type', 'text/html; charset=utf-8')
			} else {
				res.setHeader('content-type', 'application/octet-stream')
			}
		}
		res.statusCode = code
		if (req.method !== 'HEAD') {
			res.write(body)
		}
		res.end()
	}

	register(path: string, handler: Handler) {
		this.handlers[path] = handler
	}

	response404(ctx: web.Context) {
		return `<!doctype html>
	<meta charset=utf-8>
	<title>404: Not Found</title>
	<body>
	<h1>404 Not Found</h1>`
	}

	response500(ctx: web.Context) {
		return `<!doctype html>
	<meta charset=utf-8>
	<title>500: Internal Server Error</title>
	<body>
	<h1>500 Internal Server Error</h1>`
	}

	run(port: number, host: string) {
		return run(port, host, this.handle.bind(this))
	}
}

// `run` starts a web server on the given port/host and returns a promise.
export function run(port: number, host: string, handler: HTTPHandler) {
	let iresolve: (value: string) => void
	const fulfill = (err: any) => {
		if (!err) {
			iresolve('')
			return
		}
		if (err.code === 'EADDRINUSE') {
			iresolve(`server: something is already running on port ${port}`)
			return
		}
		iresolve(
			`server: could not start web server on ${host}${(host && ':') ||
				''}${port}: ${err.toString()}`
		)
	}
	const resp: Promise<string> = new Promise(resolve => {
		iresolve = resolve
	})
	const server = new http.Server(handler)
	server.on('error', fulfill)
	try {
		server.listen(port, host, 4096, fulfill)
	} catch (err) {
		fulfill(err)
	}
	return resp
}
