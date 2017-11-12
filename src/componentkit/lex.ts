// Public Domain (-) 2017-present The Component Kit Authors.
// See the Component Kit UNLICENSE file for details.

import * as _ from 'govuk/componentkit/constants'
import token from 'govuk/componentkit/token'
import * as lexer from 'govuk/lexer'

function htmlComment(s: lexer.State): lexer.StateFunction {
	s.acceptUntil(_.HYPHEN)
	if (s.startsWith(_.HTML_COMMENT_END_STRING)) {
		s.emit(token.TEXT)
		s.consume(_.HTML_COMMENT_END_STRING.length)
		s.emit(token.HTML_COMMENT_END)
		return htmlContent
	}
	if (s.eof()) {
		return
	}
	return htmlComment
}

function htmlContent(s: lexer.State): lexer.StateFunction {
	if (s.acceptUntil(_.LEFT_ANGLE_BRACKET_OR_BRACE_CHARS)) {
		s.emit(token.TEXT)
	}
	if (s.acceptNext(_.LEFT_ANGLE_BRACKET)) {
		if (s.startsWith(_.HTML_COMMENT_START_STRING)) {
			s.emit(token.HTML_COMMENT_START)
			return htmlComment
		}
		if (s.acceptNext(_.SLASH)) {
			s.emit(token.HTML_TAG_CLOSE_LEFT_DELIMITER)
			return htmlTagClose
		}
		if (s.willAcceptNext(_.ALPHA_CHARS)) {
			s.emit(token.HTML_TAG_OPEN_LEFT_DELIMITER)
			return htmlTagOpen
		}
		s.emit(token.TEXT)
		return htmlContent
	}
	if (s.startsWith(_.LEFT_DOUBLE_BRACE_STRING) && s.prev() !== _.BACKSLASH) {
		return template
	}
	if (s.eof()) {
		return
	}
	// If we've reached here, then there's at least a left brace that needs to
	// be consumed.
	s.next()
	s.emit(token.TEXT)
	return htmlContent
}

function htmlTagAttrs(s: lexer.State): lexer.StateFunction {
	return htmlContent
}
function htmlTagClose(s: lexer.State): lexer.StateFunction {
	s.acceptNext(_.ALPHA_CHARS)
	s.acceptWhile(_.IDENT_CHARS)
	if (!s.hasValue()) {
		return s.setError('foo')
	}
	s.emit(token.HTML_TAG)
	if (s.acceptWhile(_.WHITESPACE_CHARS)) {
		s.skip()
	}
	return htmlContent
}

function htmlTagOpen(s: lexer.State): lexer.StateFunction {
	s.acceptNext(_.ALPHA_CHARS)
	s.acceptWhile(_.IDENT_CHARS)
	s.emit(token.HTML_TAG)
	return htmlTagAttrs
}

function mergeTextTokens(s: lexer.State) {
	const tokens = []
	let prev
	for (const t of s.tokens) {
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
	s.tokens = tokens
}

function printTokens(s: lexer.State) {
	for (const t of s.tokens) {
		console.log([token[t.type], t.value])
	}
}

function template(s: lexer.State): lexer.StateFunction {
	return
}

export function html(input: string) {
	console.log(`lexing: ${input}`)
	const l = new lexer.State(input).run(htmlContent)
	mergeTextTokens(l)
	printTokens(l)
	// console.log(s.tokens)
}

// compile(parse(lex(`hello <foo> bar {{props.x}}</foo>`)))
html(`<foo bar=20></foo>`)

// import {Context} from 'service'

// interface Props {
// 	x: string
// }

// export default function Component(ctx: Context, props: Props): string {
// 	return render([
// 		'hello ',
// 		render(foo(ctx, {children: [' bar ', render(escape(props.x))]})),
// 	])
// 	return [foo(ctx, {bar: '20'})]
// }
