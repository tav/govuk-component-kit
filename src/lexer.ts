// Public Domain (-) 2017-present The Component Kit Authors.
// See the Component Kit UNLICENSE file for details.

//! Package lexer implements a minimalist lexer framework.
//
// It is inspired by Rob Pike's talk on lexical scanning:
// https://talks.golang.org/2011/lex.slide

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
	type: string
	value: string
}

export type StateFunction = ((l: Lexer) => StateFunction | void) | void | null

// `defineConstants` takes a map of property names and string values and creates
// a mapping of those property names to those string values turned into Buffers.
export function defineConstants(spec: {[key: string]: string}) {
	const constants: {[key: string]: Buffer} = {}
	for (const [k, v] of Object.entries(spec)) {
		constants[k] = Buffer.from(v)
	}
	return constants
}

// `defineTokens` takes an array of strings and creates a mapping using those
// strings as both key and value.
export function defineTokens(spec: string[]) {
	const tokens: {[key: string]: string} = {}
	for (const name of spec) {
		tokens[name] = name
	}
	return tokens
}

// `Lexer` provides the core API for use by state functions.
export class Lexer {
	column: number = 0
	error?: ErrorType = undefined
	input: Buffer
	line: number = 0
	pos: number = 0
	start: number = 0
	tokens: TokenType[] = []

	constructor(input: string) {
		this.input = Buffer.from(input)
	}

	// `accept` consumes the next byte if it's from the set of specified chars. It
	// also returns a boolean indicating whether a byte was consumed or not.
	accept(chars: number[]) {
		if (chars.includes(this.next())) {
			return true
		}
		this.backup()
		return false
	}

	// `acceptRun` keeps consuming bytes while they keep matching the set of
	// specified chars.
	acceptRun(chars: number[]) {
		while (chars.includes(this.next())) {
			continue
		}
		this.backup()
	}

	// `acceptExcluding` consumes the next byte if it isn't in the set of
	// specified chars. It also returns a boolean indicating whethere a byte was
	// consumed or not.
	acceptExcluding(chars: number[]) {
		if (!chars.includes(this.next())) {
			return true
		}
		this.backup()
		return false
	}

	// `acceptUntil` keeps consuming bytes until one matching the set of specified
	// chars is found.
	acceptUntil(chars: number[]) {
		while (!chars.includes(this.next())) {
			continue
		}
		this.backup()
	}

	// `backup` steps back one byte.
	backup() {
		if (this.pos - 1 < this.start) {
			throw new Error(
				'lexer: backup must only be called once per invocation of next()'
			)
		}
		this.pos -= 1
	}

	// `consume` eats the next N bytes without advancing the lexer.
	consume(n: number) {
		for (let i = 0; i < n; i++) {
			this.next()
		}
	}

	// `emit` advances the lexer and adds a new token with the current value and
	// with the specified type.
	emit(type: string) {
		this.tokens.push({
			column: this.column,
			line: this.line,
			pos: this.start,
			type,
			value: this.input.toString('utf8', this.start, this.pos),
		})
		this.advance()
	}

	// `hasValue` returns whether there is a pending value.
	hasValue() {
		return this.pos > this.start
	}

	// `next` returns the next byte or returns EOF if it has reached the end of
	// the input.
	next() {
		if (this.pos >= this.input.length) {
			return EOF
		}
		return this.input[this.pos++]
	}

	// `peek` lets you take a look at the next byte without consuming it.
	peek() {
		const char = this.next()
		this.backup()
		return char
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
	startsWith(prefixChars: number[]) {
		for (let i = 0; i < prefixChars.length; i++) {
			if (this.input[this.pos + i] !== prefixChars[i]) {
				return false
			}
		}
		return true
	}

	private advance() {
		let line = this.line
		let column = this.column
		for (let idx = this.start, end = this.pos; idx < end; idx++) {
			const byte = this.input[idx]
			if (byte === NEWLINE) {
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
}
