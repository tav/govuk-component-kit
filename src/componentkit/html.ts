// Public Domain (-) 2017-present The Component Kit Authors.
// See the Component Kit UNLICENSE file for details.

import * as web from 'govuk/web'

// Self-closing tags are specified as void elements in HTML5:
// http://w3c.github.io/html/syntax.html#writing-html-documents-elements
export const SelfClosingTags = new Set([
	'area',
	'base',
	'br',
	'col',
	'embed',
	'hr',
	'img',
	'input',
	'link',
	'meta',
	'param',
	'source',
	'track',
	'wbr',
])

export interface HTMLProps {
	accesskey?: string
	children?: string | string[]
	class?: string | string[]
	id?: string
	tabindex: string
}

export interface AnchorProps extends HTMLProps {
	download?: string
	href: string | URL
	hreflang?: string
	media?: string
}

export class URL extends String {
	isValid() {
		const url = this.trim()
		return (
			url.startsWith('/') ||
			url.startsWith('https://') ||
			url.startsWith('mailto:') ||
			url.startsWith('tel:') ||
			!url.includes(':')
		)
	}
}

function validateHref(props: AnchorProps) {
	let url = props.href
	if (typeof url === 'string') {
		url = new URL(url)
		props.href = url
	}
	if (!url.isValid()) {
		throw Error(`htmlelems: invalid href value: "${url}"`)
	}
}

export function a(ctx: web.Context, props: AnchorProps, id = ''): string {
	validateHref(props)
	return render('a', props, id)
}

export function div(ctx: web.Context, props: HTMLProps, id = ''): string {
	return render('div', props, id)
}

function render(tag = '', props = {}, id = '', selfClosing = false): string {
	const out = [`<`, tag]
	const attrs = Object.entries(props)
	for (let [attr, val] of attrs) {
		// Special-case the class attribute.
		if (attr === 'class') {
			if (typeof val !== 'string') {
				if (Array.isArray(val)) {
					val = val.join('')
				}
			}
		}
		out.push(' ')
		out.push(attr)
		out.push('="')
		out.push(val)
		out.push('"')
	}
	out.push('>')
	if (!close) {
		out.push('</')
		out.push(tag)
		out.push('>')
	}
	return out.join('')
}
