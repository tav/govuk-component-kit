// Public Domain (-) 2017-present The Component Kit Authors.
// See the Component Kit UNLICENSE file for details.

import * as fs from 'fs'
import * as cli from 'govuk/cli'
import * as common from 'govuk/cmd/protokit/common'
import * as log from 'govuk/log'
import * as optparse from 'govuk/optparse'
import * as os from 'govuk/os'
import * as strings from 'govuk/strings'
import * as terminal from 'govuk/terminal'
import * as path from 'path'

export const INFO = 'create a new prototype version'

function createVersion(root: string, title: string) {
	const id = strings.slugify(title)
	const dir = path.join(root, id)
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

export const StartURL = '/'

export const Created = ${Date.now()}

export const Changes = []
`,
		{encoding: 'utf8'}
	)
	return id
}

export async function main(args: optparse.Args) {
	const root = common.getRootOrExit()
	const groups = common.getGroups(root)
	if (!groups.length) {
		log.error('Please create a group by running `protokit group`')
		process.exit(1)
	}
	const app = new cli.Interface()
	const group = await app.select(
		'What group is this prototype part of?',
		groups
	)
	const title = await app.question(
		'What is the title of your new prototype?',
		text => {
			const id = strings.slugify(text)
			if (!id) {
				return 'Please enter a title with at least one alphanumeric character'
			}
			const dir = path.join(root, group, id)
			if (os.isDirectory(dir)) {
				return `A directory already exists for ${group}/${id}`
			}
			return true
		}
	)
	const dir = path.join(root, group)
	app.success(
		`Created ${terminal.underline(`${group}/${createVersion(dir, title)}`)}`
	)
	app.close()
	console.log('')
}
