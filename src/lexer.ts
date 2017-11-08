// Public Domain (-) 2017-present The Component Kit Authors.
// See the Component Kit UNLICENSE file for details.

//! Package lexer implements a minimalist lexing framework.
//
// It is inspired by Rob Pike's talk on lexical scanning:
// https://talks.golang.org/2011/lex.slide

import {byte} from 'govuk/types'

// `EOF` is used by the Lexer to signal that it has reached the end of the
// input. The value of -1 as an unsigned byte will be `\xff', which is an
// invalid UTF-8 byte, so should not cause any issues when we do searches
// against strings converted into Buffers.
export const EOF = -1

const NEWLINE = '\n'.charCodeAt(0)

export interface ErrorType {
	column: number
	line: number
	pos: number
	value: string
}

export interface TokenType {
	column: number
	line: number
	pos: number
	type: number
	value: string
}

// `StateFunction` represents the state of the lexer as a function that returns
// the next state.
export type StateFunction = ((l: Lexer) => StateFunction | void) | void | null

// `Lexer` provides the core API for use by state functions.
export class Lexer {
	column = 0
	error?: ErrorType = undefined
	input: Buffer
	line = 0
	pos = 0
	start = 0
	tokens: TokenType[] = []
	width = 0

	constructor(input: string) {
		this.input = Buffer.from(input)
	}

	// `acceptNext` consumes the next byte if it's from the set of specified
	// chars. It also returns a boolean indicating whether a byte was consumed
	// or not.
	acceptNext(match: byte | Set<byte>) {
		if (typeof match === 'number') {
			if (match === this.next()) {
				return true
			}
		} else {
			if (match.has(this.next())) {
				return true
			}
		}
		this.backup()
		return false
	}

	// `acceptNextUnless` consumes the next byte if it isn't in the set of
	// specified chars. It also returns a boolean indicating whether a byte was
	// consumed or not.
	acceptNextUnless(match: byte | Set<byte>) {
		if (typeof match === 'number') {
			if (match !== this.next()) {
				return true
			}
		} else {
			if (!match.has(this.next())) {
				return true
			}
		}
		this.backup()
		return false
	}

	// `acceptUntil` keeps consuming bytes until any of the specified chars are
	// seen or EOF is reached. It also returns a boolean indicating whether
	// anything was consumed.
	acceptUntil(match: byte | Set<byte>) {
		let consumed = false
		if (typeof match === 'number') {
			while (true) {
				const char = this.next()
				if (char === EOF) {
					return consumed
				}
				if (match === char) {
					this.backup()
					return consumed
				}
				consumed = true
			}
		} else {
			while (true) {
				const char = this.next()
				if (char === EOF) {
					return consumed
				}
				if (match.has(char)) {
					this.backup()
					return consumed
				}
				consumed = true
			}
		}
	}

	// `acceptWhile` keeps consuming bytes while they keep matching any of the
	// specified chars. It also returns a boolean indicating whether anything
	// was consumed.
	acceptWhile(match: byte | Set<byte>) {
		let consumed = false
		if (typeof match === 'number') {
			while (match === this.next()) {
				consumed = true
				continue
			}
		} else {
			while (match.has(this.next())) {
				consumed = true
				continue
			}
		}
		this.backup()
		return consumed
	}

	// `consume` eats the next N bytes without advancing the lexer.
	consume(n: number) {
		for (let i = 0; i < n; i++) {
			this.next()
		}
	}

	// `emit` advances the lexer and adds a new token with the current value and
	// with the specified type.
	emit(type: number) {
		this.tokens.push({
			column: this.column,
			line: this.line,
			pos: this.start,
			type,
			value: this.input.toString('utf8', this.start, this.pos),
		})
		this.advance()
	}

	// `eof` returns whether the lexer has reached the end of the input.
	eof() {
		return this.pos >= this.input.length
	}

	// `hasValue` returns whether there is a pending value.
	hasValue() {
		return this.pos > this.start
	}

	// `next` returns the next byte or returns EOF if it has reached the end of
	// the input.
	next() {
		if (this.pos >= this.input.length) {
			this.width = 0
			return EOF
		}
		this.width = 1
		return this.input[this.pos++]
	}

	// `peek` lets you take a look at the next byte without consuming it.
	peek() {
		const char = this.next()
		this.backup()
		return char
	}

	// `prev` returns the Nth previous byte.
	prev(n = 1) {
		return this.input[this.pos - n]
	}

	// `run` takes an initial state function and keeps lexing until it runs into
	// an error state or a null/undefined state is returned.
	//
	// This method returns the lexer so that it can be initialised and run on the
	// same line, e.g.
	//
	//     let l = new Lexer(input).run(stateFunction)
	run(state: StateFunction) {
		while (state) {
			state = state(this)
		}
		return this
	}

	// `setError` sets the lexer's `error` property with the given `msg`. It takes
	// an optional `at` parameter which can be used to specify the position
	// (`{line, column, pos}`) of the error. Otherwise, it uses the position of
	// the current value.
	//
	// It also handily returns nothing, so can be used as part of a return
	// statement within a state function to return a null state.
	setError(msg: string, at = {}) {
		this.error = {
			column: this.column,
			line: this.line,
			pos: this.start,
			value: msg,
			...at,
		}
	}

	// `skip` ignores any pending value and advances the lexer. It takes an
	// optional parameter which would advance the lexer by that many bytes.
	skip(n = 0) {
		if (n) {
			this.pos += n
		}
		this.advance()
	}

	// `startsWith` returns whether the next bytes match the given prefix, and
	// doesn't consume any bytes whilst doing the matching.
	startsWith(prefix: byte | byte[]) {
		if (typeof prefix === 'number') {
			return this.input[this.pos] === prefix
		}
		for (let i = 0; i < prefix.length; i++) {
			if (this.input[this.pos + i] !== prefix[i]) {
				return false
			}
		}
		return true
	}

	// `willAcceptNext` returns whether the next byte is from the set of
	// specified chars.
	willAcceptNext(match: byte | Set<byte>) {
		const char = this.peek()
		if (typeof match === 'number') {
			return match === char
		}
		return match.has(char)
	}

	private advance() {
		let line = this.line
		let column = this.column
		for (let idx = this.start, end = this.pos; idx < end; idx++) {
			const char = this.input[idx]
			if (char === NEWLINE) {
				line += 1
				column = 0
			} else {
				column += 1
			}
		}
		this.column = column
		this.line = line
		this.start = this.pos
	}

	private backup() {
		this.pos -= this.width
		this.width = 0
	}
}
