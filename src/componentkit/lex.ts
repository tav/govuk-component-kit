// Public Domain (-) 2017-present The Component Kit Authors.
// See the Component Kit UNLICENSE file for details.

import * as _ from 'govuk/componentkit/constants'
import token from 'govuk/componentkit/token'
import * as lexer from 'govuk/lexer'

function htmlAttr(l: lexer.State): lexer.StateFunction {
	if (l.acceptNext(_.RIGHT_ANGLE_BRACKET)) {
		l.emit(token.HTML_TAG_OPEN_RIGHT_DELIMITER)
		return htmlContent
	}
	l.acceptUntil(_.RIGHT_ANGLE_BRACKET_OR_EQUALS_CHARS)
	l.emit(token.HTML_ATTR)
	if (l.acceptNext(_.RIGHT_ANGLE_BRACKET)) {
		l.emit(token.HTML_TAG_OPEN_RIGHT_DELIMITER)
		return htmlContent
	}
	// Skip the equals sign
	l.skip(1)
	return htmlContent
}

function htmlComment(l: lexer.State): lexer.StateFunction {
	l.acceptUntil(_.HYPHEN)
	if (l.startsWith(_.HTML_COMMENT_END_STRING)) {
		l.emit(token.TEXT)
		l.consume(_.HTML_COMMENT_END_STRING.length)
		l.emit(token.HTML_COMMENT_END)
		return htmlContent
	}
	if (l.eof()) {
		return
	}
	return htmlComment
}

function htmlContent(l: lexer.State): lexer.StateFunction {
	if (l.acceptUntil(_.LEFT_ANGLE_BRACKET_OR_BRACE_CHARS)) {
		l.emit(token.TEXT)
	}
	if (l.acceptNext(_.LEFT_ANGLE_BRACKET)) {
		if (l.startsWith(_.HTML_COMMENT_START_STRING)) {
			l.emit(token.HTML_COMMENT_START)
			return htmlComment
		}
		if (l.acceptNext(_.SLASH)) {
			l.emit(token.HTML_TAG_CLOSE_LEFT_DELIMITER)
			return htmlTagClose
		}
		if (l.willAcceptNext(_.ALPHA_CHARS)) {
			l.emit(token.HTML_TAG_OPEN_LEFT_DELIMITER)
			return htmlTagOpen
		}
		l.emit(token.TEXT)
		return htmlContent
	}
	if (l.startsWith(_.LEFT_DOUBLE_BRACE_STRING)) {
		return templateOpen(htmlContent)
	}
	if (l.eof()) {
		return
	}
	// If we've reached here, then there's a single left brace that needs to be
	// consumed.
	l.next()
	l.emit(token.TEXT)
	return htmlContent
}

function htmlTagClose(l: lexer.State): lexer.StateFunction {
	if (l.acceptWhile(_.WHITESPACE_CHARS)) {
		l.skip()
	}
	l.acceptNext(_.ALPHA_CHARS)
	l.acceptWhile(_.IDENT_CHARS)
	if (!l.hasValue()) {
		return l.setError('Expected html tag close')
	}
	l.emit(token.HTML_TAG)
	if (l.acceptWhile(_.WHITESPACE_CHARS)) {
		l.skip()
	}
	if (!l.acceptNext(_.RIGHT_ANGLE_BRACKET)) {
		l.setError('Expected > to close the html tag')
	}
	l.emit(token.HTML_TAG_CLOSE_RIGHT_DELIMITER)
	return htmlContent
}

function htmlTagOpen(l: lexer.State): lexer.StateFunction {
	l.acceptNext(_.ALPHA_CHARS)
	l.acceptWhile(_.IDENT_CHARS)
	l.emit(token.HTML_TAG)
	if (l.acceptNext(_.RIGHT_ANGLE_BRACKET)) {
		l.emit(token.HTML_TAG_OPEN_RIGHT_DELIMITER)
		return htmlContent
	}
	if (!l.acceptWhile(_.WHITESPACE_CHARS)) {
		return l.setError('Expected whitespace after tag opening')
	}
	// Discard the expected whitespace.
	l.skip()
	return htmlAttr
}

function mergeTextTokens(l: lexer.State) {
	const tokens = []
	let prev
	for (const t of l.tokens) {
		if (t.type === token.TEXT) {
			if (prev) {
				prev.value += t.value
			} else {
				prev = t
			}
		} else {
			if (prev) {
				tokens.push(prev)
				prev = undefined
			}
			tokens.push(t)
		}
	}
	if (prev) {
		tokens.push(prev)
	}
	l.tokens = tokens
}

function templateContent(l: lexer.State): lexer.StateFunction {
	if (l.acceptUntil(_.LEFT_BRACE)) {
		l.emit(token.TEXT)
	}
	if (l.startsWith(_.LEFT_DOUBLE_BRACE_STRING)) {
		return templateOpen(templateContent)
	}
	if (l.eof()) {
		return
	}
	// If we've reached here, then there's a single left brace that needs to be
	// consumed.
	l.next()
	l.emit(token.TEXT)
	return templateContent
}

export function css(input: string) {
	const l = new lexer.State(input).run(htmlContent)
	if (!l.error) {
		mergeTextTokens(l)
	}
	return l
}

export function html(input: string) {
	const l = new lexer.State(input).run(htmlContent)
	if (!l.error) {
		mergeTextTokens(l)
	}
	return l
}

export function template(input: string) {
	const l = new lexer.State(input).run(htmlContent)
	if (!l.error) {
		mergeTextTokens(l)
	}
	return l
}

function compile(l: lexer.State, cid: string) {
	if (l.error) {
		console.log('Unexpected error:', l.error.value)
		return
	}
	let idx = 0
	const out = ['[']
	const seen = new Set()
	const stack = []
	const tokens = l.tokens
	while (idx < tokens.length) {
		let t = tokens[idx]
		switch (t.type) {
			case token.HTML_TAG_OPEN_LEFT_DELIMITER:
				t = tokens[++idx]
				if (!t || t.type !== token.HTML_TAG) {
					return 'ERROR'
				}
				if (isLowerCaseTag(t.value)) {
					out.push(`html.${t.value}(ctx, '${cid}', {`)
				} else {
					out.push('')
					seen.add(t.value)
				}
		}
		console.log([token[t.type], t.value])
		idx++
	}
	out.push(']')
	return [out.join(''), seen]
}

function isLowerCaseTag(tag: string) {
	const code = tag.charCodeAt(0)
	return code >= 97 && code <= 122
}

console.log(
	compile(
		html(`<div foo>Check out: <DateField></DateField></div>`),
		'DateField'
	)
)
