// Public Domain (-) 2017-present The Component Kit Authors.
// See the Component Kit UNLICENSE file for details.

import * as fs from 'fs'
import * as common from 'govuk/cmd/protokit/common'
import * as optparse from 'govuk/optparse'
import * as os from 'govuk/os'
import * as strings from 'govuk/strings'
import * as terminal from 'govuk/terminal'
import * as path from 'path'
import * as readline from 'readline'

export const INFO = 'create a new prototype version'

function createVersion(title: string, dir: string, startURL: string) {
	fs.mkdirSync(dir)
	fs.mkdirSync(path.join(dir, 'components'))
	fs.mkdirSync(path.join(dir, 'fields'))
	fs.mkdirSync(path.join(dir, 'pages'))
	fs.mkdirSync(path.join(dir, 'static'))
	fs.mkdirSync(path.join(dir, 'text'))
	fs.mkdirSync(path.join(dir, 'variables'))
	fs.writeFileSync(
		path.join(dir, 'version.ts'),
		`export const Title = ${JSON.stringify(title)}

export const StartURL = ${JSON.stringify(startURL)}

export const Created = ${Date.now()}
`,
		{encoding: 'utf8'}
	)
}

function logError(msg: string) {
	console.log('')
	console.log(terminal.yellow(`    ⚠️   ${msg}  ⚠️`))
}

function logProgress(msg: string) {
	console.log('')
	console.log(terminal.green(`    ✔  ${msg}`))
}

export async function main(args: optparse.Args) {
	const root = common.getRootOrExit()
	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout,
	})
	rl.setPrompt('')
	let dir = ''
	let version = ''
	const titleError = (msg: string) => {
		logError(msg)
		getTitle()
	}
	const getStart = () => {
		console.log('')
		rl.question(
			terminal.blue('    ❯ What do you want the start URL path to be?  '),
			startURL => {
				startURL = startURL.trim()
				if (!startURL) {
					startURL = '/'
				}
				createVersion(version, dir, startURL)
				logProgress(`Created ${dir}`)
				console.log('')
				rl.close()
			}
		)
	}
	const getTitle = () => {
		console.log('')
		rl.question(
			terminal.blue('    ❯ What is the title of your new prototype?  '),
			title => {
				title = title.trim()
				if (!title) {
					getTitle()
					return
				}
				const id = strings.slugify(title)
				if (!id) {
					titleError(
						'Please enter a title with at least one alphanumeric character'
					)
					return
				}
				dir = path.join(root, id)
				if (os.isDirectory(dir)) {
					titleError(`A directory already exists for ${id}`)
					return
				}
				version = title
				getStart()
			}
		)
	}
	getTitle()
}
