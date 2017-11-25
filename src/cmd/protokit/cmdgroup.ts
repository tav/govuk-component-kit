// Public Domain (-) 2017-present The Component Kit Authors.
// See the Component Kit UNLICENSE file for details.

import * as fs from 'fs'
import * as cli from 'govuk/cli'
import * as common from 'govuk/cmd/protokit/common'
import * as optparse from 'govuk/optparse'
import * as os from 'govuk/os'
import * as strings from 'govuk/strings'
import * as terminal from 'govuk/terminal'
import * as path from 'path'

export const INFO = 'add a new group for prototype versions'

function createGroup(root: string, title: string) {
	const id = strings.slugify(title)
	const dir = path.join(root, id)
	fs.mkdirSync(dir)
	fs.writeFileSync(
		path.join(dir, 'group.ts'),
		`export const Title = ${JSON.stringify(title)}

export const Description = \`\`
`,
		{encoding: 'utf8'}
	)
	return id
}

export async function main(args: optparse.Args) {
	const root = common.getRootOrExit()
	const app = new cli.Interface()
	const group = await app.question(
		'What is the name of your new group?',
		text => {
			const id = strings.slugify(text)
			if (!id) {
				return 'Please enter a name with at least one alphanumeric character'
			}
			const dir = path.join(root, id)
			if (os.isDirectory(dir)) {
				return `A directory already exists for ${id}`
			}
			return true
		}
	)
	app.success(`Created ${terminal.underline(createGroup(root, group))}`)
	app.close()
	console.log('')
}
