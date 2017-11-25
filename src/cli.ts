// Public Domain (-) 2017-present The Component Kit Authors.
// See the Component Kit UNLICENSE file for details.

import * as terminal from 'govuk/terminal'
import * as readline from 'readline'

export type Validator = (text: string) => string | boolean

export class Interface {
	private fallback?: string
	private options?: Array<[string, string]>
	private resolve?: (text: string) => void
	private rl: readline.ReadLine
	private selected = 0
	private showingHint = false
	private text = ''
	private validator?: Validator

	constructor() {
		this.rl = readline.createInterface({
			input: process.stdin,
			output: process.stdout,
		})
		this.rl.setPrompt('')
		this.handleKeys = this.handleKeys.bind(this)
	}

	close() {
		this.rl.close()
	}

	error(msg: string) {
		console.log('')
		console.log(terminal.yellow(`    ⚠️   ${msg}  ⚠️`))
	}

	question(text: string, val?: Validator, fallback?: string): Promise<string> {
		this.fallback = fallback
		this.text = text
		this.validator = val
		return new Promise(resolve => {
			this.resolve = resolve
			this.renderQuestion()
		})
	}

	select(text: string, options: Array<[string, string]>): Promise<string> {
		this.options = options
		this.selected = 0
		this.showingHint = false
		return new Promise(resolve => {
			terminal.hideCursor()
			console.log('')
			console.log(terminal.blue(`    ❯ ${text}  `))
			console.log('')
			this.resolve = resolve
			this.renderSelect()
			process.stdin.on('keypress', this.handleKeys)
		})
	}

	success(msg: string) {
		console.log('')
		console.log(terminal.green(`    ✔  ${msg}`))
	}

	private handleKeys(ch: string, key: {name: string}) {
		if (key.name === 'return') {
			this.resolve!(this.options![this.selected][1])
			process.stdin.removeListener('keypress', this.handleKeys)
			if (this.showingHint) {
				terminal.clearLines(4)
			} else {
				terminal.clearLines(1)
			}
			terminal.showCursor()
			return
		}
		if (key.name === 'down') {
			if (this.selected < this.options!.length - 1) {
				this.selected++
				this.updateSelectRendering()
			}
			return
		}
		if (key.name === 'up') {
			if (this.selected > 0) {
				this.selected--
				this.updateSelectRendering()
			}
			return
		}
		terminal.clearLine()
		if (!this.showingHint) {
			console.log('\n')
			console.log(terminal.grey(`    Hint: use the arrow keys`))
			this.showingHint = true
		}
	}

	private renderQuestion() {
		console.log('')
		this.rl.question(terminal.blue(`    ❯ ${this.text}  `), answer => {
			answer = answer.trim()
			if (!answer) {
				if (this.fallback) {
					answer = this.fallback
				} else {
					this.renderQuestion()
					return
				}
			}
			if (this.validator) {
				const resp = this.validator(answer)
				if (typeof resp === 'string') {
					this.error(resp)
					this.renderQuestion()
					return
				}
				if (!resp) {
					this.renderQuestion()
					return
				}
			}
			this.resolve!(answer)
		})
	}

	private renderSelect() {
		let idx = 0
		for (const [label, _] of this.options!) {
			if (idx === this.selected) {
				console.log(`        ${terminal.whiteBold('➤   ' + label)}`)
			} else {
				console.log(`        ${terminal.white('    ' + label)}`)
			}
			idx++
		}
	}

	private updateSelectRendering() {
		if (this.showingHint) {
			terminal.clearLines(this.options!.length + 3)
			this.showingHint = false
		} else {
			terminal.clearLines(this.options!.length)
		}
		this.renderSelect()
	}
}
