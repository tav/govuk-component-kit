// Public Domain (-) 2017-present The Component Kit Authors.
// See the Component Kit UNLICENSE file for details.

import * as http from 'http'
import * as querystring from 'querystring'

export interface Options {
	env: string
	staticBase: string
}

export interface StatusResponse {
	body?: string | Buffer
	code: number
}

export type Response = StatusResponse | string | Buffer | number

export interface URL {
	args: string[]
	params: {[key: string]: string | string[]}
	path: string
	raw: string
}

export class Context {
	responseHeaders: {[key: string]: string | number} = {}
	url: URL

	constructor(
		public req: http.IncomingMessage,
		public res: http.ServerResponse,
		public opts: Options
	) {
		const raw = req.url as string
		let path = raw
		let params = {}
		if (raw.includes('?')) {
			const idx = raw.indexOf('?')
			path = raw.slice(0, idx)
			params = querystring.parse(raw.slice(idx + 1))
		}
		const args = []
		for (const arg of path.split('/').slice(1)) {
			if (arg) {
				args.push(arg)
			}
		}
		this.url = {args, params, path, raw}
	}

	// `notfound` can be used to return a 404.
	notfound() {
		return 404
	}

	// `notfound` can be used to return a 301 or 302.
	redirect(path: string, permanent = false) {
		this.responseHeaders.location = path
		return {
			code: permanent ? 301 : 302,
		}
	}

	// `setHeader` can be used to set a response header.
	setHeader(key: string, value: string | number) {
		this.responseHeaders[key.toLowerCase()] = value
	}

	// `staticURL` returns the URL path for a static asset.
	staticURL(asset: string) {
		return this.opts.staticBase + asset
	}
}
