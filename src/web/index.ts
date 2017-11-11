// Public Domain (-) 2017-present The Component Kit Authors.
// See the Component Kit UNLICENSE file for details.

import * as http from 'http'

export interface Options {
	staticBase: string
}

export interface StatusResponse {
	body?: string | Buffer
	code: number
}

export type Response = StatusResponse | string | Buffer | number

export class Context {
	responseHeaders: {[key: string]: string | number} = {}

	constructor(
		public req: http.IncomingMessage,
		public res: http.ServerResponse,
		public opts: Options
	) {}

	// `notfound` can be used to return a 404.
	notfound() {
		return {
			code: 404,
		}
	}

	// `notfound` can be used to return a 301 or 302.
	redirect(path: string, permanent = false) {
		return {
			code: permanent ? 301 : 302,
		}
	}

	print() {
		console.log(this.req)
		console.log(this.res)
	}

	setHeader(key: string, value: string | number) {
		this.responseHeaders[key.toLowerCase()] = value
	}

	staticURL(path: string) {
		return this.opts.staticBase + path
	}
}
